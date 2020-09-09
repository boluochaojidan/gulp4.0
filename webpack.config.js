var path = require('path')

module.exports = {
  mode: 'development',
  devtool: false,
  performance: {
    // hints: false,
    maxEntrypointSize: 700000,
    maxAssetSize: 700000
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: ['@babel/preset-env'],
          plugins: [
            "syntax-dynamic-import",
            "@babel/plugin-transform-runtime",
            "@babel/plugin-transform-modules-commonjs",
          ]
        }
      }
    },
    {
      test: /\.js$/,
      use: [
        {
          loader: 'preprocess-loader',
          options: {
            // 填写变量
            NODE_ENV: process.env.NODE_ENV,
            ppOptions: {
              type: 'js'
            }
          }
        }
      ]
    }]
  },
  resolve: {
    alias: {
      "utils": path.resolve(__dirname, "src/js/utils/"),
      "json": path.resolve(__dirname, "src/json/")
    }
  }
}
