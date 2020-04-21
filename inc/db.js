const mongoose = require('mongoose');
const credentials = require('./dbCredentials.json');
mongoose.connect('mongodb://localhost:27017/botsConfig', {user: credentials.user, pass: credentials.password, authSource: 'admin', useNewUrlParser: true, useUnifiedTopology: true});

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