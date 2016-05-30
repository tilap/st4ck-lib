'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ApiResponse = require('st4ck-lib-apiresponse');
var renderer = require('./renderer');

module.exports = function (_ref) {
  var _this = this;

  var _ref$contextKey = _ref.contextKey;
  var contextKey = _ref$contextKey === undefined ? 'apiResponse' : _ref$contextKey;
  var _ref$showStackTraceOn = _ref.showStackTraceOnError;
  var showStackTraceOnError = _ref$showStackTraceOn === undefined ? false : _ref$showStackTraceOn;
  var _ref$logger = _ref.logger;
  var logger = _ref$logger === undefined ? console : _ref$logger;

  return function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
      var apiResponse, start, format;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              apiResponse = new ApiResponse();

              apiResponse.addErrorDetailSanitize(function (err) {
                if (err.properties) {
                  if (err.properties.kind && err.properties.kind != '') {
                    err.kind = err.properties.kind;
                  } else if (err.properties.type && err.properties.type != '') {
                    err.kind = err.properties.type;
                  } else if (!err.hasOwnProperty('kind')) {
                    err.kind = 'unknown';
                  }
                  delete err.properties;
                }
                return err;
              });
              apiResponse.showStackTraceOnError = showStackTraceOnError;
              ctx[contextKey] = apiResponse;

              start = new Date();
              _context.prev = 5;
              _context.next = 8;
              return next();

            case 8:
              _context.next = 17;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context['catch'](5);

              if (!_context.t0.code || _context.t0.code > 499) {
                logger.error(_context.t0.message || _context.t0, _context.t0.stack);
              } else {
                logger.log(_context.t0.message || _context.t0, _context.t0.stack);
              }

              ctx[contextKey].resetData();
              ctx[contextKey].setError(_context.t0);
              if (_context.t0.details) {
                ctx[contextKey].addErrorDetails(_context.t0.details);
              } else if (_context.t0.errors) {
                ctx[contextKey].addErrorDetails(_context.t0.errors);
              }
              ctx.response.status = ctx[contextKey].error.code === 500 ? 500 : 200;

            case 17:
              _context.prev = 17;

              // Add common metas
              ctx[contextKey].setMeta('dispatch_start', start);
              ctx[contextKey].setMeta('dispatch_end', new Date());
              ctx[contextKey].setMeta('dispatch_duration', new Date() - start);

              // Output format in a nice way
              format = ctx.accepts('json', 'html');

              ctx.body = renderer(ctx[contextKey], format, showStackTraceOnError);
              return _context.finish(17);

            case 24:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[5, 10, 17, 24]]);
    }));
    return function (_x, _x2) {
      return ref.apply(this, arguments);
    };
  }();
};