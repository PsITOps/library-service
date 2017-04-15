var express = require('express'),
    User = require('../user/user.model'),
    librarianValidator = require('./librarian-validator');

var authRouter = express.Router();

authRouter.post('/signin', (req, res) => {

    let newUser = new User({
        name: req.body.name,
        lastname: req.body.lastname,
        login: req.body.login,
        password: req.body.password,
        isLibrarian: librarianValidator.isLibrarian(req.body.librarianCode)
    });

    newUser.save().then(user => {
        res.end();
    }).catch(err => {
        res.json(err);
    })
})





module.exports = {
    router: authRouter,
    isLibrarianCodeSupplied: isLibrarianCodeSupplied,
}