
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
  