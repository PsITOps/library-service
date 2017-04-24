var express = require('express'),
    Book = require('../../models/book'),
    User = require('../../models/user');

var router = express.Router();

router.get('/', (req, res) => {
    Book.find({})
        .then(books => {
            res.json(books);
        })
        .catch(err => {
            res.json(err);
        })
})

var librarianRequired = function (req, res, next) {
    next();
}

router.post('/', librarianRequired, (req, res) => {
    var book = new Book(req.body);
    book.save()
        .then(book => {
            res.end();
        })
        .catch(err => {
            res.end();
        })
});


var validateBookAvailability = function (req, res, next) {
    next();
}

router.post('/:id/rent', validateBookAvailability, (req, res) => {
    res.end();
})

module.exports = router;