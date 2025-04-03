const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = {};

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;
mongoose.connect(mongoUri);


const userSchema = new mongoose.Schema({
  username : { type : String, required : true}
});

const logSchema = new mongoose.Schema({
  description : { type: String, required : true},
  duration : { type : Number, required : true},
  date : { type : Date, default : Date.now}
});

const dbSchema = new mongoose.Schema({
  username : { type : String, required : true},
  description : { type: String, required : true},
  duration : { type : Number, required : true},
  date : { type : Date, default : Date.now},
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

app.post('/api/users', (req,res) => {
  const inputUsername = req.body.username;
  console.log(inputUsername);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
