const {type} = require('message-type')
const config = require('./server/init/configuration')
const canvasApi = require('./canvasApi')(config.safe.canvas.apiUrl, config.secure.canvas.apiKey)
var Promise = require('bluebird')
require('colors')

function isInScope(msg)
{
    var affArray = msg.affiliation
    if ( affArray && ( affArray.indexOf('employee') >= 0 || affArray.indexOf('student') >= 0))
        return true
    return false
}


function createCanvasUser(msg) {
//UG_USER_ATTRIBUTES=kthid,username,family_name,given_name,affiliation,email_address,primary_email

    //if (msg.username && (msg.given_name || msg.family_name) &&  msg.username &&  msg.primary_email &&  msg.kthid)
    if (msg.username && (msg.given_name || msg.family_name) &&  msg.kthid)
        {
            let  user = {
                pseudonym: {unique_id: `${msg.username}@kth.se`}, // CSVs analogi av 'login_id'
                user: {
                    'name': `${msg.given_name} ${msg.family_name}`, // CSVs analogi av 'full_name'
                    'username': msg.username, // inte säker
                    'sis-integration-id': msg.kthid // prova om det är rätt analog av CSVs 'user_id'
                }}
            console.info("Creating canvas User object:  ".green + JSON.stringify(user,null,4))
            return user
        }
    else return false
}


module.exports = function (msg) {
    console.info('\nProcessing for user msg..... ' + msg.ugClass + ' ' + msg.kthid, " msg affiliation ", msg.affiliation)
  //  if (isInScope(msg)) {
        let user = createCanvasUser(msg)
        if (user) {
            console.log("USER OBJECT READY", JSON.stringify(user,null,4))
            return canvasApi.getUser(user.pseudonym.unique_id)
                    .then(userFromCanvas => canvasApi.updateUser(user, userFromCanvas.id))
                    // .then(() => console.log("USER HAS BEEN UPDATED".rainbow))
                    // .then(() => {
                    //     console.log("CANNOT UPDATE I WILL TRY TO CREATE".rainbow)
                    //     return canvasApi.updateUser(user)})
                    // .then(() => console.log("USER HAS BEEN CREATED".rainbow))
                    .catch(e => {
                      console.log("Error".yellow, e)
                      console.log("Now we will create User in canvas")
                      return canvasApi.createUser(user)
                    })
                    //.catch(e => console.log("Error".yellow, e))
                    // .then(user => {
                    //   console.log(`${user.user.username} is created in canvas`)
                    //   return Promise.resolve("USER UPDATE/CREATION IS DONE")
                    // })
        }
        else {
            console.log("\nIncomplete fields to create user in cavas.....")
            return Promise.resolve("User fields missing...")
        }
    // }
    // else
    // {
    // console.info('\nUser not in affiliation scope..... ' + msg.ugClass + ' ' + msg.kthid )
    // return Promise.resolve("User not in affiliation scope...")
    // }
}
