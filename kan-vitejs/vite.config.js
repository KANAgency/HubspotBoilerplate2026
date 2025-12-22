import { defineConfig } from 'vite'
import path from 'path'
import postcssCustomMedia from 'postcss-custom-media'
import postcssImport from 'postcss-import'
import postcssImportExpGlob from 'postcss-import-ext-glob'
import postcssNested from 'postcss-nested'
import { spawn } from 'child_process'
import terser from '@rollup/plugin-terser'
import cssnano from 'cssnano'

class ViteConfig {
  constructor() {
    this.config = {
      proxy: {
        path: '/sv/home',
        target: 'https://144555236.hs-sites-eu1.com/'
      },
      dev: {
        host: 'localhost',
        port: '5173',
        get url() { return `${this.host}:${this.port}` }
      },
      paths: {
        kanTheme: '../kan-theme',
        get templates() { return path.join(this.kanTheme, 'templates') },
        get modules() { return path.join(this.kanTheme, 'modules') },
        get assets() { return path.join(this.kanTheme, 'assets') }
      }
    }
  }

  createBuildPlugin() {
    let currentBuild = null;
    return {
      enforce: 'post',
      apply: 'serve',
      configureServer: server => {
        const patterns = ['css/**/*.css', 'app/**/*.js', 'js/**/*.js'];
        patterns.forEach(p => server.watcher.add(p));
        let buildTimeout;
        server.watcher.on('change', async path => {
          if (path.match(/\.css$/)) {
            // Clear any existing timeout to prevent multiple builds
            clearTimeout(buildTimeout);
            // Kill existing build process if it's running
            if (currentBuild) {
              try {
                process.kill(currentBuild.pid, 'SIGTERM');
              } catch (error) {
                server.config.logger.warn('Error killing previous build process:', error);
              }
            }
            buildTimeout = setTimeout(() => {
              // Spawn a new build process
              currentBuild = spawn('npm', ['run', 'build'], {
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true
              });
              // Capture stdout
              currentBuild.stdout.on('data', (data) => {
                server.config.logger.info(`Build stdout: ${data}`);
              });
              // Capture stderr
              currentBuild.stderr.on('data', (data) => {
                server.config.logger.error(`Build stderr: ${data}`);
              });
              // Log build status with more details
              currentBuild.on('close', (code, signal) => {
                server.config.logger.info(`Build process closed with code: ${code}, signal: ${signal}`);
                if (code === null) {
                  server.config.logger.error('Build process terminated by signal');
                }
                // Clear the current build reference
                currentBuild = null;
              });
              // Handle any potential errors
              currentBuild.on('error', error => {
                server.config.logger.error('Build process error:', error);
                currentBuild = null;
              });
            }, 500);
          }
        });
        // Cleanup handler to ensure processes are killed when server closes
        server.httpServer.on('close', () => {
          if (currentBuild) {
            try {
              process.kill(currentBuild.pid, 'SIGTERM');
            } catch (error) {
              server.config.logger.warn('Error killing build process on server close:', error);
            }
          }
        });
      }
    };
  }

  createHubspotPlugin() {
    return {
      enforce: 'post',
      apply: 'serve',
      configureServer: server => {
        [this.config.paths.templates, this.config.paths.modules]
          .map(p => path.resolve(__dirname, p))
          .forEach(p => server.watcher.add(p))

        server.watcher.on('change', path => {
          if (path.includes('kan-theme/') && !path.match(/\.(js|css)$/)) {
            setTimeout(() => server.ws.send({ type: 'full-reload', path: '*', timestamp: Date.now() }), 2000)
          }
        })
      }
    }
  }

  createProxyConfig() {
    const handleHtmlResponse = (body, server) => {
      body = body
        .replace(/<script[^>]*hubspotusercontent[^>]*template_app[^>]*><\/script>/g, '')
        .replace(/<style[^>]*hubspotusercontent[^>]*template_style[^>]*><\/style>/g, '')
        .replace(/<script[^>]*scriptloader\/\d+\.js[^>]*><\/script>/g, '')
        .replace(/(<script[^>]+src="|<link[^>]+href=")([^"]+)"/g, (match, tag, url) => {
          if (url.includes('hubspotusercontent') && (url.includes('template_app') || url.includes('scriptloader'))) return ''
          return `${tag}${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}"`
        })
        .replace('</head>', `
          <script>
            const originalCreateElement = document.createElement
            document.createElement = function(tag) {
              const el = originalCreateElement.call(document, tag)
              if (tag.toLowerCase() === 'script') {
                const originalSetAttr = el.setAttribute
                el.setAttribute = function(name, value) {
                  if (name === 'src' && (
                    (value.includes('hubspotusercontent') && value.includes('template_app')) ||
                    value.includes('scriptloader')
                  )) return
                  return originalSetAttr.call(this, name, value)
                }
              }
              return el
            }
          </script>
          <script type="module" src="http://${this.config.dev.url}/js/app.js?v=${Date.now()}"></script>
        </head>`)
      return body
    }

    return {
      [this.config.proxy.path]: {
        target: this.config.proxy.target,
        changeOrigin: true,
        secure: false,
        headers: { 'Accept-Encoding': 'identity' },
        configure: proxy => {
          proxy.on('proxyReq', (proxyReq, req) => {
            proxyReq.removeHeader('accept-encoding')
            const timestamp = Date.now()
            proxyReq.path += proxyReq.path.includes('?') ? `&t=${timestamp}` : `?t=${timestamp}`
          })

          proxy.on('proxyRes', (proxyRes, req, res) => {
            Object.assign(proxyRes.headers, {
              'content-encoding': undefined,
              'cache-control': 'no-cache, no-store, must-revalidate',
              'pragma': 'no-cache',
              'expires': '0'
            })

            if (proxyRes.headers['content-type']?.includes('text/html')) {
              let body = ''
              const originalWrite = res.write
              const originalEnd = res.end

              res.write = chunk => (body += chunk.toString('utf8'), true)
              res.end = chunk => {
                if (chunk) body += chunk.toString('utf8')
                originalEnd.call(res, handleHtmlResponse(body, proxy))
              }
            }
          })
        }
      },
      '/hs/scriptloader': {
        target: this.config.proxy.target,
        changeOrigin: true,
        secure: false,
        bypass: (req, res) => {
          res.statusCode = 200
          res.end('')
          return true
        }
      }
    }
  }

  generate() {
    return defineConfig(({ mode, command }) => {
      const isProduction = process.env.NODE_ENV === 'production'
      const suffix = isProduction ? '.min' : ''

      console.log('NODE_ENV:', process.env.NODE_ENV)
      console.log('Is Production:', isProduction)
      console.log('File Suffix:', suffix)

      return {
        server: {
          host: this.config.dev.host,
          port: this.config.dev.port,
          watch: { ignored: ['!**/node_modules/**'] },
          proxy: this.createProxyConfig(),
          fs: {
            allow: ['..']
          }
        },
        optimizeDeps: {
          force: true
        },
        css: {
          devSourcemap: true,
          postcss: {
            plugins: [
              postcssImportExpGlob(),
              postcssImport(),
              postcssCustomMedia(),
              postcssNested(),
              ...(isProduction ? [cssnano()] : [])
            ]
          }
        },
        build: {
          sourcemap: true,
          outDir: this.config.paths.assets,
          emptyOutDir: false,
          watch: true,
          manifest: true,
          minify: isProduction,
          target: 'es2015',
          cssMinify: isProduction,
          rollupOptions: {
            input: {
              app: path.resolve(__dirname, 'js/app.js'),
              style: path.resolve(__dirname, 'css/style.css')
            },
            output: {
              format: 'es',
              generatedCode: {
                preset: 'es2015',
                symbols: false
              },
              inlineDynamicImports: false,
              entryFileNames: `js/[name]${suffix}.js`,
              chunkFileNames: `js/[name]${suffix}.js`,
              assetFileNames: (assetInfo) => {
                if (/\.(css)$/i.test(assetInfo.name)) {
                  return `css/[name]${suffix}[extname]`
                }
                return `assets/[name]${suffix}[extname]`
              }
            },
            plugins: isProduction ? [
              terser({
                compress: {
                  passes: 2,
                  drop_console: true,
                  drop_debugger: true,
                  pure_funcs: ['console.log'],
                  sequences: true,
                  dead_code: true,
                  conditionals: true,
                  booleans: true,
                  unused: true,
                  if_return: true,
                  join_vars: true
                },
                mangle: true,
                format: {
                  comments: false,
                  ecma: 2015
                }
              })
            ] : []
          }
        },
        plugins: [
          this.createBuildPlugin(),
          this.createHubspotPlugin()
        ]
      }
    })
  }
}

export default new ViteConfig().generate()
