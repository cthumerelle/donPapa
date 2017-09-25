const path = require('path');

const config = {
    entry: './rum.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
};

module.exports = config;