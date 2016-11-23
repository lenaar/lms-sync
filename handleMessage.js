const handleCourseMessage = require('./handleCourseMessage')
const handleUserMessage =  require('./handleUserMessage')
const {type} = require('message-type')

module.exports = function (msg) {
  if (!msg._desc.type) {
    return Promise.resolve("\nMessage type is missing, message not processed by handle message....")
  }

  if (msg._desc.type === type.course) {
    console.log("\nHandling message for course...".green)
    return handleCourseMessage(msg)
  }
  else if (msg._desc.type === type.user) {
    console.log("\nHandling message for user...".green, msg)
    return  handleUserMessage(msg)
  }
  else {
    console.log("\nMessage type irrelevant for this app.....".red)
    return Promise.resolve("Message type irrelevant for this app.....")
  }
}
