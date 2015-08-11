var path = require("path");
var webpack = require("webpack");

module.exports = {
  devtool: "eval",
  entry: [
    "webpack-dev-server/client?http://localhost:3000",
    "webpack/hot/only-dev-server",
    "./scripts/index.js"
  ],
  output: {
    path: path.join(__dirname, "scripts"),
    filename: "bundle.js",
    publicPath: "scripts/"
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ["", ".js", ".jsx", ".less"]
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ["react-hot", "babel"],
      include: path.join(__dirname, "scripts"),
    },
    {
      test: /\.less$/,
      loader: 'style!css!less'
    }]
  }
};
