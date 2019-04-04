import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { DuplicatesPlugin } from 'inspectpack/plugin';

export default {
  devtool: 'inline-source-map',
  mode: 'development',
  cache: true,

  target: 'web',

  entry: './test/app.js',
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
        test: /\.flow$/,
        loader: 'ignore-loader'
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'graphql-server',
      template: './test/index.html'
    }),
    new DuplicatesPlugin({
      verbose: true
    }),
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
    before: function(app) {
      app.get('/graphiql.css', function(req, res) { 
        res.sendFile( path.resolve(__dirname, 'node_modules/graphiql/graphiql.css') );
      });
    },
    proxy: {
      '/api': 'http://localhost:8080/graphql'
    },
    contentBase: './test',
    historyApiFallback: true,
    watchContentBase: true,
    port: 3000
  }
};