var express = require('express');

var index = require('./');
var users = require('./user/user');
var auth = require('./auth/auth');
var books = require('./book/book');

var api = express.Router();

//api.use('/users', users);
api.use('/books', books);

module.exports = function (app) {
    app.use('/', index);
    app.use('/', auth);
    app.use('/api', api);
}