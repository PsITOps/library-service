var express = require('express'),
    Book = require('../../models/book'),
    User = require('../../models/user')

var router = express.Router();

router.get('/books', (req, res) => {
    User.findById(req.user._id)
        .then(loggedUser => {
            res.json({
                valid: true,
                books: []
            })
        })
})

module.exports = router;