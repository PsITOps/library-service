var morgan = require('morgan');

var env = process.env.NODE_ENV || 'development';

module.exports = function () {
    if (env == 'test') {
        return function (req, res, next) {
            next();
        }
    } else if (env == 'production') {
        return morgan('[:date[web]] :method :url :status - :remote-addr ');
    }

    return morgan('dev');
}