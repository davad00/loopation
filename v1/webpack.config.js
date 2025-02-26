const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './examples/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/examples'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './examples/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/examples'),
    },
    historyApiFallback: true,
    compress: true,
    port: 9000,
    hot: true,
    open: true
  },
}; 