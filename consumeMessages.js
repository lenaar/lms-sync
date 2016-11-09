const config = require('./server/init/configuration')
const queue = require('node-queue-adapter')(config.secure.azure.queueConnectionString)
const {addDescription} = require('message-type')
const handleMessage = require('./handleMessage')

function readMessage () {
  process.stdout.write('.')

  let message
  return queue
    .readMessageFromQueue('ug-canvas')
    .then(msg => {
      message = msg
      if (!msg) {
        // Best way to abort a promise chain is by a custom error according to:
        // http://stackoverflow.com/questions/11302271/how-to-properly-abort-a-node-js-promise-chain-using-q
        throw new Error('abort_chain')
      }
      return msg
    })
    .then(msg => JSON.parse(msg.body))
    .then(addDescription)
    .then(handleMessage)
    .then(() => queue.deleteMessageFromQueue(message))
    .then(readMessage)
    .catch(e => {
      if (e.message !== 'abort_chain') {
        console.error(`Exception: `, e)
      }
      return readMessage()
    })
}
readMessage()