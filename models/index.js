var mongoose = require("mongoose");
var dburl = process.env.MONGODB_URI || "mongodb://localhost/morikin";
mongoose.set("debug", true);
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/morikin", {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE
});

module.exports.User = require("./user");
module.exports.Message = require("./message");
