var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    name: String,
    lastname: String,
    login: String,
    password: String,
    isLibrarian: Boolean,
    books: [{
        returnDate: Date,
        title: String,
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        }
    }]
})

module.exports = mongoose.model('User', User);