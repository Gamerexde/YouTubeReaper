const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const rootPath = path.resolve(__dirname, '..')

module.exports = {
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        mainFields: ['main', 'module', 'browser']
    },
    entry: path.resolve(rootPath, 'src', 'App.tsx'),
    target: 'electron-renderer',
    devtool: 'source-map',
    module: {
        rules: [{
                test: /\.(js|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader, // instead of style-loader
                    'css-loader'
                ]
            }
        ]
    },
    devServer: {
        contentBase: path.join(rootPath, 'dist/renderer'),
        historyApiFallback: true,
        compress: true,
        hot: true,
        host: '0.0.0.0',
        port: 4000,
        publicPath: '/'
    },
    output: {
        path: path.resolve(rootPath, 'dist/renderer'),
        filename: 'js/[name].js',
        publicPath: './'
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({ title: "YouTube Reaper" })
    ]
}