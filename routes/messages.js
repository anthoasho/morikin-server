var express = require("express"),
    router  = express.Router({mergeParams: true}),
    helpers = require("../helpers/messages");


// - Get AllMessages
router.get("/", helpers.getAllMessages);


// - Get Messages without login
router.get("/allMessages", helpers.noLoginGetMessages);

// - Get Message likes
router.get("/:mid/likes", helpers.getMessageLikes);

// - Post like message
router.post("/:mid/like",  helpers.likeMessage);

// - Post message
router.post("/", auth.loginRequired, helpers.createMessage);

// - Put Delete message
router.put("/:mid/:userId/delete", auth.loginRequired, auth.ensureCorrectUser, helpers.softDeleteMessage);





    module.exports = router;
