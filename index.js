const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = {};

const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri);


const logSchema = new mongoose.Schema({
  description : { type: String, required : true},
  duration : { type : Number, required : true},
  date : { type : Date, default : Date.now}
});

const dbSchema = new mongoose.Schema({
  username : { type : String, required : true},
  count : { type : Number, default : 0},
  log : { type : [logSchema]}
});

const trackerModel = mongoose.model("trackerModel", dbSchema); 

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

console.log("start check");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/users', async (req,res) => {
  try{
    const inputUsername = req.body.username;
    console.log(inputUsername);
    const checkUser = await trackerModel.findOne({username : inputUsername});
    if(checkUser){
      res.json({username : checkUser.username, _id : checkUser._id});
    }
    else{
      const newUser = new trackerModel({username: inputUsername});
      await newUser.save();
      res.json({username : newUser.username, _id : newUser._id});
    }
  } 
  catch(err){
    res.json({error: 'error'});
  }
});

app.post('/api/users/:_id/exercises', async(req,res) => {
  try{
    const inputId = req.params._id;
    const inputDescription = req.body.description;
    const inputDuration = req.body.duration;
    let dateString;
    if(req.body.date){
      const inputDate = new Date(req.body.date);
      dateString = inputDate.toDateString();
    }
    //console.log("dateString : " + dateString);
    const checkUserId = await trackerModel.findOne({_id : inputId});
    if(checkUserId){
      const newLog = {
        description : inputDescription,
        duration : inputDuration,
        date: dateString
      };
     // console.log("usedate: " + newLog.date);
      checkUserId.log.push(newLog);
      checkUserId.count += 1;
      await checkUserId.save();

      res.json({
        username : checkUserId.username,
        description : checkUserId.log[checkUserId.count-1].description,
        duration : checkUserId.log[checkUserId.count-1].duration,
        date : checkUserId.log[checkUserId.count-1].date.toDateString(),
        _id : checkUserId._id
      });
    }
    else{
      console.log("ID not found");
    }
    
  } 
  catch(error){
    console.error("Error", error);
  }
});

app.get('/api/users', async (req,res) => {
  const findUsers = await trackerModel.find({});
  const allUsersArray = findUsers.map(users => ({
    username : users.username,
    _id : users._id
  }));
  res.send(allUsersArray);
});

app.get('/api/users/:_id/logs', async (req,res) => {
  const userInputId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  
  const findUserLogs = await trackerModel.findById(userInputId);
 
  if(!findUserLogs){
    res.status(404).json({ error: 'User not found' });
  }
  let userLog = findUserLogs.log;
  if(from || to){
    let startDate;
    let endDate;
    if(from){
      startDate = new Date(from);
      console.log("start at" + startDate);
    }
    if(to){
      endDate = new Date(to);
      console.log("up to" + endDate);
    }

    userLog = userLog.filter(matchLog => {
      const logDate = new Date(matchLog.date);
      console.log("logDate is : " + logDate);
      return (logDate >= startDate) && (logDate <= endDate);
    });
  }

  const limitInt = parseInt(limit);
  console.log("limit is: " + limitInt);
  if(limitInt){
    userLog = userLog.slice(0,limitInt);
  }
  console.log("userLog is: " + userLog);
  const convertedLog = userLog.map(logs => ({
    ...logs.toObject(),
    date : logs.date.toDateString()
  }));

  res.json({
    _id : findUserLogs._id,
    username : findUserLogs.username,
    count : userLog.length,
    log: convertedLog
  });

});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
