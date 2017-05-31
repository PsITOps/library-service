var express = require('express'),
    Book = require('../../models/book'),
    User = require('../../models/user');

var router = express.Router();

router.get('/', (req, res) => {
    Book.find({})
        .then(books => {
            res.json({
                valid: true,
                books: books
            });
        })
        .catch(err => {
            res.json({
                valid: flase,
                err: err
            });
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
                res.status(404).json({
                    valid: false,
                    message: 'Nie znaleziono książki'
                });
            }
        })
}

var checkBookAvailable = function (req, res, next) {
    if (req.book.isAvailable) {
        next();
    } else {
        res.status(400).json({
            valid: false,
            message: 'Nie można wypożyczyć książki, ponieważ jest ona niedostępna'
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
            return req.book.update({
                $set: {
                    isAvailable: false
                }
            });
        })
        .then(updatedBook => {
            res.json({
                'valid': true,
                'borrowedBook': req.book,
                'returnDate': date
            })
        })
});

module.exports = router;