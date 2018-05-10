var express = require("express"),
    router  = express.Router();

exports.errorHandler = (type, code) => {
  let objectThing = (code, clientMessage, devMessage) =>  {
    return  {
        code: code,
        clientMessage: clientMessage,
        devMessage: devMessage,
    }
}

  switch(type){
    case 404:
      return objectThing(404, "Sorry, can't be found!", "404 - not found")
    case "noAuth":
      return objectThing(code, "You don't have permission to do that!", "Authentication error")
    case "invalidAuth":
      return objectThing(code, "Sorry invalid username/password!", "Unable to authenticate details")
    case "emptyInput":
      return objectThing(code, "Please input the required fields!", "User has not completed the correct fields")
    case "userConflict":
      return objectThing(code, "Sorry that username/email is already taken!", "Duplicate data found, unable to process")
    case "emptyUser":
      return objectThing(code, "You don't seem to have an account here!", "Unable to find username on the server")
    case "messageOverload":
      return objectThing(code, "Sorry too many characters!", "User has tried to post over the character limit")
    case "saveError":
      return objectThing(code, "Sorry, we couldn't save your data right now! Try again later", "A problem has occurred with the server")
    case "messageNoFind":
      return objectThing(code, "Sorry we can't get the messages right now, try again later", "Error with finding the messages")
    default:
      return objectThing(code,  "Something went wrong, try again later! ", "An unknown error has occurred")
  }
}


module.exports = exports;
