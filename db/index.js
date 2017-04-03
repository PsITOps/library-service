var mongoose = require('mongoose');
var config = require('config');

var db = config.get('db');

var connect = function () {
    mongoose.connect(db);
}

module.exports = {
    connect: connect
}