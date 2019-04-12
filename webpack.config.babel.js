import fs from 'fs';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { DuplicatesPlugin } from 'inspectpack/plugin';

export default {
  devtool: 'inline-source-map',
  mode: 'development',
  cache: true,
  target: 'web',

  entry: './test/App.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          'src',
          'node_modules/@kemsu',
          'test',
        ].map(_ => path.resolve(__dirname, _)),
        loader: 'babel-loader',
        options: fs.readFileSync('.babelrc') |> JSON.parse
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' }
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: 'graphql-server',
      template: './test/index.html'
    }),
    new DuplicatesPlugin({})
  ],

  optimization: {
    namedChunks: true,
    namedModules: false,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },

  devServer: {
    proxy: {
      '/api': 'http://localhost:8080/graphql',
      '/error': 'http://localhost:8080/error'
    },
    contentBase: './test/server',
    historyApiFallback: true,
    watchContentBase: true,
    port: 3000
  }
};