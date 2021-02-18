const express = require('express')
const app = express()
const cors = require('cors')
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
//const console = require("console")
require('dotenv').config()


mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String
});

const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date
});

const userObj = mongoose.model("user", userSchema);

const exerciseObj = mongoose.model("exercise", exerciseSchema);

function createNewUser(username) {
  let newUser = new userObj({ username: username })
  newUser.save((err, data) => {
    if (err) {
      console.log(err);
      return 
    }

  });
  return newUser
}



async function getUsers() {
  return userObj.find({});

}

function addExerciseLog(userId, description, duration, date) {
let newExercise=new exerciseObj({_id: userId, description: description, duration: duration, date: date})
  newExercise.save((err, data) => {
    if (err) {
      console.log(err);
      return 
    }

  });
  //console.log(newExercise)
  return newExercise
}

function getLogs() {

}

app.post('/api/exercise/new-user', function(req, res) {
  let user = createNewUser(req.body.username)
  res.json({ username: user.username, _id: user._id })
})

app.get('/api/exercise/users', async function(req, res) {
  let g = await getUsers()
  let userArray = []

  g.forEach(function(e) {
    userArray.push({username: e.username, _id: e._id})

  })

  res.json(userArray)

})

app.post('/api/exercise/add', function(req, res) {

  let date;
  if (req.body.date===null) {
    date=new Date()
  } else {
    date = req.body.date
  }
  
let exercise = addExerciseLog(req.body.userId, req.body.description, req.body.duration, date)
console.log(exercise)
res.json(exercise)
})

app.get('/api/exercise/log', function(req, res) {

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
