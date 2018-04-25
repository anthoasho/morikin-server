var express = require("express"),
    router  = express.Router(),
    helpers = require("../helpers/auth");
    
router.post("/signin", helpers.signin);
router.post("/signup", helpers.signup);

module.exports = router;