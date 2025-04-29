const babelify = require("babelify");

module.exports = function (filename) {
    // Handle all files including node_modules
    const options = {
        sourceType: "module",
        presets: [["env", { modules: "commonjs" }]],  // Use commonjs modules for everything
        plugins: ["transform-runtime", "add-module-exports"],
        global: true,
        only: [
            // Your source files
            "./src/**/*.js",
            // The problematic dependency
            "**/node_modules/@charlescoeder/react-native-kuromoji/**/*.js"
        ]
    };

    return babelify.configure(options)(filename);
}; 