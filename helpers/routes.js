var db = require("../models"),
    jwt = require("jsonwebtoken"),
    error = require("./errorHandler");


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
      .catch(res => res.status(500).json(error.errorHandler("saveError", 500))); //this is literally disgusting...
    }else{
      user.followers.splice(index, 1);
      user.save().then(function(user){
        res.json({following: false, followerCount: user.followers.length, username:user.username});
      })
      .catch(res => res.status(500).json(error.errorHandler("saveError", 500)));
    }
  })
  .catch(res => res.status(500).json(error.errorHandler(404)));
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
  var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
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




exports.getDiscoverUsers = function(req, res){
    var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
    db.User.find({followers: currentUser.userId})
    .then(user => {
     const ids = user.map(obj => {return {_id: obj._id}})
     //The following finds users who are not followed by current, but are followed by current's followers
     //Also temporary solution, perhaps aggregation is a more suitable method - learn that
     Promise.all([
       db.User.find({followers: {"$nin": [currentUser.userId], "$in": ids }, _id: {"$nin": [currentUser.userId]}}, "username profileImgUrl profileColor").limit(10), // Current User's followers followlists.
       db.User.find({followers: {"$nin": ids.concat(currentUser.userId)}, _id: {"$nin": [currentUser.userId]}}).limit(10) //Finds remaining followers - SMALL SCALE ONLY
     ]).then( ([followList, restList]) =>{
       var combineDiscover = followList.concat(restList)
       combineDiscover =  dataShuffle(combineDiscover);
       combineDiscover.splice(3); //current method of limiting the amount of recieved
       res.json(combineDiscover)
     })
     .catch( () => {
       res.status(500).json(error.errorHandler());
     })
    })
    .catch(() => {
      res.status(404).json(error.errorHandler(404));
    })
}

exports.getGetAllMessages = function(req, res){
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

/*

EXTRA FUNCTIONS
TODO: Separate into own file
*/


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
