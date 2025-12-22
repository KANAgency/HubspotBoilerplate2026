export class HMRHelper {
  constructor(autoInitializer) {
    this.autoInitializer = autoInitializer
    this.setupHMR()
  }

  setupHMR() {
    if (!import.meta.hot) return

    // Listen for updates but don't accept them
    import.meta.hot.on('vite:beforeUpdate', ({ updates }) => {
      const jsUpdates = updates.filter(update => update.path.endsWith('.js'))
      if (jsUpdates.length) {
        console.log(` [ HMR ] Update for: ${jsUpdates[0].path}`)
        this.autoInitializer?.refreshModules()
      }
    })
  }
}
