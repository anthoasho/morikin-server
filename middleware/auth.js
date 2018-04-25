require("dotenv").load()
var jwt = require("jsonwebtoken");

exports.loginRequired = function(req,res,next){
  try {
    var token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, process.env.SECRET_KEY, function(err, auth) {
      if(auth){
        next();
      } else {
        res.status(401).json({message: 'Please log in first'});
      }
    });
  } catch(e){
    res.status(401).json({message: 'Please log in first'});
  }
};

exports.ensureCorrectUser = function(req, res, next){
  try {
    var token = req.headers.authorization.split(" ")[1]
    jwt.verify(token, process.env.SECRET_KEY, function(err, auth){
      if(auth && auth.userId === req.params.id){
        next();
      }else {
        res.status(401).json({message:"You don't have permission!"});
      }
    });
  }catch(e){
    res.status(401).json({message:"You don't have permission!"});
  
  }
};
