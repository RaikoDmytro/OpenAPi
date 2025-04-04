const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { DefinePlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Add this plugin
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

module.exports = {
  mode: 'production', // Set production mode for optimizations

  entry: {// Starting point of your application
    front: ['core-js/stable', 'regenerator-runtime/runtime', './src/index.js'],
  },

  optimization: {
    minimize: true, // Enable minification
      minimizer: [
          new TerserPlugin({
              terserOptions: {
                  compress: {
                      drop_console: true,
                  },
              },
          }),
          new CssMinimizerPlugin({}),
      ],
      splitChunks: {
          cacheGroups: {
              commons: {
                  name: 'common',
                  chunks: 'initial',
                  minChunks: 2,
              },
          },
      },
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js', // Add content hash for cache-busting
    publicPath: '/', // Serve files from root
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Transpile modern JavaScript
        },
      },
      {
        test: /\.s?css$/, // For SASS/SCSS files
        use: [
          MiniCssExtractPlugin.loader, // Extract CSS into separate files
          'css-loader', // Translate CSS into CommonJS
          'postcss-loader', // Apply PostCSS transforms
          'sass-loader', // Compile Sass into CSS
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|eot|ttf|otf)$/i, // Handle images/fonts
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html', // Use this as the template
      inject: 'body', // Automatically inject script tags at the bottom
    }),
    new LodashModuleReplacementPlugin(),
    // new webpack.optimize.AggressiveMergingPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'), // Source: your `public` directory
          to: path.resolve(__dirname, 'dist'), // Destination: Webpack's `dist` directory
          globOptions: {
            ignore: ['**/index.html'], // Optionally ignore if you process index.html separately
          },
        },
      ],
    }),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'), // Ensure React uses production mode
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css', // Cache-busting for CSS files
      ignoreOrder: true,
    }),
    new CleanWebpackPlugin(), // Clean up the /dist folder
  ],



  performance: {
    hints: false, // Disable performance hints for production
  },
};