import Modal from "./Modal";

export default class ModalHandler {
    constructor() {
        this.modals = document.querySelectorAll(Modal.getElementSelector());
    }

    init() {
        this.modals.forEach((modal) => {
            new Modal(modal);
        });
    }
}