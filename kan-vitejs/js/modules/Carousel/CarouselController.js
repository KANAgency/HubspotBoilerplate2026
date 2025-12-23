import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/all";

gsap.registerPlugin(InertiaPlugin, Draggable);
const CAROUSEL_SELECTOR = "[data-name=carousel]";
const DRAGGABLE_ATTRIBUTE = "data-carousel-draggable";

export default class CarouselController {
    constructor(container) {
        this.container = container;
        this.carousel = container.querySelector(CAROUSEL_SELECTOR);
        this.supportCSSCarousel = CSS.supports("selector(::scroll-button(*)");
        this.isDraggable = this.container.hasAttribute(DRAGGABLE_ATTRIBUTE);

        this.init();
    }

    init() {
        if (this.isDraggable) {
            this.setupDraggable();
        }

        if (!this.supportCSSCarousel) {
            this.setupFallbacks();
        };
    }

    setupDraggable() {
        Draggable.create(this.container, {
            type: "scrollLeft", // Makes the element's scrollLeft value draggable (horizontal only)
            lockAxis: true,
            edgeResistance: 0.85, // Adds a slight "resistance" when dragging past the ends
            bounds: 'auto', // Automatically determines the scrollable bounds
            inertia: true,
            activeCursor: "grabbing", // Cursor when actively dragging
            cursor: "grab", // Cursor when hovering over the draggable area
            allowNativeTouchScrolling: true,
            dragClickables: true,
            allowContextMenu: true,
            onDragStart: () => {
                this.container.classList.add("is-dragging");
            },
            onThrowComplete: () => {
                this.container.classList.remove("is-dragging");
            }

        });
    }

    setupFallbacks() {
        this.prevButton = null;
        this.nextButton = null;
        this.rafId = null; // for rAF throttling
        this.createNavButtons();
        this.updateButtonState();

        // Scroll listener with rAF throttling
        this.container.addEventListener(
            "scroll",
            () => {
                if (this.rafId) return; // already scheduled
                this.rafId = requestAnimationFrame(() => {
                    this.updateButtonState();
                    this.rafId = null;
                });
            },
            { passive: true }
        );

        // ResizeObserver is more efficient than window resize
        const resizeObserver = new ResizeObserver(() => this.updateButtonState());
        resizeObserver.observe(this.container);
    }

    createNavButtons() {
        this.prevButton = document.createElement("button");
        this.prevButton.type = "button";
        this.prevButton.classList.add("carousel__btn", "carousel__btn--prev");
        this.prevButton.setAttribute("aria-label", "Scroll carousel backwards");

        this.nextButton = document.createElement("button");
        this.nextButton.type = "button";
        this.nextButton.classList.add("carousel__btn", "carousel__btn--next");
        this.nextButton.setAttribute("aria-label", "Scroll carousel forwards");

        this.prevButton.addEventListener("click", () => {
            this.container.scrollBy({
                left: -this.container.clientWidth,
                behavior: "smooth",
            });
        });

        this.nextButton.addEventListener("click", () => {
            this.container.scrollBy({
                left: this.container.clientWidth,
                behavior: "smooth",
            });
        });

        this.container.parentNode.appendChild(this.prevButton);
        this.container.parentNode.appendChild(this.nextButton);
    }

    updateButtonState() {
        const maxScrollLeft = this.container.scrollWidth - this.container.clientWidth;
        const currentScroll = this.container.scrollLeft;

        this.prevButton.disabled = currentScroll <= 0;
        this.nextButton.disabled = currentScroll >= maxScrollLeft - 1;
    }

}