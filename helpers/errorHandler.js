var express = require("express"),
    router  = express.Router();

exports.errorHandler = (type, code) => {
  let errorObject = (code, clientMessage, devMessage) =>  {
    return  {
        code: code,
        clientMessage: clientMessage,
        devMessage: devMessage,
    }
}

  switch(type){
    case 404:
      return errorObject(404, "Sorry, can't be found!", "404 - not found")
    case "noAuth":
      return errorObject(code, "You don't have permission to do that!", "Authentication error")
    case "invalidAuth":
      return errorObject(code, "Sorry invalid username/password!", "Unable to authenticate details")
    case "emptyInput":
      return errorObject(code, "Please input the required fields!", "User has not completed the correct fields")
    case "userConflict":
      return errorObject(code, "Sorry that username/email is already taken!", "Duplicate data found, unable to process")
    case "emptyUser":
      return errorObject(code, "You don't seem to have an account here!", "Unable to find username on the server")
    case "messageOverload":
      return errorObject(code, "Sorry too many characters!", "User has tried to post over the character limit")
    case "saveError":
      return errorObject(code, "Sorry, we couldn't save your data right now! Try again later", "A problem has occurred with the server")
    case "messageNoFind":
      return errorObject(code, "Sorry we can't get the messages right now, try again later", "Error with finding the messages")
    default:
      return errorObject(code,  "Something went wrong, try again later! ", "An unknown error has occurred")
  }
}


module.exports = exports;
