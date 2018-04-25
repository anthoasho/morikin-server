var mongoose = require("mongoose"),
    User    = require("./user");
var messageSchema = new mongoose.Schema({
  text:{
    type: String,
    required: true,
    maxLength: 160,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }]
},
 {
    timestamps:true
});
messageSchema.pre("remove", function(next){
  User.findById(this.userId).then(user => {
    user.messages.remove(this.id);
    user.save().then(function(e){
      next();
    });
  });
});

var Message = mongoose.model('Message', messageSchema);
module.exports = Message;
