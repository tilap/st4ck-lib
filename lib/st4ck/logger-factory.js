'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * A logger factory for Winston based on 3 config level:
 * - logger
 * - transporter
 * - custome call
 *
 * @example
 * ```
 * const myLoggerFactory = new LoggerFactory();
 *
 * // Add a transporter for file
 * myLoggerFactory.config.addTransporter('myFileTransporter', {
 *   transport: 'file',
 *   options: {
 *     filename: `path/to/logs/default.log` ,
 *     level: 'warn',
 *   },
 * });
 *
 * // Add another file transporter
 * myLoggerFactory.config.addTransporter('myOtherFileTransporter', {
 *   transport: 'file',
 *   options: {
 *     filename: `another/path/for/logs/other.log` ,
 *     level: 'warn',
 *   },
 * });
 *
 * // A console transporter
 * myLoggerFactory.config.addTransporter('myConsoleTransporter', {
 *   transport: 'console',
 * });
 *
 * // You can add more transporter with existing winston-transport packages
 * // ...
 *
 * // Register a full logger name 'database' with different transports
 * myLoggerFactory.config.addLogger('database', [
 *   {
 *     transporter: 'myFileTransporter', // A previous inserted transporter id
 *     options: { filename: `/path/to/log/directory/logfile.log` },
 *   },
 *   {
 *     transporter: 'myConsoleTransporter'
 *   },
 *   {
 *     transporter: 'myOtherFileTransporter',
 *     options: {
 *       level: 'error',
 *     }
 *   }
 * ]);
 *
 * // In code, call a logger
 * const myDatabaseLogger = myLoggerFactory.get('database');
 * myDatabaseLogger.info('here a fabulous message')
 * ```
 *
 */

var winston = require('winston');
var cliColor = require('cli-color');
var LoggerFactoryConfig = require('./logger-factory/config');

module.exports = function () {
  function LoggerFactory() {
    (0, _classCallCheck3.default)(this, LoggerFactory);

    this.config = new LoggerFactoryConfig();
    this.setErrorClass(Error);
  }

  (0, _createClass3.default)(LoggerFactory, [{
    key: 'setErrorClass',
    value: function setErrorClass(ErrorClass) {
      this.ErrorClass = ErrorClass;
      this.config.setErrorClass(ErrorClass);
    }
  }, {
    key: 'getTranspoterClass',
    value: function getTranspoterClass(id) {
      var type = this.config.getTransporterType(id);
      switch (type) {
        case 'console':
          return winston.transports.Console;
        case 'file':
          return winston.transports.File;
        default:
          if (type.constructor === String) {
            try {
              return require(type);
            } catch (err) {
              throw new this.ErrorClass('Unable to load npm module ' + type);
            }
          }
          return type;
      }
    }

    // Final override of transporter settings

  }, {
    key: 'customizeOptions',
    value: function customizeOptions(id, options) {
      var type = this.config.getTransporterType(id);

      switch (type) {
        case 'console':
          {
            var _ret = function () {
              var settings = {
                silly: { icon: '→', color: 'magenta' },
                verbose: { icon: '→', color: 'blackBright' },
                debug: { icon: '→', color: 'green' },
                info: { icon: '✔', color: 'cyan' },
                warn: { icon: '!', color: 'yellow' },
                error: { icon: '✖', color: 'red' }
              };

              if (!options.hasOwnProperty('timestamp')) {
                options.timestamp = function () {
                  return Date.now();
                };
              }

              if (!options.hasOwnProperty('formatter')) {
                options.formatter = function (opts) {
                  var color = settings.hasOwnProperty(opts.level) ? settings[opts.level].color : 'green';
                  var icon = settings.hasOwnProperty(opts.level) ? settings[opts.level].icon : '→';

                  var res = [];
                  if (options.message_prefix) {
                    res.push('[' + options.message_prefix + ']');
                  }
                  res.push(icon);
                  res.push(undefined !== opts.message ? opts.message : '');
                  res.push(opts.meta && (0, _keys2.default)(opts.meta).length ? '\n\t' + (0, _stringify2.default)(opts.meta) : '');
                  return cliColor[color](res.join(' '));
                };
              }
              return 'break';
            }();

            if (_ret === 'break') break;
          }
        case 'file':
          if (!options.hasOwnProperty('formatter') && !options.hasOwnProperty('json')) {
            options.json = false;
            options.formatter = function (opts) {
              return new Date() + ' [' + (options.message_prefix || '-') + '] ' + opts.level + ' --- ' + opts.message;
            };
          }
          break;
        default:
      }

      return options;
    }
  }, {
    key: 'get',
    value: function get(id) {
      var _this = this;

      var optionsOverride = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var loggerOptions = this.config.getLogger(id);

      var transports = [];
      loggerOptions.forEach(function () {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$transporter = _ref.transporter;
        var transporter = _ref$transporter === undefined ? '' : _ref$transporter;
        var _ref$options = _ref.options;
        var options = _ref$options === undefined ? {} : _ref$options;

        var TransportClass = _this.getTranspoterClass(transporter);

        var optionFromTransporterConfig = _this.config.getTransporterOptions(transporter);
        var returnOptions = (0, _assign2.default)({}, optionFromTransporterConfig, options);
        returnOptions = _this.customizeOptions(transporter, returnOptions);
        returnOptions = (0, _assign2.default)(returnOptions, optionsOverride);

        transports.push(new TransportClass(returnOptions));
      });

      return new winston.Logger({ transports: transports });
    }
  }]);
  return LoggerFactory;
}();