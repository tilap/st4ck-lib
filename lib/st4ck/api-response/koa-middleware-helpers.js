'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  var _this = this;

  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$contextKey = _ref.contextKey;
  var contextKey = _ref$contextKey === undefined ? 'apiResponse' : _ref$contextKey;

  return function () {
    var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              ctx.setFromPaginateResult = function () {
                var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

                var _ref2$total = _ref2.total;
                var total = _ref2$total === undefined ? null : _ref2$total;
                var _ref2$limit = _ref2.limit;
                var limit = _ref2$limit === undefined ? null : _ref2$limit;
                var _ref2$page = _ref2.page;
                var page = _ref2$page === undefined ? null : _ref2$page;
                var _ref2$pages = _ref2.pages;
                var pages = _ref2$pages === undefined ? null : _ref2$pages;
                var _ref2$docs = _ref2.docs;
                var docs = _ref2$docs === undefined ? null : _ref2$docs;

                if (total || limit || page || pages || docs) {
                  var pagination = {};
                  if (total !== null) pagination.total = total;
                  if (limit !== null) pagination.limit = limit;
                  if (page !== null) pagination.page = page;
                  if (pages !== null) pagination.pages = pages;
                  if (docs !== null) ctx.apiResponse.addData(docs);
                  ctx[contextKey].setSuccessProperty('paging', pagination);
                }
              };
              _context.next = 3;
              return next();

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));
    return function (_x2, _x3) {
      return ref.apply(this, arguments);
    };
  }();
};