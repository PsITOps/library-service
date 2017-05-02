var path = require('path');

module.exports = function (mainFolderPath) {
    process.env.NODE_CONFIG_DIR = path.join(mainFolderPath, 'config');
}