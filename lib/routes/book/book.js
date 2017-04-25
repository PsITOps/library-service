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

var checkBookExists = function (req, res, next) {
    Book.findById(req.params.id)
        .then(book => {
            if (book) {
                req.book = book;
                next();
            } else {
                res.json({
                    valid: false,
                });
            }
        })
}

var checkBookAvailable = function (req, res, next) {
    if (req.book.isAvailable) {
        next();
    } else {
        res.json({
            valid: false
        });
    }
}

router.post('/:id/rent', checkBookExists, checkBookAvailable, (req, res) => {

    let date = new Date();

    User.findByIdAndUpdate(req.user._id, {
            $push: {
                books: {
                    title: req.book.title,
                    book: req.book._id
                }
            }
        })
        .then(user => {
            res.json({
                'valid': true,
                'borrowedBook': req.book,
                'returnDate': date
            })
        })
});

module.exports = router;