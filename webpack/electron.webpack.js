const path = require('path')
const webpack = require('webpack')

const rootPath = path.resolve(__dirname, '..')

module.exports = {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.FLUENTFFMPEG_COV': false
        })
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    devtool: 'source-map',
    entry: path.resolve(rootPath, 'electron', 'main.ts'),
    target: 'electron-main',
    module: {
        rules: [{
            test: /\.(js|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader'
            }
        }]
    },
    node: {
        __dirname: false
    },
    output: {
        path: path.resolve(rootPath, 'dist'),
        filename: '[name].js'
    }
}