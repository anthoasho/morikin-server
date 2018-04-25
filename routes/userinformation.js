var express = require("express"),
    router  = express.Router({mergeParams: true}),
    helpers = require("../helpers/userinformation");


    router.get("/:id/messages", helpers.getUserMessages);
    router.get("/:user/:follow", helpers.getUserFollow);
    router.get("/:id", helpers.getUserProfile);
    router.post("/updateprofile", helpers.updateProfile);

    module.exports = router;
