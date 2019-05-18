const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')

module.exports = {
  entry: "./src/app.js",
  devtool: "source-map",
  output: {
    path: path.join(__dirname, "public/js"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        // vue-loader config to load `.vue` files or single file components.
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // https://vue-loader.vuejs.org/guide/scoped-css.html#mixing-local-and-global-styles
            css: ['vue-style-loader', {
              loader: 'css-loader'
            }],
            js: [
              'babel-loader'
            ],
          },
          cacheBusting: true
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        loader: [ "style-loader", "css-loader" ]
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    // make sure to include the plugin!
    new VueLoaderPlugin()
  ]
}
