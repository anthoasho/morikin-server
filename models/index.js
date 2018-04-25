var mongoose = require("mongoose");

mongoose.set("debug", true);
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/morikin", {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE
});

module.exports.User = require("./user");
module.exports.Message = require("./message");
