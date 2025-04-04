/* eslint-disable */
const https = require('https');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Read SSL certificates
const key = fs.readFileSync(__dirname + '/dev.key');
const cert = fs.readFileSync(__dirname + '/dev.crt');
const options = {
  key: key,
  cert: cert,
};

// Middleware
app.use(cors());
app.use(require('morgan')('short'));

// Initialize Webpack for Development
(function initWebpack() {
  const webpack = require('webpack');
  const webpackConfig = require('./webpack.config');
  const compiler = webpack(webpackConfig, (...p) => {});

  app.use(
      require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath, // Serve bundles from memory
      }),
  );

  app.use(
      require('webpack-hot-middleware')(compiler, {
        log: console.log, // Hot Module Replacement logs
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000,
      }),
  );
})();

// Serve static assets from 'public' folder
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback - Serve 'index.html' for all other routes
app.use('*', (req, res, next) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  fs.access(indexPath, fs.constants.R_OK, (err) => {
    if (err) {
      res.status(404).send('File not found');
    } else {
      res.sendFile(indexPath);
    }
  });
});

// Start HTTPS server
if (require.main === module) {
  const server = https.createServer(options, app);
  server.listen(process.env.PORT || 13427, function onListen() {
    const address = server.address();
    console.log('Listening on: %j', address);
    console.log(' -> that probably means: https://localhost:%d', address.port);
  });
}