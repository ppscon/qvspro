// Philip: Webpack config override for Node polyfills (stream, buffer, process)
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for node modules that XLSX depends on
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    path: require.resolve('path-browserify'),
    zlib: require.resolve('browserify-zlib'),
    crypto: require.resolve('crypto-browserify'),
    process: require.resolve('process/browser'),
    fs: false,
  };

  // Handle process/browser extension for ESM modules
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  
  // Add a rule to handle specific imports in ESM modules
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false, // Disable the requirement for extension in imports
    },
  });

  // Add process/browser polyfill
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  return config;
};
