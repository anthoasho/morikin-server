var express = require("express"),
    router  = express.Router({mergeParams: true}),
    helpers = require("../helpers/messages");

    router.post("/", helpers.createMessage);
    router.put("/:mid/delete", helpers.softDeleteMessage);
    router.get("/:mid/likes", helpers.getMessageLikes);
    module.exports = router;
