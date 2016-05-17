'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = require('assert');

module.exports = function () {
  function KoaCtxHelpers(ctx) {
    (0, _classCallCheck3.default)(this, KoaCtxHelpers);

    this.ctx = ctx;
  }

  (0, _createClass3.default)(KoaCtxHelpers, [{
    key: 'assertBodyRequest',
    value: function assertBodyRequest() {
      assert(this.ctx.request && this.ctx.request.hasOwnProperty('body'), 'Not a valid post request');
    }
  }, {
    key: 'getRequestBodies',
    value: function getRequestBodies() {
      this.assertBodyRequest();
      return this.ctx.request.body;
    }
  }, {
    key: 'getRequestBody',
    value: function getRequestBody(id) {
      var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      this.assertBodyRequest();
      return this.ctx.request.body.hasOwnProperty(id) ? this.ctx.request.body[id] : defaultValue;
    }
  }, {
    key: 'getExistingRequestBodies',
    value: function getExistingRequestBodies(items) {
      var _this = this;

      assert(items.constructor === Array, 'getExistingRequestBodies requires an Array as param');
      var output = {};
      try {
        this.assertBodyRequest();
      } catch (err) {
        return output;
      }
      items.filter(function (key) {
        return _this.ctx.request.body.hasOwnProperty(key);
      }).forEach(function (k) {
        return output[k] = _this.ctx.request.body[k];
      });
      return output;
    }
  }, {
    key: 'getDefaultRequestBodies',
    value: function getDefaultRequestBodies(items) {
      var _this2 = this;

      this.assertBodyRequest();
      assert(items.constructor === Object, 'getDefaultRequestBodies requires an Object as param');
      var output = {};
      (0, _keys2.default)(items).forEach(function (key) {
        output[key] = _this2.getRequestBody(key, items[key]);
      });
      return output;
    }
  }, {
    key: 'getQueries',
    value: function getQueries() {
      return this.ctx.query || [];
    }
  }, {
    key: 'getQuery',
    value: function getQuery(id, defaultValue) {
      return this.ctx.query.hasOwnProperty(id) ? this.ctx.query[id] : defaultValue;
    }
  }, {
    key: 'getQueriesIfExists',
    value: function getQueriesIfExists(items) {
      var _this3 = this;

      assert(items.constructor === Array, new Error('getQueryIfExists requires an Array as param'));
      var output = {};
      items.filter(function (key) {
        return _this3.ctx.query.hasOwnProperty(key);
      }).forEach(function (k) {
        return output[k] = _this3.ctx.query[k];
      });
      return output;
    }
  }, {
    key: 'getParams',
    value: function getParams() {
      return this.ctx.params;
    }
  }, {
    key: 'getParam',
    value: function getParam(id) {
      var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      return this.ctx.params.hasOwnProperty(id) ? this.ctx.params[id] : defaultValue;
    }
  }]);
  return KoaCtxHelpers;
}();