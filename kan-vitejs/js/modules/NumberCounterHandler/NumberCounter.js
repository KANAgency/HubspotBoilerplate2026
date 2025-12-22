import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const GROUP_SELECTOR = "[data-number-counter-group]";
const SELECTOR = "[data-number-counter]";
const STEP_ATTR = "data-number-step";
const FROM_ATTR = "data-number-from";
const TO_ATTR = "data-number-to";

const DURATION = 2;

export default class NumberCounter {
  constructor(element) {
    this.element = element;

    this.fromValue = parseFloat(this.element.getAttribute(FROM_ATTR)) || 0;
    this.toValue = parseFloat(this.element.getAttribute(TO_ATTR)) || 100;
    this.stepValue = parseFloat(this.element.getAttribute(STEP_ATTR)) || 1;
    this.currentValue = this.fromValue;

    // Detect if target has decimals (optional: store decimal places)
    this.hasDecimals = this.toValue % 1 !== 0;
    this.decimalPlaces = this.hasDecimals
      ? (this.toValue.toString().split(".")[1] || "").length
      : 0;

    this.init();
  }

  static getGroupSelector() {
    return GROUP_SELECTOR;
  }

  static getElementSelector() {
    return SELECTOR;
  }

  init() {
    this.setupScrollTrigger();
  }

  setupScrollTrigger() {
    ScrollTrigger.create({
      trigger: this.element,
      start: "top bottom",
      onEnter: () => {
        this.startCounting();
      },
    });
  }

  startCounting() {
    gsap.to(this, {
      currentValue: this.toValue,
      duration: DURATION,
      ease: "power1.inOut",
      onUpdate: () => {
        this.element.innerText = this.hasDecimals
          ? this.currentValue.toFixed(this.decimalPlaces)
          : Math.floor(this.currentValue);
      },
    });
  }
}
