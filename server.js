const { PeerRPCServer }  = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const {LimitOrder} = require("./order-book/order");
const OrderBook = require("./order-book/order-book");


const link = new Link({
    grape: 'http://localhost:30001'
})
link.start()

const peer = new PeerRPCServer(link, {
    timeout: 300000
})
peer.init()

const port = 1024 + Math.floor(Math.random() * 1000)
const service = peer.transport('server')
service.listen(port)

setInterval(function () {
    link.announce('order_book', service.port, {}, (err, res) => console.log(err, res))
}, 1000)

const orderBook = new OrderBook();

service.on('request', (rid, key, payload, handler) => {
    console.log(payload) //  { side: 'bid', price: 13.37, size: 10 }
    const { side, price, size } = payload;

    const order = new LimitOrder(side, price, size);
    const result = orderBook.add(order);

    handler.reply(null, result)
})