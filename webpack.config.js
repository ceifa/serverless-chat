const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js'
    },
    module: {
        defaultRules: [
            {
                type: 'javascript/auto',
                resolve: {}
            }
        ],
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }, {
            type: 'javascript/auto',
            test: /\.(ttf|wasm|woff|woff2)$/,
            use: ['file-loader']
        }, {
            test: /\.lua$/,
            use: ['raw-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        // new CopyWebpackPlugin({
        //     patterns: [
        //         { from: 'src/assets', to: 'assets' },
        //     ],
        // }),
    ],
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 1337,
    },
};