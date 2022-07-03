

const PriorityQueue = require("js-priority-queue");
const Limit = require("./limit");
const {MarketOrder} = require("./order");


module.exports = class Queue {
  constructor(side) {
    this.map = {};
    if (side === "ask") {
      this.__queue = new PriorityQueue({
        strategy: PriorityQueue.ArrayStrategy,
        comparator: function (a, b) {
          return a.price - b.price;
        },
      });
    } else {
      this.__queue = new PriorityQueue({
        strategy: PriorityQueue.ArrayStrategy,
        comparator: function (a, b) {
          return b.price - a.price;
        },
      });
    }
    this.queue = this.__queue.priv.data;
  }

  peek() {
    return (this.queue.length <= 0) ? undefined : this.__queue.peek();
  }

  addOrder(order) {
    let limit = this.map[order.price];
  
    if (limit === undefined) {
      limit = new Limit(order.price);
      this.map[order.price] = limit;
      this.__queue.queue(limit);
    }
  
    limit.add(order);
  }

  removeOrder(price, orderId) {
    let order = undefined;
    const limit = this.map[price];
  
    if (limit !== undefined) {
      order = limit.remove(orderId);
      if (order !== undefined && limit.peek() === undefined) {
        delete this.map[price];
        this.queue.splice(this.queue.indexOf(limit), 1);
      }
    }

    return order;
  }

  reduceOrder(price, orderId, size) {
    let order = undefined;
    const limit = this.map[price];
  
    if (limit !== undefined) {
      order = limit.reduce(orderId, size);
      if (order !== undefined && limit.peek() === undefined) {
        delete this.map[price];
        this.queue.splice(this.queue.indexOf(limit), 1);
      }
    }
  
    return order;
  }

  __isTaken(maker, taker) {
    if (taker instanceof MarketOrder) {
      return taker.getSizeRemainingFor(maker.price) > 0;
    } else if (taker.side === "bid") {
      return taker.price >= maker.price;
    } else {
      return taker.price <= maker.price;
    }
  }

  takeLiquidityFromBestLimit(taker) {
    const maker = this.peek();
    if (maker !== undefined && this.__isTaken(maker, taker)) {
      var makers = maker.takeLiquidity(taker);
  
      if (makers.length > 0 && maker.peek() === undefined) {
        delete this.map[maker.price];
        this.__queue.dequeue();
      }
  
      return makers;
    } else {
      return new Array();
    }
  }

  clear() {
    this.map = {};
    while (this.peek() !== undefined) { this.__queue.dequeue().clear(); }
  }
}
