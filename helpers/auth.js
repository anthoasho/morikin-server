var db = require("../models"),
    jwt = require("jsonwebtoken"),
    error = require("./errorHandler");




exports.signin = function(req, res){
  if(!req.body.username){
    res.status(400).json(error.errorHandler("emptyInput", 400));
  }
  db.User.findOne({username: req.body.username}).select("+password").then(function(user){
    if(!user){
      return Promise.reject(error.errorHandler("emptyUser", 404));
    }
    user.comparePassword(req.body.password, function(err, isMatch){
      if(isMatch){
        var token = jwt.sign({
          userId: user.id,
          username: user.username,
          email:user.email,
          profileImgUrl: user.profileImgUrl,
          displayName: user.displayName,
          profileColor: user.profileColor,
          description: user.description
        }, process.env.SECRET_KEY);
        res.status(200)
          .json({userId: user.id,
            username: user.username,
            email:user.email,
            profileImgUrl: user.profileImgUrl,
            displayName: user.displayName,
            profileColor: user.profileColor,
            token
          });
      }else{
        res.status(403).json(error.errorHandler("invalidAuth", 403));
      }
    });
  }).catch(function(err){
    console.log(err)
    res.status(err.code).json(err);
  });
};

exports.signup = function(req, res, next){
    if(!req.body.username || !req.body.email){
    res.status(400).json(error.errorHandler("emptyInput", 400));
      // res.status(400).json({errors:{message: "Please input the required fields!"}});
    }
  db.User.create(req.body).then(function(user){
    var token = jwt.sign({userId: user.id, username: user.username, email:user.email, profileImgUrl: user.profileImgUrl}, process.env.SECRET_KEY);
    res.status(200).json({userId: user.id,
                              username: user.username,
                              profileImgUrl: user.profileImgUrl,
                              token
                            });
  }).catch(function(err){
    if (err.code === 11000) {
      res.status(400).json(error.errorHandler("userConflict", 400));
    }
   res.status(500).json(error.errorHandler("saveError", 500));
  });
};


module.exports = exports;
