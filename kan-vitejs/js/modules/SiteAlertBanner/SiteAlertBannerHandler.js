import SiteAlertBanner from './index.js';

const STORAGE_KEY_ATTR = 'data-storage-key';
const ALERT_SELECTOR = '[data-alert-banner]';

export default class SiteAlertBannerHandler {
  constructor() {
    this.banners = document.querySelectorAll(
      ALERT_SELECTOR
    );
    this.init();
  }

  init() {
    this.banners.forEach((banner) => {
        const storageKey = banner.getAttribute(STORAGE_KEY_ATTR) || 'siteAlertDismissed';
        new SiteAlertBanner(banner, storageKey);
    });
  }
}