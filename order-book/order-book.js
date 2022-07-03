const TakeResult = require('./take-result');
const Queue = require('./queue');
const {MarketOrder} = require("./order");

module.exports = class OrderBook {
  constructor() {
    this.askLimits = new Queue("ask");
    this.bidLimits = new Queue("bid");
  }

  __processAsk(ask) {
    let makers = [];
    let next = this.bidLimits.takeLiquidityFromBestLimit(ask);

    while (next.length > 0) {
      makers = makers.concat(next);
      next = this.bidLimits.takeLiquidityFromBestLimit(ask);
    }

    if (ask.sizeRemaining > 0 && !(ask instanceof MarketOrder)) {
      this.askLimits.addOrder(ask);
    }

    return makers;
  }

  __processBid(bid) {
    let makers = [];
    let next = this.askLimits.takeLiquidityFromBestLimit(bid);

    while (next.length > 0) {
      makers = makers.concat(next);
      next = this.askLimits.takeLiquidityFromBestLimit(bid);
    }

    if (bid.sizeRemaining > 0 && !(bid instanceof MarketOrder)) {
      this.bidLimits.addOrder(bid);
    }

    return makers;
  }

  add(taker) {
    const takeSize = taker.sizeRemaining;
    let makers = undefined;

    if (taker.side === "ask") {
      makers = this.__processAsk(taker);
    } else {
      makers = this.__processBid(taker);
    }

    if (!(taker instanceof MarketOrder)) {
      return new TakeResult(taker, makers, takeSize - taker.sizeRemaining);
    } else {
      return new TakeResult(taker, makers, taker.volumeRemoved);
    }
  }

  remove(side, price, orderId) {
    if (side === "ask") {
      return this.askLimits.removeOrder(price, orderId);
    } else {
      return this.bidLimits.removeOrder(price, orderId);
    }
  }

  reduce(side, price, orderId, size) {
    if (side === "ask") {
      return this.askLimits.reduceOrder(price, orderId, size);
    } else {
      return this.bidLimits.reduceOrder(price, orderId, size);
    }
  }

  clear() {
    this.askLimits.clear();
    this.bidLimits.clear();
  }
}
