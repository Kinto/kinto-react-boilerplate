module.exports = function (config) {
  config.set({
    browsers: ["Firefox"],
    singleRun: true,
    frameworks: ["chai", "mocha", "sinon"],
    plugins: [
      "karma-firefox-launcher",
      "karma-chai",
      "karma-mocha",
      "karma-sinon",
      "karma-sourcemap-loader",
      "karma-webpack",
    ],
    files: [
      "tests.webpack.js"
    ],
    preprocessors: {
      "tests.webpack.js": ["webpack", "sourcemap"]
    },
    reporters: ["dots"],
    webpack: {
      devtool: "inline-source-map",
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: "babel-loader",
            exclude: /node_modules/
          }
        ]
      }
    },
    webpackServer: {
      noInfo: true
    }
  });
};
