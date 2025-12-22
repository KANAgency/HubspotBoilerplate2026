import AccordionController from "./AccordionController";

const ACCORDION_SELECTOR = "[data-name=accordion]";
const LANG_PICKER = "[data-lang-picker]";

export default class Accordion {
  constructor() {
    this.accordions = document.querySelectorAll([ACCORDION_SELECTOR, LANG_PICKER]);
  }

  init() {
    this.setupPanels();
  }

  setupPanels() {
    this.accordions.forEach((accordion) => {
      const triggers = accordion.querySelectorAll(
        AccordionController.panelTriggerSelector()
      );
      triggers.forEach((trigger) => {
        new AccordionController(trigger);
      });
    });
  }
}
