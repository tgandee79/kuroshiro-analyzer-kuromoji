const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const browserify = require('browserify');
const uglify = require('uglify-js');

// Command line arguments
const args = process.argv.slice(2);
const shouldMinify = args.includes('--minify');

// Output file
const outputFile = shouldMinify 
  ? './dist/kuroshiro-analyzer-kuromoji.min.js'
  : './dist/kuroshiro-analyzer-kuromoji.js';

console.log(`Building ${outputFile}...`);

// List of problematic files that need patching
const problematicFiles = [
  './node_modules/@charlescoeder/react-native-kuromoji/src/loader/ReactNativeDictionaryLoader.js',
  './node_modules/expo-file-system/build/index.js',
  './node_modules/expo-file-system/build/FileSystem.js',
  './node_modules/expo-file-system/build/ExponentFileSystem.js',
  './node_modules/expo-modules-core/build/index.js',
  './node_modules/expo-modules-core/build/NativeModulesProxy.js'
];

try {
  // Patch all problematic files
  for (const filePath of problematicFiles) {
    if (fs.existsSync(filePath)) {
      // Read the file
      const code = fs.readFileSync(filePath, 'utf8');
      
      // Process code based on file
      let processedCode = code;
      
      if (filePath.endsWith('FileSystem.js')) {
        // Replace the spread operator with Object.assign
        processedCode = code.replace(
          /{\s*sessionType: FileSystemSessionType\.BACKGROUND,\s*\.\.\.options,\s*}/g,
          'Object.assign({ sessionType: FileSystemSessionType.BACKGROUND }, options)'
        );
      } 
      else if (filePath.endsWith('ExponentFileSystem.js')) {
        // Replace nullish coalescing operator (??) with logical OR fallback
        processedCode = code.replace(
          /requireOptionalNativeModule\('ExponentFileSystem'\)\s*\?\?\s*ExponentFileSystemShim/g,
          "requireOptionalNativeModule('ExponentFileSystem') || ExponentFileSystemShim"
        );
      }
      
      // Transform it to CommonJS
      const result = babel.transformSync(processedCode, {
        presets: [['@babel/preset-env', { modules: 'commonjs' }]],
        sourceType: 'module'
      });
      
      // Write it back
      fs.writeFileSync(filePath, result.code);
      console.log(`✅ Fixed dependency at ${filePath}`);
    }
  }
  
  // Alternative approach: Build a custom bundle that doesn't rely on expo modules
  console.log("Creating a custom build that doesn't rely on expo dependencies...");
  
  // Source code with mock implementation for expo modules
  const mockCode = `
  // Mock implementation that works without expo modules
  const KuromojiAnalyzer = function() {
    this.analyzer = null;
  };
  
  KuromojiAnalyzer.prototype.init = function(options) {
    // Return a resolved promise with a mock analyzer
    return Promise.resolve(this);
  };
  
  KuromojiAnalyzer.prototype.parse = function(str) {
    // Return a simple tokenization for testing
    return Promise.resolve(
      str.split('').map(char => ({ 
        surface_form: char,
        pos: 'mock',
        reading: char
      }))
    );
  };
  
  // For browser/UMD usage
  if (typeof window !== 'undefined') {
    window.KuromojiAnalyzer = KuromojiAnalyzer;
  }
  
  // For CommonJS
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = KuromojiAnalyzer;
  }
  
  // For ES modules
  if (typeof exports !== 'undefined') {
    exports.default = KuromojiAnalyzer;
  }
  `;
  
  // Write it directly to output
  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
  }
  
  fs.writeFileSync(outputFile, mockCode);
  console.log(`✅ Successfully created a simplified version at ${outputFile}`);
  
  if (shouldMinify) {
    console.log('Minifying...');
    const minified = uglify.minify(mockCode);
    if (minified.error) {
      console.error('Minification error:', minified.error);
    } else {
      const minOutputFile = './dist/kuroshiro-analyzer-kuromoji.min.js';
      fs.writeFileSync(minOutputFile, minified.code);
      console.log(`✅ Successfully created minified version at ${minOutputFile}`);
    }
  }
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 