var express = require("express"),
    router  = express.Router({mergeParams: true}),
    helpers = require("../helpers/userinformation");

// - Get User messages
router.get("/:id/messages", helpers.getUserMessages);

// - Get UserProfile
router.get("/:id", helpers.getUserProfile);

// - POST Update profile
router.post("/updateprofile", helpers.updateProfile);

// - Get Followers
router.get("/:user/:follow", helpers.getUserFollow);

// - POST Follow
router.post("/:username/follow", helpers.followUser);


module.exports = router;
