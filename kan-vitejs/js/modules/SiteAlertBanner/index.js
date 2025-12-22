const DISMISS_SELECTOR = "[data-alert-dismiss]";

/**
 * Class representing a dismissible site-wide alert banner.
 * Automatically hides the banner after dismissal and remembers user preference using localStorage.
 */
export default class SiteAlertBanner {
  /**
   * Create a new SiteAlertBanner.
   * @param {HTMLElement} bannerElement - The alert banner DOM element.
   * @param {string} [storageKey='siteAlertDismissed'] - A unique key to store dismissal status in localStorage.
   */
  constructor(bannerElement, storageKey) {
    this.banner = bannerElement;
    this.dismissBtn = this.banner?.querySelector(DISMISS_SELECTOR);
    this.storageKey = storageKey;

    if (!this.banner || !this.dismissBtn) return;

    if (sessionStorage.getItem(this.storageKey) === "true") {
      this.hide();
    } else {
      this.init();
    }
  }

  init() {
    this.show();
    this.dismissBtn.addEventListener("click", () => this.dismiss());
  }

  dismiss() {
    this.hide();
    sessionStorage.setItem(this.storageKey, "true");
  }

  hide() {
    this.banner.style.display = "none";
  }

  show() {
    this.banner.style.display = "grid";
  }
}
