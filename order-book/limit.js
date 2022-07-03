const {MarketOrder} = require("./order");
module.exports = class Limit {
  constructor(price) {
    this.price = price;
    this.volume = 0;
    this.map = {};
    this.queue = [];
  }
  
  peek() {
    return this.queue[0];
  }

  add(order) {
    this.map[order.orderId] = order;
    this.queue.push(order);
    this.volume += order.sizeRemaining;
  }

  remove(orderId) {
    const order = this.map[orderId];
    if (order !== undefined) {
      delete this.map[orderId];
      this.queue.splice(this.queue.indexOf(order), 1);
      this.volume -= order.sizeRemaining;
    }
    return order;
  }

  reduce(orderId, size) {
    const order = this.map[orderId];
    if (order !== undefined) {
      order.subtract(size, this.price);
      this.volume -= size;
      if (order.sizeRemaining <= 0) {
        delete this.map[orderId];
        this.queue.splice(this.queue.indexOf(order), 1);
      }
    }
    return order;
  }

  __getTakeSize(taker) {
    if (taker instanceof MarketOrder) {
      return taker.getSizeRemainingFor(this.price);
    } else {
      return taker.sizeRemaining;
    }
  }

  __takeLiquidityFromNextMaker = function (taker, takeSize) {
    const maker = this.queue[0];
    if (maker !== undefined) {
      var volumeRemoved = maker.takeSize(takeSize);

      if (maker.sizeRemaining <= 0) {
        delete this.map[maker.orderId];
        this.queue.shift();
      }

      this.volume -= volumeRemoved;
      taker.subtract(volumeRemoved, maker.price);
    }
    return maker;
  };

  takeLiquidity(taker) {
    var makers = [];
    var takeSize = this.__getTakeSize(taker);
    var maker = undefined;

    while (takeSize > 0) {
      maker = this.__takeLiquidityFromNextMaker(taker, takeSize);
      if (maker !== undefined) {
        makers.push(maker);
        takeSize = this.__getTakeSize(taker);
      } else {
        break;
      }
    }

    return makers;
  }

  clear() {
    this.queue  = [];
    this.map    = {};
    this.volume = 0;
  }
  
}
