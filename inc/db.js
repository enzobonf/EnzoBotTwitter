const mongoose = require('mongoose');
//const credentials = require('./dbCredentials.json');

require('dotenv').config();

mongoose.connect(process.env.DB_URI, {user: process.env.DB_USER, pass: process.env.DB_PASSWORD, useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('db conectado!');
});

let userSchema = new mongoose.Schema({
    botName: String,
    running: Boolean,
    blockedUsers: Array,
    totalRetweets: Number,
    retweetsPerTime: Number,
});

let configs = mongoose.model('configs', userSchema, 'configs');

module.exports = {mongoose, userSchema: userSchema, configs};


//mongod --port 27017 -dbpath /srv/mongodb/db0 --replSet rs0 --bind_ip localhost