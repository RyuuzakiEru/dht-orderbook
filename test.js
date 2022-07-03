
const { LimitOrder } = require('./order-book/order')
const OrderBook = require('./order-book/order-book')

let order1 = new LimitOrder("bid", 13.37, 10);
let order2 = new LimitOrder("ask", 13.38, 10);
let order3 = new LimitOrder("bid", 13.38, 5);

let book = new OrderBook();

let result = book.add(order1);
result = book.add(order2);
result = book.add(order3);

console.log(result);
