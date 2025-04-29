const babelify = require('babelify');

module.exports = function(filename) {
  // Apply to all files, including those in node_modules
  return babelify.configure({
    sourceType: 'module',
    presets: [['env', { modules: false }]],
    plugins: ['transform-runtime', 'add-module-exports'],
    global: true,
    ignore: /\/node_modules\/(?!@charlescoeder\/react-native-kuromoji)/
  })(filename);
}; 