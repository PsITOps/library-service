var express = require('express'),
    Book = require('../../models/book'),
    User = require('../../models/user')

var router = express.Router();

router.get('/books', (req, res) => {
    User.findById(req.user._id)
        .then(loggedUser => {
            return User.populate(loggedUser, {
                path: 'books.book'
            })
        })
        .then(populated => {
            res.json({
                valid: true,
                books: populated.books.map(x => x.book)
            })
        })
})

module.exports = router;