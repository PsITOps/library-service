var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
    title: String,
    genre: String,
    author: String,
    description: String,
    isAvailable: Boolean
})

module.exports = mongoose.model('Book', Book);