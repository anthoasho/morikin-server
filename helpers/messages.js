var db = require("../models"),
    jwt = require("jsonwebtoken"),
    error = require("./errorHandler");

exports.createMessage = function(req, res, next){

  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]).userId;
  const newMessage = {
    text: req.body.text,
    userId: currentUser
  };
  if(newMessage.text.length < 160){
  db.Message.create(newMessage).then(function(message){
    db.User.findById(currentUser).then(function(user){
      user.messages.push(message.id);
      user.save().then(function(user){
        return db.Message.findById(message._id)
          .populate("userId", {username: true, profileImgUrl: true, profileColor: true, displayName: true}); //Have this also return the number of likes
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

exports.likeMessage = function(req, res, next){
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
  db.Message.findById(req.params.mid).then(function(message){
    var index = message.likedBy.indexOf(currentUser.userId);
    if(index === -1) {
      message.likedBy.push(currentUser.userId);
      message.save().then((response) => {
        response = {...response._doc, isLiked: true, likedBy: response.likedBy.length}
        res.status(200).json(response);
      })
    }
    else{
      message.likedBy.splice(index, 1);
      message.save().then((response) => {
        response = {...response._doc, isLiked: false, likedBy: response.likedBy.length}
        res.status(200).json(response);
      })
    }
  })
  .catch(err => res.status(500).json(error.errorHandler()));
}

exports.getMessageLikes = function(req, res, next){
  var currentUser = req.headers.authorization && jwt.decode(req.headers.authorization.split(" ")[1]);
  db.Message.findById(req.params.mid)
  .populate("likedBy", {username: true, profileImgUrl: true, followers: true, profileColor: true})
  .then(function(messages){
    let newData = combineData(messages.likedBy, currentUser)
    res.json(newData);
  })
  .catch(() => {
    res.status(500).json(error.errorHandler());
  })
}


exports.getAllMessages = function(req, res){
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
  var perPage = 10;
  var pageId = req.query["from"];
  db.User.find({followers: currentUser.userId})
  .then(users => {
    const ids = users.map(obj => {return {_id: obj._id}}) //Just gives id of the users that current follows
    ids.push({_id: currentUser.userId}) //adds the current User to the list
      const dbQuerySelector = !pageId ? db.Message.find({"userId":{"$in": ids}, isDeleted: false})
                          :
                          db.Message.find({"userId":{"$in": ids}, '_id': {'$lt':pageId}, isDeleted: false})
      dbQuerySelector
      .limit(perPage)
      .sort({createdAt: "desc"})
    .populate("userId", {username: true, profileImgUrl: true, profileColor: true, displayName: true})
    .then(function(messages){
        db.Message.find({"userId":{"$in":ids}, isDeleted:false}).sort({createdAt: 1}).limit(1).then(last => {
          let newData = messages.map(function(obj){
            mappedLiked = obj.likedBy.some(e => e.toString() === currentUser.userId)
            let finalData = {
              ...obj._doc,
              isLiked: mappedLiked,
              likedBy: obj.likedBy.length,
              isLast: obj._id.toString() === last[0]._id.toString() //Figure out something to do with this isLast - how to handle it
            }
            return finalData;
          })
          res.json(newData);
        })
    })
    .catch(function(err){
        res.status(404).json(error.errorHandler("messageNoFind", 404));
    });
    })
    .catch(function(err){
    res.status(500).json(error.errorHandler("messageNoFind", 500));
    });

}


const combineData = (users, currentUser) => {
  let finalData = users.map(function(obj){
      let mappedFollowing = currentUser && obj.followers.some(e => e.toString() === currentUser.userId);
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

function dataShuffle(array){
  let lastNum = array.length;
  let i;
  let swapper;
  while(lastNum){
    i = Math.floor(Math.random() * lastNum-- );
    swapper = array[lastNum];
    array[lastNum] = array[i];
    array[i] = swapper
  }
  return array
}

module.exports = exports;
