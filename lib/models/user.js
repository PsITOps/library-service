var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    name: String,
    lastname: String,
    login: String,
    password: String,
    isLibrarian: Boolean
})

module.exports = mongoose.model('User', User);