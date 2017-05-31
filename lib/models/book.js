var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Book = new Schema({
    title: String,
    genre: String,
    author: String,
    description: String,
    isAvailable: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Book', Book);