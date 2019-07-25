var db = require("../models"),
    jwt = require("jsonwebtoken"),
    error = require("./errorHandler"),
    help = require("./sideFunctions");

exports.getDiscoverUsers = function(req, res){
    var currentUser = jwt.decode(req.headers.authorization.split(" ")[1]);
    db.User.find({followers: currentUser.userId})
    .then(user => {
     const ids = user.map(obj => {return {_id: obj._id}})
     //The following finds users who are not followed by current, but are followed by current's followers
     //Also temporary solution, perhaps aggregation is a more suitable method
     Promise.all([
       db.User.find({followers: {"$nin": [currentUser.userId], "$in": ids }, _id: {"$nin": [currentUser.userId]}}, "username profileImgUrl profileColor").limit(10), // Current User's followers followlists.
       db.User.find({followers: {"$nin": ids.concat(currentUser.userId)}, _id: {"$nin": [currentUser.userId]}}).limit(10) //Finds remaining followers - SMALL SCALE ONLY
     ]).then( ([followList, restList]) =>{
       var combineDiscover = followList.concat(restList)
       combineDiscover =  help.dataShuffle(combineDiscover);
       combineDiscover.splice(10); //current method of limiting the amount of recieved
       res.json(combineDiscover)
     })
     .catch( (err) => {
       res.status(500).json(err);
       console.log(err)
     })
    })
    .catch(() => {
      res.status(404).json(error.errorHandler(404));
    })
}


/*

EXTRA FUNCTIONS
TODO: Separate into own file
*/








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
