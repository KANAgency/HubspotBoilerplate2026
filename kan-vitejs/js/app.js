import '../css/style.css'
import { AutoInitializer } from './helpers/autoInit'
import { HMRHelper } from './helpers/hmr'

/* Global */
import VideoLazyLoader from './global/VideoLazyLoader';
import SmoothScroll from "./global/SmoothScroll";

/* Modules */
import Accordion from './modules/Accordion';
import ModalHandler from './modules/ModalHandler';
import SiteAlertBannerHandler from './modules/SiteAlertBanner/SiteAlertBannerHandler';
import NumberCounterHandler from "./modules/NumberCounterHandler";
import Carousel from './modules/Carousel';

class App {
  static instance = null

  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      if (App.instance) return App.instance
      this.modules = [
        SmoothScroll,
        VideoLazyLoader,
        Accordion,
        ModalHandler,
        SiteAlertBannerHandler,
        NumberCounterHandler,
        Carousel
      ]
      this.init()
      App.instance = this
    });
  }

  init() {
    this.autoInitializer = new AutoInitializer(this.modules)
    new HMRHelper(this.autoInitializer)
  }

  registerModule(module) {
    this.modules.push(module)
    this.autoInitializer.initializeModule(module)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
  })
}

const app = new App()
export default app
