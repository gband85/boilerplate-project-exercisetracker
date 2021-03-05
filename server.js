const express = require('express')
const app = express()
const cors = require('cors')
const mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const bodyParser = require("body-parser");
const { ObjectID } = require('mongodb');
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



//https://medium.com/@beaucarnes/learn-the-mern-stack-by-building-an-exercise-tracker-mern-tutorial-59c13c1237a1

//https://www.youtube.com/watch?v=ANfJ0oGL2Pk

//https://studio3t.com/knowledge-base/articles/mongodb-aggregation-framework

//https://stackoverflow.com/questions/40083592/mongo-unwind-and-group

//https://www.tutorialspoint.com/grouping-the-array-items-in-mongodb-and-get-the-count-the-products-with-similar-price


const exerciseSchema = new Schema({
  description: String,
  duration: Number,
  date: String
});

const userSchema = new Schema({
  username: String,
  log: [exerciseSchema]
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



async function addExerciseLog(exObj) {

let exerciseDate,exerciseDate0;

if (exObj.date) {
  exerciseDate = new Date(exObj.date)
} 
else {
 exerciseDate=new Date()
}


//create new exerciseObj with input data
  let newExercise=new exerciseObj
  ({
    description: exObj.description,
    duration: exObj.duration,
    date: exerciseDate.toISOString().slice(0,10)
  })

  
 let updatedUser=await userObj.findByIdAndUpdate(
 exObj.userId,
 {$addToSet: {log: newExercise}}, /*add exerciseObj to log array*/
 {new: true}) /*return new document, run query now*/
 console.log(updatedUser)

let response = new Object({_id: updatedUser._id,username: updatedUser.username, description: newExercise.description,duration:newExercise.duration, date: exerciseDate.toDateString()})
// newExercise.username=updatedUser.username
  
  return response
}



async function getLogs(query) {

 let logs
  if (query.userId) {

    if (query.from && !query.to) {

if (query.limit) {
//console.log(query.limit)

 logs =  await userObj.aggregate([
   
  { $match : { _id : mongoose.Types.ObjectId(query.userId) } },
  {$unwind: "$log"},
  
  
   {$match:{"log.date":{ $gte : query.from  }}},
   {$sort:{"log.date":-1}},
   { $limit : query.limit }, 
   {
     $group:{
       _id:"$_id",
       username:{"$first":"$username"},
       count: { "$sum": 1 },
       log:{$push:"$log"}}},
      {$project:{"log._id":0}}



])

}

else {



 logs =  await userObj.aggregate([

{ $match : { _id : mongoose.Types.ObjectId(query.userId) } },
{$unwind: "$log"},


 {$match:{"log.date":{ $gte : query.from  }}},
{$sort:{"log.date":-1}},
 {$group:{_id:"$_id",username:{"$first":"$username"},count: { "$sum": 1 },log:{$push:"$log"}}},
        {$project:{"log._id":0}}

//{ $project : { log : { $filter : { input : "$log", cond : { $gte : [ "$$this.date", query.from ] } } } } }

 ])

}
console.log(logs)
   return logs
    }

        if (!query.from && query.to ) {

if (query.limit) {

  logs =  await userObj.aggregate([
   
    { $match : { _id : mongoose.Types.ObjectId(query.userId) } },
    {$unwind: "$log"},
    
    
     {$match:{"log.date":{ $lte : query.to  }}},
  {$sort:{"log.date":-1}},
  { $limit : query.limit }, 

  {$group:{_id:"$_id",username:{"$first":"$username"},count: { "$sum": 1 },log:{$push:"$log"}}},
        {$project:{"log._id":0}}
  
  ])
//return logs
}
else {
  logs =  await userObj.aggregate([
   
    { $match : { _id : mongoose.Types.ObjectId(query.userId) } },
    {$unwind: "$log"},
    
    
     {$match:{"log.date":{ $lte : query.to  }}},
     {$sort:{"log.date":-1}},

     {$group:{_id:"$_id",username:{"$first":"$username"},count: { "$sum": 1 },log:{$push:"$log"}}},
     {$project:{"log._id":0}}

  ])

}

return logs

}


      if (query.from && query.to) {
if (query.limit) {
logs =  await userObj.aggregate([
{ $match : { _id : mongoose.Types.ObjectId(query.userId) } },
{$unwind: "$log"},
{$match:{"log.date":{ $gte: query.from, $lte : query.to  }}},
{$sort:{"log.date":-1}},
  { $limit : query.limit },
  {$group:{_id:"$_id",username:{"$first":"$username"},count: { "$sum": 1 },log:{$push:"$log"}}},
        {$project:{"log._id":0}}
 ])

 //return logs

}
else {
  logs =  await userObj.aggregate([
    { $match : { _id : mongoose.Types.ObjectId(query.userId) } },
    {$unwind: "$log"},
    {$match:{"log.date":{ $gte: query.from, $lte : query.to  }}},
    {$sort:{"log.date":-1}},
    {$group:{_id:"$_id",username:{"$first":"$username"},count: { "$sum": 1 },log:{$push:"$log"}}},
        {$project:{"log._id":0}}
     ])
 
}
return logs

      }
      if (query.limit) {
              logs =  await userObj.aggregate([
      

        { $match :  { _id : mongoose.Types.ObjectId(query.userId) } },

        {$unwind: "$log"},
    
        {$sort:{"log.date":-1}},
        { $limit : query.limit },
        {$group:{_id:"$_id",username:{"$first":"$username"},count:{"$sum":1},log:{$push:"$log"}}},
       
        {$project:{"log._id":0}}
      ])
      }
      else {
      logs =  await userObj.aggregate([
      

        { $match :  { _id : mongoose.Types.ObjectId(query.userId) } },

        {$unwind: "$log"},
    
        {$sort:{"log.date":-1}},
        {$group:{_id:"$_id",username:{"$first":"$username"},count:{"$sum":1},log:{$push:"$log"}}},
       
        {$project:{"log._id":0}}
      ])
      console.log(logs)
  }
    return logs
  }
  else {
    return "No userId Entered"
  }

}

//You can POST to /api/exercise/new-user with form data username to create a new user. The returned response will be an object with username and _id properties.

app.post('/api/exercise/new-user', function(req, res) {
  let user = createNewUser(req.body.username)
  console.log(user)
  res.json({ username: user.username, _id: user._id })
})

//You can make a GET request to api/exercise/users to get an array of all users. Each element in the array is an object containing a user's username and _id.

app.get('/api/exercise/users', async function(req, res) {
 
  res.json(await userObj.find({},'username _id').exec())

})

//You can POST to /api/exercise/add with form data userId=_id, description, duration, and optionally date. If no date is supplied, the current date will be used. The response returned will be the user object with the exercise fields added. (_id,username,description,duration,date)

//format in db does not look like what is returned: make sure it's a subdocument in the log field array,  not separate docs with username, description, duration, date


app.post('/api/exercise/add', async function(req, res) {


  let exercise = await addExerciseLog(req.body)

 res.json(exercise)
})

/*You can make a GET request to /api/exercise/log with a parameter of userId=_id to retrieve a full exercise log of any user. The returned response will be the user object with a log array of all the exercises added. Each log item has the description, duration, and date properties.

A request to a user's log (/api/exercise/log) returns an object with a count property representing the number of exercises returned.

You can add from, to and limit parameters to a /api/exercise/log request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.

1. if dateFrom exists,dateTo doesn't:start at dateFrom, return to end
unless limit&&limit<range

2. if dateFrom doesn't exist but dateTo does: start at beginning, return to dateTo
unless limit&&limit<range

3. if both exist: dateFrom to dateTo
unless limit&&limit<range

4. neither exist: beginning to end,
unless limit&&limit<range
*/

app.get('/api/exercise/log:userId?', async function(req, res) {
  console.log(req.query)
  let query=req.query
  if (req.query.limit) {
  query.limit=parseInt(query.limit)
  }
 // console.log(query)
let exercises=await getLogs(query)

//console.log(exercises)
res.json(exercises[0])
//res.json({_id:exercises._id,username: exercises.username,count: exercises["log"].length,log: exercises.log})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
