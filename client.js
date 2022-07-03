const { PeerRPCClient }  = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://localhost:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

peer.request('order_book', { side: 'bid', price: 13.37, size: 10 }, { timeout: 100000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data)
})

peer.request('order_book', { side: 'ask', price: 13.38, size: 10 }, { timeout: 100000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data)
})

peer.request('order_book', { side: 'bid', price: 13.38, size: 5 }, { timeout: 100000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data)
})