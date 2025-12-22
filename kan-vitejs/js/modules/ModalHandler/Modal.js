const MODAL_ATTRIBUTE = "data-modal";
const MODAL_SELECTOR = `[${MODAL_ATTRIBUTE}]`;
const MODAL_OPEN_ATTRIBUTE = "data-modal-open";
const MODAL_CLOSE_ATTRIBUTE = "data-modal-close";

export default class Modal {
  constructor(modal) {
    this.modal = modal;
    this.modalId = this.modal.getAttribute(MODAL_ATTRIBUTE);
    
    if (!this.modalId) {
      console.error(
        `Modal element is missing a value for the "${MODAL_ATTRIBUTE}" attribute.`
      );
      return;
    }

    this.openModalButtons = document.querySelectorAll(
      `[${MODAL_OPEN_ATTRIBUTE}="${this.modalId}"]`
    );
    this.closeModalButtons = document.querySelectorAll(
      `[${MODAL_CLOSE_ATTRIBUTE}="${this.modalId}"]`
    );

    this.setupEvents();
  }

  static getElementSelector() {
    return MODAL_SELECTOR;
  }

  setupEvents() {
    this.setupOpenButtons();
    this.setupCloseButton();

    this.onClose(() => {
      /* window.smoothScroll.start(); */
    });
  }

  setupOpenButtons() {
    if (this.openModalButtons.length === 0) {
      console.error(
        `Modal element with ID "${this.modalId}" is missing open buttons.`
      );
      return;
    }

    this.openModalButtons.forEach((openModal) => {
      openModal.addEventListener("click", () => {
        this.modal.showModal();
        /* window.smoothScroll.stop(); */
      });
    });
  }

  setupCloseButton() {
    if (this.closeModalButtons === 0) {
      console.error(
        `Modal element with ID "${this.modalId}" is missing a close button.`
      );
      return;
    }

    this.closeModalButtons.forEach((closeModalButton) => {
      closeModalButton.addEventListener("click", () => {
        this.modal.close();
      });
    });

    /* Close on click outside / backdrop */
    this.modal.addEventListener("click", (e) => {

      if (this.modal.contains(e.target) && e.target !== this.modal) {
        return;
      };

      const dialogDimensions = this.modal.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        this.modal.close();
      }
    });
  }

  onClose(callback) {
    this.modal.addEventListener("close", callback);
  }
}
