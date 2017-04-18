var index = require('./');
var users = require('./user/user');
var auth = require('./auth/auth')

module.exports = function (app) {
    app.use('/', index);
    app.use('/', auth);
    app.use('/users', users);

}