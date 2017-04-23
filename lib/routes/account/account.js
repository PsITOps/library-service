var express = require('express'),
    Book = require('../../models/book')

var router = express.Router();

router.get('/account/books', (req, res) => {
    res.end();
})