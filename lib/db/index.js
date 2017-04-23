var mongoose = require('mongoose');
var config = require('config');

var db = config.get('db');

var connect = function () {
    mongoose.connect(db).then(() => {
        console.log('Successfully connected to the mongodb server');
    }).catch(err => {
        console.log(err);
    })
}

module.exports = {
    connect: connect
}