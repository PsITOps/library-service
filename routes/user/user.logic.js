let User = require('./user-model');

class UserLogic {

    constructor() {

    }

    isAnyUserWithLogin(login, cb) {
        User.findOne({
            login: login
        }).then(doc => {
            cb(null, doc != null)
        }).catch(err => {
            console.log(err);
            cb(err, false);
        })
    }
}

module.exports = UserLogic;