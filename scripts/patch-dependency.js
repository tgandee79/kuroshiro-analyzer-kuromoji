const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

// Path to the problematic file
const filePath = './node_modules/@charlescoeder/react-native-kuromoji/src/loader/ReactNativeDictionaryLoader.js';

// Read the file
const code = fs.readFileSync(filePath, 'utf8');

// Transform it
const result = babel.transformSync(code, {
  presets: [['@babel/preset-env', { modules: 'commonjs' }]],
  sourceType: 'module'
});

// Write it back
fs.writeFileSync(filePath, result.code);

console.log('Dependency patched successfully'); 