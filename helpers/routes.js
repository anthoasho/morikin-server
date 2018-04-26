var db = require("../models"),
    jwt = require("jsonwebtoken");
var ObjectId = require('mongodb').ObjectID


exports.followUser = function(req, res, next){
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
  db.User.findOne({username: req.params.username})
  .then(function(user){
    var index = user.followers.indexOf(currentUser.userId);
    if(index === -1){
      user.followers.push(currentUser.userId);
      user.save().then(function(user){
        res.json({following: true, followerCount: user.followers.length, username:user.username});
      })
      .catch(res => res.status(500).json({message: "We couldn't save your data right now, please try again later", code: 500})); //this is literally disgusting...
    }else{
      user.followers.splice(index, 1);
      user.save().then(function(user){
        res.json({following: false, followerCount: user.followers.length, username:user.username});
      })
      .catch(res => res.status(500).json({message: "We couldn't save your data right now, please try again later", code: 500}));
    }
  })
  .catch(res => res.status(500).json({message: "We couldn't find that user! Please try again later", code: 404}));
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
  .catch(err => res.json(err));
}
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


exports.getGetAllMessages = function(req, res){
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
  var perPage = 10;
  var pageId = req.query["from"]
  db.User.find({followers: currentUser.userId}).then(users => {
    const ids = users.map(obj => {return {_id: obj._id}})
    ids.push({_id: currentUser.userId})
      const dbQuerySelector = !pageId ? db.Message.find({"userId":{"$in": ids}, isDeleted: false}).limit(perPage)
                          :
                          db.Message.find({"userId":{"$in": ids}, '_id': {'$lt':pageId}, isDeleted: false}).limit(perPage)
      dbQuerySelector
     .sort({createdAt: "desc"})
    .populate("userId", {username: true, profileImgUrl: true, profileColor: true, displayName: true})
    .then(function(messages){
      let newData = messages.map(function(obj){
        mappedLiked = obj.likedBy.some(e => e.toString() === currentUser.userId)
        let finalData = {
          ...obj._doc,
          isLiked: mappedLiked,
          likedBy: obj.likedBy.length
        }
        return finalData;
      })
      res.json(newData);
    })
    .catch(function(err){
      res.status(500).json({message: "There was a problem finding the messages, please try again later", code: 500});
    });
    })

}


/*

The following code is remainder from getting every latest message, It's possible to be used but currently I have decided to remove it for sake of UX and customising their dashboard

*/



// exports.getGetAllMessages = function(req, res, next){
//   var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
//   console.log(currentUser)
//   var perPage = 10;
//   var pageId = req.query["from"]
//   const dbQuerySelector = !pageId ? db.Message.find({isDeleted: false}).limit(perPage)
//                       :
//                       db.Message.find({'_id': {'$lt':pageId}, isDeleted: false}).limit(perPage)
//   dbQuerySelector
//   .sort({createdAt: "desc"})
//     .populate("userId", {username: true, profileImgUrl: true, profileColor: true, displayName: true})
//     .then(function(messages){
//       let newData = messages.map(function(obj){
//         mappedLiked = obj.likedBy.some(e => e.toString() === currentUser.userId)
//         let finalData = {
//           ...obj._doc,
//           isLiked: mappedLiked,
//           likedBy: obj.likedBy.length
//         }
//         return finalData;
//       })
//       res.json(newData);
//     })
//     .catch(function(err){
//       res.status(500).json({message: "There was a problem finding the messages, please try again later", code: 500});
//     });
// };
module.exports = exports;
