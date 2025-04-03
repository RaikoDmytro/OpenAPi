const path = require('path')

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const merge = require('lodash/merge')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

const envVars = merge(
  require('dotenv').config({ path: '.env' }).parsed || {},
  require('dotenv').config({ path: path.resolve(__dirname, '.env.prod') }).parsed || {},
)

module.exports = (env) => {
  const assetsVersionId = env.ASSETS_VERSION_ID || '12345'

  return {
    mode: 'production',
    entry: {
      back: ['core-js/stable', 'regenerator-runtime/runtime', './frontend/web/src/index'],
      front: ['core-js/stable', 'regenerator-runtime/runtime', './frontend/web/src/front/index'],
    },
    optimization: {
      minimize: true,
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'common',
            chunks: 'initial',
            minChunks: 2,
          },
        },
      },
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
    },
    output: {
      path: path.join(__dirname, './frontend/web/dest'),
      publicPath: '/dest/',
      filename: `bundle.js?${assetsVersionId}`,
    },
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
      new LodashModuleReplacementPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
        XDEBUG: false,
        VERSION: null,
        ...Object.keys(envVars).reduce((envs, envName) => {
          // eslint-disable-next-line no-param-reassign
          envs[envName] = JSON.stringify(envVars[envName])
          return envs
        }, {}),
      }),
      new MiniCssExtractPlugin({
        filename: `[name].css?${assetsVersionId}`,
        ignoreOrder: true,
      }),
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './frontend/web/src'),
        fonts: path.resolve(__dirname, './frontend/web/fonts'),
        img: path.resolve(__dirname, './frontend/web/img'),
      },
      extensions: ['.js'],
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: [{ loader: 'babel-loader' }],
          include: [path.resolve(__dirname, 'frontend/web/src')],
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            // 'style-loader',
            'css-loader',
          ],
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
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
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
        {
          test: /\.(woff2?|eot|otf|ttf|svg|png|jpe?g)/,
          type: 'asset/resource',
        },
        {
          test: /\.anim\.json$/,
          loader: 'file-loader',
          type: 'javascript/auto',
        },
        {
          test: /swagger\.json$/,
          type: 'asset/resource',
        },
      ],
    },
  }
}
