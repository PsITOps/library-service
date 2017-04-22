var express = require('express'),
    User = require('../../models/user'),
    LibrarianValidator = require('./librarian-validator'),
    UserLogin = require('../user/user-logic'),
    TokenManager = require('./web-token-manager');


var tokenManager = new TokenManager();
var librarianValidator = new LibrarianValidator();
var authRouter = express.Router();
var userLogic = new UserLogin();

authRouter.post('/signin', (req, res) => {
    userLogic.isAnyUserWithLogin(req.body.login)
        .then(loginExists => {
            if (loginExists) {
                res.status(409).json({
                    valid: false,
                    message: 'Podany login już istnieje'
                })
                return;
            }

            let isLibrarian = librarianValidator.isLibrarianCode(req.body.librarianCode);

            let newUser = new User({
                name: req.body.name,
                lastname: req.body.lastname,
                login: req.body.login,
                password: req.body.password,
                isLibrarian: isLibrarian
            });

            if (librarianValidator.isWrongLibrarianCodeSupplied(req.body.librarianCode)) {
                res.status(400).json({
                    valid: false,
                    message: 'Błędny kod potwierdzający'
                }).end();

                return
            }

            newUser.save().then(user => {
                res.json({
                    valid: true,
                    isLibrarian: isLibrarian
                });
            }).catch(err => {
                res.json(err);
            })
        }).catch(err => {
            res.json({
                valid: false,
                err: err
            })
        })
})

authRouter.post('/login', (req, res, next) => {
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
})

authRouter.post('/login', (req, res) => {
    return tokenManager.generateToken(tokenManager.getPayload(req.user))
        .then(token => {
            if (!token) return;
            var isLibrarian = librarianValidator.isLibrarianUser(req.user);
            res.json({
                token: token,
                valid: true,
                isLibrarian: isLibrarian
            })
        }).catch(err => {
            res.json({
                valid: false,
                err: err
            })
        })
})

module.exports = authRouter;