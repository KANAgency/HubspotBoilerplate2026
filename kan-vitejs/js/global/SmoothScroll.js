import Lenis from "lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Allow scrolling inside */
const BLOCKED_IDS = ["hs-banner-parent"];
const BLOCKED_CLASSES = ["hsfc-DropdownOptions"];

let instance = null;
export default class SmoothScroll {
  constructor() {
    if (instance) {
      return instance;
    }

    /* Global access */
    instance = this;
    window.smoothScroll = this;

    this.lenis = null;
  }

  init() {
    this.lenis = new Lenis({
      autoRaf: true,
      duration: 0.8,
      prevent: (node) => {
        if (BLOCKED_IDS.includes(node.id)) return true;
        for (const cls of BLOCKED_CLASSES) {
          if (node.classList.contains(cls)) return true;
        }
        return false;
      }
    });

    this.syncGsap();

    if (window.location.hash) {
      const scrollToElement = document.querySelector(window.location.hash);
      this.scrollTo(scrollToElement);
    }

  }

  start() {
    this.lenis.start();
  }
  stop() {
    this.lenis.stop();
  }

  scrollTo(target, options = {
    duration: 0.3,
  }) {
    if (!this.lenis) {
      console.warn("Lenis is not initialized. Call init() first.");
      return;
    }

    this.lenis.scrollTo(target, options);
  }

  destroy() {
    this.lenis.destroy();
    this.lenis = null;
    instance = null;
  }

  syncGsap() {
    // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
    this.lenis.on("scroll", ScrollTrigger.update);

    // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
    // This ensures Lenis's smooth scroll animation updates on each GSAP tick
    gsap.ticker.add((time) => {
      this.lenis?.raf(time * 1000); // Convert time from seconds to milliseconds
    });

    // Disable lag smoothing in GSAP to prevent any delay in scroll animations
    gsap.ticker.lagSmoothing(0);
  }
}
