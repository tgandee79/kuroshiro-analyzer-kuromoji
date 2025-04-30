"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _reactNativeKuromoji = require("@charlescoeder/react-native-kuromoji");

var _reactNativeKuromoji2 = _interopRequireDefault(_reactNativeKuromoji);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Kuromoji based morphological analyzer for kuroshiro
 */
var Analyzer = function () {
    /**
     * Constructor
     * @param {Object} [options] JSON object which have key-value pairs settings
     * @param {string} [options.dictPath] Path of the dictionary files
     */
    function Analyzer() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            assets = _ref.assets;

        (0, _classCallCheck3.default)(this, Analyzer);

        this._analyzer = null;

        if (!assets) {
            throw new Error("Dictionary assets must be provided");
        }
        this._assets = assets;
    }

    /**
     * Initialize the analyzer
     * @returns {Promise} Promise object represents the result of initialization
     */


    (0, _createClass3.default)(Analyzer, [{
        key: "init",
        value: function init() {
            var _this = this;

            return new _promise2.default(function (resolve, reject) {
                var self = _this;
                if (_this._analyzer == null) {
                    _reactNativeKuromoji2.default.builder({ assets: _this._assets }).build(function (err, newAnalyzer) {
                        if (err) {
                            return reject(err);
                        }
                        self._analyzer = newAnalyzer;
                        resolve();
                    });
                } else {
                    reject(new Error("This analyzer has already been initialized."));
                }
            });
        }

        /**
         * Parse the given string
         * @param {string} str input string
         * @returns {Promise} Promise object represents the result of parsing
         * @example The result of parsing
         * [{
         *     "surface_form": "黒白",    // 表層形
         *     "pos": "名詞",               // 品詞 (part of speech)
         *     "pos_detail_1": "一般",      // 品詞細分類1
         *     "pos_detail_2": "*",        // 品詞細分類2
         *     "pos_detail_3": "*",        // 品詞細分類3
         *     "conjugated_type": "*",     // 活用型
         *     "conjugated_form": "*",     // 活用形
         *     "basic_form": "黒白",      // 基本形
         *     "reading": "クロシロ",       // 読み
         *     "pronunciation": "クロシロ",  // 発音
         *     "verbose": {                 // Other properties
         *         "word_id": 413560,
         *         "word_type": "KNOWN",
         *         "word_position": 1
         *     }
         * }]
         */

    }, {
        key: "parse",
        value: function parse() {
            var _this2 = this;

            var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

            return new _promise2.default(function (resolve, reject) {
                if (str.trim() === "") return resolve([]);
                var result = _this2._analyzer.tokenize(str);
                for (var i = 0; i < result.length; i++) {
                    result[i].verbose = {};
                    result[i].verbose.word_id = result[i].word_id;
                    result[i].verbose.word_type = result[i].word_type;
                    result[i].verbose.word_position = result[i].word_position;
                    delete result[i].word_id;
                    delete result[i].word_type;
                    delete result[i].word_position;
                }
                resolve(result);
            });
        }
    }]);
    return Analyzer;
}();

exports.default = Analyzer;
module.exports = exports["default"];