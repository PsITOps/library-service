var UserLogin = require('../user/user-logic'),
    LibrarianValidator = require('./librarian-validator'),
    User = require('../../models/user');

var userLogic = new UserLogin();
var librarianValidator = new LibrarianValidator();

var validateCredentials = function (req, res, next) {
    User.findOne({
        login: req.body.login,
        password: req.body.password
    }).then(user => {
        if (!user) {
            res.status(401).json({
                valid: false,
                message: 'Błędne dane logowania'
            });
        } else {
            req.user = user;
            next();
        }
    }).catch(err => {
        res.json({
            valid: false,
            err: err
        })
    })
}

var validateLogin = function (req, res, next) {
    userLogic.isAnyUserWithLogin(req.body.login)
        .then(loginExists => {
            if (loginExists) {
                res.status(409).json({
                    valid: false,
                    message: 'Podany login już istnieje'
                })
            } else {
                next();
            }
        }).catch(err => {
            res.json({
                valid: false,
                err: err
            })
        })
}

var validateLibrarianCode = function (req, res, next) {
    if (librarianValidator.isWrongLibrarianCodeSupplied(req.body.librarianCode)) {
        res.status(400).json({
            valid: false,
            message: 'Błędny kod potwierdzający'
        })
    } else {
        next();
    }
}

module.exports = {
    validateLogin,
    validateLibrarianCode,
    validateCredentials
}