const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devServer: {
    contentBase: './dist',
    hot: true,
    compress: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'p5 Sketch',
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'
      }
    })
  ]
}
