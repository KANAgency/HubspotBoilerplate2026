export class AutoInitializer {
  #modules
  #instances = new Map()
  #isRefreshing = false

  constructor(modules = []) {
    this.#modules = modules
    this.initialize()
  }

  async initialize() {
    try {
      await Promise.all(this.#modules.map(Module => this.initializeModule(Module)))
      !this.#isRefreshing && this.#instances.size === this.#modules.length && 
        console.log('🔧 [ App ] Modules initialized')
        console.log('--------------------')
    } catch (error) {
      console.error('Error initializing modules:', error)
    }
  }

  async initializeModule(Module) {
    try {
      await this.destroyModule(Module)
      const instance = new Module()
      typeof instance.init === 'function' && await instance.init()
      this.#instances.set(Module, instance)
      return instance
    } catch (error) {
      console.error(`Module ${Module.name} failed:`, error)
      return null
    }
  }

  async destroyModule(Module) {
    const instance = this.#instances.get(Module)
    if (!instance) return

    try {
      typeof instance.destroy === 'function' && await Promise.resolve(instance.destroy())

      Object.entries(instance)
        .filter(([_, val]) => val && typeof val === 'number')
        .forEach(([_, timer]) => {
          clearTimeout(timer)
          clearInterval(timer)
        })

      Object.getOwnPropertySymbols(instance).forEach(field => instance[field] = null)
      this.#instances.delete(Module)
      await new Promise(resolve => setTimeout(resolve, 50))
    } catch (error) {
      console.error(`Error destroying module ${Module.name}:`, error)
    }
  }

  async refreshModules() {
    if (this.#isRefreshing) return
    
    try {
      this.#isRefreshing = true
      await Promise.all([...this.#instances.keys()].map(Module => this.destroyModule(Module)))
      this.#instances.clear()
      await new Promise(resolve => setTimeout(resolve, 50))
      await this.initialize()
    } catch (error) {
      console.error('Error refreshing modules:', error)
    } finally {
      this.#isRefreshing = false
    }
  }
}