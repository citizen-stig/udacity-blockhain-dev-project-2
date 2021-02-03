const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new CopyWebpackPlugin(
            {
                patterns: [{from: "./src/index.html", to: "index.html"}]
            }),
    ],
    devServer: {contentBase: path.join(__dirname, "dist"), compress: true},
    resolve: {
        fallback: {
            assert: require.resolve("assert/"),
            crypto: require.resolve("crypto-browserify"),
            os: require.resolve("os-browserify/browser"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            stream: require.resolve("stream-browserify"),
        }
    },
};
