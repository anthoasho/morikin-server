var mongoose = require("mongoose");

mongoose.set("debug", true);
// mongoose.set('useNewUrlParser', true)
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE
});

module.exports.User = require("./user");
module.exports.Message = require("./message");
