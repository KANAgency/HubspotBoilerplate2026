import NumberCounter from "./NumberCounter";

export default class NumberCounterHandler {
  constructor() {
    this.elementGroups = document.querySelectorAll(
      NumberCounter.getGroupSelector()
    );
    this.init();
  }

  init() {
    this.elementGroups.forEach((group) => {
      const elements = group.querySelectorAll(
        NumberCounter.getElementSelector()
      );
      elements.forEach((element) => {
        new NumberCounter(element);
      });
    });
  }
}
