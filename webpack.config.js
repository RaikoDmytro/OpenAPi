const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const merge = require('lodash/merge');
const webpack = require('webpack');
const dotenv = require('dotenv');

const isDevelopment = process.env.NODE_ENV !== 'production';

const envFile = isDevelopment ? '.env.dev' : '.env.prod';
const envVars = merge(
    dotenv.config({ path: '.env' }).parsed || {},
    dotenv.config({ path: path.resolve(__dirname, envFile) }).parsed || {}
);

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map', // Optional: Use source maps for easier debugging
  entry: {
    front: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      'webpack-hot-middleware/client?path=https://localhost:3000/__webpack_hmr',
      path.resolve(__dirname, 'src/index.js'), // Corrected entry path
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // Physical folder for built files
    filename: 'bundle.js', // Output bundle file
    publicPath: '/', // Webpack Dev Middleware serves bundles "in-memory" at this path
  },
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
    new webpack.HotModuleReplacementPlugin(),
    isDevelopment && new ReactRefreshWebpackPlugin(),
    new webpack.DefinePlugin({
      __DEVTOOLS__: true,
      XDEBUG: true,
      VERSION: null,
      ...Object.keys(envVars).reduce((envs, envName) => {
        envs[envName] = JSON.stringify(envVars[envName]);
        return envs;
      }, {}),
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './frontend/web/src'),
      fonts: path.resolve(__dirname, './frontend/web/fonts'),
      img: path.resolve(__dirname, './frontend/web/img'),
    },
    extensions: ['.js', '.jsx'], // Added .jsx support
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'frontend/web/src'),
          path.resolve(__dirname, 'src'),
        ], // Include 'src' folder
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'], // Added presets
              plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: ['autoprefixer'],
              },
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(woff2?|eot|otf|ttf|svg|png|jpe?g)/,
        type: 'asset/resource',
      },
      {
        test: /\.anim\.json/,
        loader: 'file-loader',
        type: 'javascript/auto',
      },
      {
        test: /swagger\.json$/,
        type: 'asset/resource',
      },
    ],
  },
  devServer: {
    hot: true,
    port: 3000, // or the port you are using
    static: path.resolve(__dirname, 'dist'), // Explicitly serve the 'public' folder
    publicPath: '/', // Ensure it's mapped to root '/'
    historyApiFallback: true, // For single-page apps
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 500,
    poll: true,
  },
};