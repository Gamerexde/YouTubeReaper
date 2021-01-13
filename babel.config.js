const { plugins } = require("./webpack/react.webpack");

module.exports = {
    presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript'
    ],
    plugins: [
        '@babel/transform-runtime'
    ]
}