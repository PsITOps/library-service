let jwt = require('jsonwebtoken'),
    config = require('config');

class TokenManager {
    constructor() {
        this.secredKey = config.get('secredKey');
    }

    getPayload(user) {
        return {
            _id: user._id
        };
    }

    generateToken(payload) {
        return new Promise((resolve, reject) => {

            if (!payload) {
                reject(new Error('Payload must be supplied'))
            }

            jwt.sign(payload, this.secredKey, {}, (err, token) => {
                if (err) reject(err)

                resolve(token);
            })
        })
    }
}

module.exports = TokenManager;