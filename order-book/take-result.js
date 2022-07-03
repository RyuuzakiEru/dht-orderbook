module.exports = class TakeResult {
  constructor(taker, makers, takeSize) {
    this.taker = taker;
    this.makers = makers;
    this.takeSize = takeSize;
    this.takeValue =
      makers.length <= 0
        ? 0
        : makers.reduce(function (prev, maker) {
            return prev + maker.valueRemoved;
          }, 0);
  }

  clearMakerValueRemoved() {
    this.makers.forEach(function (maker) {
      maker.clearValueRemoved();
    });
  }
}
