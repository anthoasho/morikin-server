require("dotenv").config();
var express   =   require("express"),
    app       =   express(),
    cors      =   require("cors"),
    bodyParser  = require("body-parser"),
    authRoutes  = require("./routes/auth"),
    db      = require("./models"),
    helpers = require("./helpers/routes");
    auth = require("./middleware/auth"),
    jwt = require("jsonwebtoken"),
    messagesRoutes  = require("./routes/messages"),
    userInfoRoutes = require("./routes/userinformation"),
    otherRoutes = ("./routes/routes");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
process.on('unhandledRejection', function(reason, promise) {
    console.log(promise);
});
app.get("/", function(req, res){
  res.json({message:"Make a post request to sign up!"});
});

app.use("/api/users/:id/messages", auth.loginRequired, auth.ensureCorrectUser, messagesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", auth.loginRequired, userInfoRoutes);
app.post("/api/:username/follow", helpers.followUser);
app.use("/api/messages/:mid/like", helpers.likeMessage);
app.get("/api/messages", helpers.getGetAllMessages);
const PORT = 8081;
app.listen(PORT, function(){
  console.log(`Server is listening on port ${PORT}`);
});
