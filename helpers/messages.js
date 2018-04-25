var db = require("../models"),
    jwt = require("jsonwebtoken");

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
    return res.status(400).json({message: "Too many characters!", code: 400});
  }
};

const combineData = (users, currentUser) => {
  let finalData = users.map(function(obj){
      mappedFollowing = obj.followers.some(e => e.toString() === currentUser.userId);
      let finalObject = {
        username: obj.username,
        profileImgUrl: obj.profileImgUrl,
        following: mappedFollowing,
        profileColor: obj.profileColor,
        displayName: obj.displayName
      }
    return finalObject;
  });
  return finalData;
}

exports.getMessageLikes = function(req, res, next){
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
  db.Message.findById(req.params.mid)
  .populate("likedBy", {username: true, profileImgUrl: true, followers: true, profileColor: true})
  .then(function(messages){
    let newData = combineData(messages.likedBy, currentUser)

    res.json(newData);
  })
}
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
