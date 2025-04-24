// Philip: Webpack config override for Node polyfills (stream, buffer, process)
const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    util: require.resolve('util/'),
    zlib: require.resolve('browserify-zlib'),
    assert: require.resolve('assert/'),
  };
  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];
  return config;
};
