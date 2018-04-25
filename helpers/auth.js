var db = require("../models"),
    jwt = require("jsonwebtoken");
exports.signin = function(req, res){
  if(!req.body.username){
    res.status(400).json({errors:{message: "Please input your information!"}});
  }
  db.User.findOne({username: req.body.username}).select("+password").then(function(user){
    if(!user){
      res.status(400).json({errors: {message: "Sorry, invalid username/Password!"}});
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
            profileColor: user.profileColor, //don't forget you changed this.
            token
          });
      }else{
        res.status(400).json({errors: {message: "Sorry, invalid username/Password!"}});
      }
    });
  }).catch(function(err){
    res.status(400).json(err);
  });
};
exports.signup = function(req, res, next){
    if(!req.body.username || !req.body.email){
    res.status(400).json({errors:{message: "Please input the required fields!"}});
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
      res.status(400).json({errors: {message: "Sorry, that username/email is already taken!"}});
    }
   res.status(400).json(err);
  });
};


module.exports = exports;
