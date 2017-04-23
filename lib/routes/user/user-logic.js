let User = require('../../models/user');

class UserLogic {

    constructor() {}

    isAnyUserWithLogin(login) {
        return new Promise((resolve, reject) => {
            User.findOne({
                login: login
            }).then(doc => {
                resolve(doc != null);
            }).catch(err => {
                reject(err);
            })
        });
    }
}

module.exports = UserLogic;