var db = require("../models"),
    jwt = require("jsonwebtoken");
exports.getUserMessages = function(req, res){
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
  db.User.findOne({username: req.params.id}).then(function(user){
    var perPage = 10;
    var pageId = req.query["from"]
    const dbQuerySelector =
      !pageId ? db.Message.find({userId: user._id, isDeleted: false}).limit(perPage)
      :
      db.Message.find({
        userId: user._id,
        '_id': {'$lt':pageId},
         isDeleted: false})
      .limit(perPage)

    dbQuerySelector //This var checks if there is a query "from" in the request, if it is present it will find the appropriate data
    .sort({createdAt: "desc"})
    .populate("userId", {username: true, profileImgUrl: true, profileColor: true, displayName: true})
    .then(function(messages){
      messages = messages.filter(message => message.isDeleted === false);
      let mappedData = messages.map(function(obj){
        mappedLiked = obj.likedBy.some(e => e.toString() === currentUser.userId) //Returns a true if the message has been liked by the user
        let finalData = {
          ...obj._doc,
          isLiked: mappedLiked,
          likedBy: obj.likedBy.length
        }
        return finalData;
      })
      res.json(mappedData);
    })
    .catch(function(err){
     if(err.reason === undefined){
      res.status(404).json({code: 404, message: "Sorry this user does not exist!"});
    } res.json(err);
    });
  });
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


exports.getUserFollow = function(req, res, next){
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
  if(req.params.follow === "followers"){
    db.User.findOne({username: req.params.user})
    .populate(req.params.follow, {username: true, profileImgUrl: true, followers: true, profileColor: true})
    .then(function(users){
      let newData = combineData(users.followers, currentUser);
      res.json(newData);
    })
    .catch(err => res.status(500).json(err));
  }else if(req.params.follow === "following"){
    db.User.findOne({username: req.params.user})
    .then(profile => {
      db.User.find({followers: profile._id})
      .then(users => {
        let newData = combineData(users, currentUser);
        res.json(newData);
      }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(500).json(err));
  }else{
    res.status(404).json({message: "Sorry can't be found"})
  }
};

exports.updateProfile = function(req, res, next){
    var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
    var data = req.body.userData
    var {username, email, profileImgUrl, color} = data;
    db.User.findById(currentUser.userId).then(function(user){
      for(var i in data){
        if(data[i].length > 1){
          user[i] = data[i]
        }
      }
      user.save()
      .then(function(response){
        var token = jwt.sign({
          userId: response.id,
          username: response.username,
          email:response.email,
          profileImgUrl: response.profileImgUrl,
          profileColor: response.profileColor,
          displayName: response.displayName,
          description: response.description
        }, process.env.SECRET_KEY);
        res.status(200)
          .json({response, token});
      })
      .catch(err => res.json(err))
    })
    .catch(err=> res.json(err))
};
exports.getUserProfile = function(req, res){
  db.User.findOne({username: req.params.id})
  .populate("messages", {isDeleted: true})
  .then(function(user){
    var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
    const {followers, following, messages, id, username, profileImgUrl, profileColor, displayName, description} = user;
    let followingTruthy = followers.some(e => e.toString() === currentUser.userId);
    let followerCount = followers.length;
    let messageCount = messages.filter(message => message.isDeleted === false).length;
    db.User.find({followers: id}).then(following => {
      let followingCount = following.length
      res.json({userId: id,
                username,
                following: followingTruthy,
                profileImgUrl,
                followingCount,
                followerCount,
                messageCount,
                displayName,
                profileColor,
                description
      });
    })
  })
  .catch(function(err){
    if(err.reason === undefined){
      res.status(404).json({code: 404, message: "Sorry this user does not exist!"});
    }
      res.json(err)
  });
};
module.exports = exports;
