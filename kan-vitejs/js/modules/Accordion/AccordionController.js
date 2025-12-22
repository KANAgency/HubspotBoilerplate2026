const TRIGGER_SELECTOR = "[data-accordion-trigger]";
const PANEL_ACTIVE_CLASS = "is-active";

export default class AccordionController {
  constructor(trigger) {
    this.trigger = trigger;
    this.isOpen = trigger.getAttribute("aria-expanded") === "true";
    this.panel = document.getElementById(
      this.trigger.getAttribute("aria-controls")
    );

    if (!this.panel) return;

    this.setupEvents();
  }

  static panelTriggerSelector() {
    return TRIGGER_SELECTOR;
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    this.panel.classList.add(PANEL_ACTIVE_CLASS);
    this.trigger.setAttribute("aria-expanded", true);
    this.isOpen = true;
  }

  closePanel() {
    this.panel.classList.remove(PANEL_ACTIVE_CLASS);
    this.trigger.setAttribute("aria-expanded", false);
    this.isOpen = false;
  }

  setupEvents() {
    this.trigger.addEventListener("click", () => {
      this.togglePanel();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isOpen) {
        this.closePanel();
      }
    });
  }
}
