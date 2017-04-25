var express = require('express'),
    User = require('../../models/user'),
    LibrarianValidator = require('./librarian-validator'),
    TokenManager = require('./web-token-manager'),
    logic = require('./auth-logic');

var tokenManager = new TokenManager();
var librarianValidator = new LibrarianValidator();
var router = express.Router();

let {
    validateLogin,
    validateLibrarianCode,
    validateCredentials
} = logic;

router.post('/signup', validateLogin, validateLibrarianCode, (req, res) => {

    let isLibrarian = librarianValidator.isLibrarianCode(req.body.librarianCode);

    let newUser = new User(req.body);
    newUser.isLibrarian = isLibrarian;

    newUser.save().then(user => {
        res.json({
            valid: true,
            isLibrarian: isLibrarian
        });
    }).catch(err => {
        res.json(err);
    })
})

router.post('/signin', validateCredentials, (req, res) => {
    return tokenManager.generateToken(tokenManager.getPayload(req.user))
        .then(token => {
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

router.use('/api', (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    tokenManager.validateToken(token)
        .then(payload => {
            req.user = payload;
            next();
        }).catch(err => {
            res.status(401).json({
                valid: false,
                message: 'Wystąpił problem z uwierzytelnieniem'
            })
        })
})

module.exports = router;