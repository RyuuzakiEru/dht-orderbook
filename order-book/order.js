const { v4 } = require('uuid')

class LimitOrder {
  constructor(side, price, size) {
    this.orderId = v4();
    this.side = side;
    this.price = price;
    this.size = size;
    this.sizeRemaining = size;
    this.valueRemoved = 0;
  }

  clearValueRemoved() {
    this.valueRemoved = 0;
  }

  subtract(size) {
    this.sizeRemaining -= size;
  }

  takeSize(size) {
    var taken = Math.min(size, this.sizeRemaining);
    this.sizeRemaining -= taken;
    this.valueRemoved += this.price * taken;
    return taken;
  }
}

class MarketOrder extends LimitOrder {
  constructor(side, size, funds) {
    super(side, 0, size);
    this.funds = funds;
    this.fundsRemaining = funds;
    this.volumeRemoved = 0;
  }

  subtract(size, price) {
    this.sizeRemaining -= size;
    this.fundsRemaining -= price * size;
    this.volumeRemoved += size;
  }

  getSizeRemainingFor(price) {
    const fundsTakeSize = ~~(this.fundsRemaining / price);

    if (this.funds > 0 && this.size > 0) {
      return Math.min(fundsTakeSize, this.sizeRemaining);
    } else if (this.funds > 0) {
      return fundsTakeSize;
    } else if (this.size > 0) {
      return this.sizeRemaining;
    } else {
      return 0;
    }
  }
}

module.exports = { LimitOrder, MarketOrder }