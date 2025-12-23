import CarouselController from "./CarouselController";

const CAROUSEL_SELECTOR = "[data-name=carousel-container]";

export default class Carousel {
    constructor() {
        this.carousels = document.querySelectorAll(CAROUSEL_SELECTOR);
    }

    init() {
        this.carousels?.forEach((carousel) => {
            new CarouselController(carousel);
        });
    }

}
