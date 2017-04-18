var express = require('express'),
    User = require('../user/user-model'),
    LibrarianValidator = require('./librarian-validator'),
    UserLogin = require('../user/user.logic')

var librarianValidator = new LibrarianValidator();
var authRouter = express.Router();
var userLogic = new UserLogin();

authRouter.post('/signin', (req, res) => {
    // change to async/await
    if (userLogic.isAnyUserWithLogin(req.body.login, (err, result) => {
            if (result) {
                res.status(409).json({
                    valid: false,
                    message: 'Podany login już istnieje'
                })
                return;
            }

            let isLibrarian = librarianValidator.isLibrarian(req.body.librarianCode);

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
        }));


})

module.exports = authRouter;