var db = require("../models"),
    jwt = require("jsonwebtoken"),
    error = require("./errorHandler");

exports.createMessage = function(req, res, next){
  const newMessage = {
    text: req.body.text,
    userId: req.params.id
  };
  if(newMessage.text.length < 160){
  db.Message.create(newMessage).then(function(message){
    db.User.findById(req.params.id).then(function(user){
      user.messages.push(message.id);
      user.save().then(function(user){
        return db.Message.findById(message._id)
          .populate("userId", {username: true, profileImgUrl: true, profileColor: true, displayName: true});
      }).then(function(m){
        return res.status(200).json(m);
      }).catch(next);
    }).catch(next);
  }).catch(next);
  }else{
    return res.status(400).json(error.errorHandler("messageOverload", 400));
  }
};


exports.softDeleteMessage = function(req, res, next){
  db.Message.findById(req.params.mid).then(function(message){
    message.isDeleted = true;
    message.save().then(function(e){
      next();
    });
  }).then(function(m){
  return res.status(200).json(m);
  }).catch(next);
};


module.exports = exports;
