const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({extended: true}));

// SETUP CORS

app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
  })
);

// CORS SETUP ENDS

// SET UP SESSION
app.use(session({
  secret: "Randy, let's recreate the fun of interaction",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// SESSION SETUP COMPLETE

// MONGO SETUP
var MONGODB_URI = "";
if (process.env.NODE_ENV === 'production')
  MONGODB_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.qvaqf.mongodb.net/Hackanect?retryWrites=true&w=majority`;
else
  MONGODB_URI = "mongodb://localhost:27017/hacka-demic";

mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
});
// MONGO SETUP DONE

const User = require("./models/userModel");
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// ROUTES CONFIG STARTS
const indexRoute = require("./routes/index");
const googleAuth = require("./routes/Auth/googleAuth");
const githubAuth = require("./routes/Auth/githubAuth");
const isLoggedIn = require("./middleware/isLoggedIn");
const createRoom = require('./routes/Rooms/createRoom');
const joinRoom = require('./routes/Rooms/joinRoom');
// ROUTES CONFIG ENDS


// APP CONFIG STARTS
app.use("/api/",indexRoute);
app.use("/api/auth/google",googleAuth);
app.use("/api/auth/github",githubAuth);
app.use("/api/loggedIn",isLoggedIn);
app.use("/api/createroom", createRoom);
app.use("/api/joinroom", joinRoom);
// APP CONFIG ENDS

const server = app.listen(port, function(){
    console.log(`Server started locally at port ${port}`);
});