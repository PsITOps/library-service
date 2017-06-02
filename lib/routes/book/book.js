var express = require('express'),
    Book = require('../../models/book'),
    User = require('../../models/user'),
    moment = require('moment');

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


    User.findById(req.user._id)
        .then(loggedUser => {

            if (loggedUser.isLibrarian) {
                next();
            } else {
                res.status(401).json({
                    valid: false,
                    message: 'Tylko bibliotekarz może rejestrować książki'
                })
            }
        })
}

var checkTitleProvided = function (req, res, next) {
    if (!req.body.title) {
        res.status(403).json({
            valid: false,
            message: 'Należy podać tytuł nowej książki'
        })
    } else {
        next();
    }
}

router.post('/', librarianRequired, checkTitleProvided, (req, res) => {
    var book = new Book(req.body);
    book.save()
        .then(book => {
            res.json({
                valid: true
            })
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

var checkBookRentByLoggedUser = function (req, res, next) {
    User.findById(req.user._id)
        .then(loggedUser => {
            req.user = loggedUser
            if (loggedUser.books.some(x => x.book == req.params.id)) {
                next()
            } else {

                res.status(403).json({
                    valid: false,
                    message: 'Nie można zwrócić książki'
                })
            }
        })
}

router.post('/:id/return', checkBookExists, checkBookRentByLoggedUser, (req, res) => {

    User.update({
            _id: req.user._id
        }, {
            $pull: {
                books: {
                    book: req.params.id
                }
            }
        })
        .then(() => {
            return req.book.update({
                $set: {
                    isAvailable: true
                }
            });
        })
        .then(() => {

            res.json({
                valid: true
            });
        })
})

router.post('/:id/rent', checkBookExists, checkBookAvailable, (req, res) => {

    let date = moment().add(30, 'days');

    User.findByIdAndUpdate(req.user._id, {
            $push: {
                books: {
                    title: req.book.title,
                    book: req.book._id,
                    returnDate: date
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


router.post('/:id/rent/extend', checkBookExists, checkBookRentByLoggedUser, (req, res) => {

    let date = moment().add(30, 'days');

    User.update({
        "books.book": req.params.id
    }, {
        $set: {
            "books.0.returnDate": date
        }
    }).then(() => {

        res.json({
            valid: true,
            returnDate: date
        })
    })
})

router.delete('/:id', checkBookExists, librarianRequired, (req, res) => {
    Book.findByIdAndRemove(req.params.id)
        .then(removedBook => {
            res.json({
                valid: true,
            })
        })
})


router.post('/:id', checkBookExists, librarianRequired, (req, res) => {
    Book.findByIdAndUpdate(req.params.id, {
            $set: {
                title: req.body.title,
                genre: req.body.genre,
                author: req.body.author,
                description: req.body.description,
            }
        })
        .then(() => {
            res.json({
                valid: true,
            })
        })
})

module.exports = router;