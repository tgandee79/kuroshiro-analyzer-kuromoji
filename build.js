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

// First, fix the dependency file by converting ES modules to CommonJS
const problematicFile = './node_modules/@charlescoeder/react-native-kuromoji/src/loader/ReactNativeDictionaryLoader.js';

try {
  // Read the file
  const code = fs.readFileSync(problematicFile, 'utf8');
  
  // Transform it to CommonJS
  const result = babel.transformSync(code, {
    presets: [['@babel/preset-env', { modules: 'commonjs' }]],
    sourceType: 'module'
  });
  
  // Write it back
  fs.writeFileSync(problematicFile, result.code);
  console.log(`✅ Fixed dependency at ${problematicFile}`);
  
  // Now create the browserify bundle
  const b = browserify('./src/index.js', { 
    standalone: 'KuromojiAnalyzer',
    // Ensure modules are properly transformed
    transform: [
      ['babelify', { 
        presets: [['env', { modules: false }]],
        plugins: ['transform-runtime', 'add-module-exports'],
        global: true
      }]
    ]
  });
  
  // Create the bundle
  b.bundle((err, buf) => {
    if (err) {
      console.error('Browserify bundling error:', err);
      process.exit(1);
    }
    
    let output = buf.toString();
    
    // Minify if requested
    if (shouldMinify) {
      console.log('Minifying...');
      const minified = uglify.minify(output);
      if (minified.error) {
        console.error('Minification error:', minified.error);
        process.exit(1);
      }
      output = minified.code;
    }
    
    // Make sure the dist directory exists
    if (!fs.existsSync('./dist')) {
      fs.mkdirSync('./dist');
    }
    
    // Write the output
    fs.writeFileSync(outputFile, output);
    console.log(`✅ Successfully built ${outputFile}`);
  });
  
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 