const path = require('path')

module.exports = {
  output: {
    // If path is missing, it's default value is './'
    path: path.resolve('./'),
    filename: path.join('dist', 'main.js'),
  }
};
