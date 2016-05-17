'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * An extends mongoose schema with
 * - build from a config file (descriptor)
 * - comes with common (opiniated) configurable options:
 *   - createdAt
 *   - updatedAt
 *   - autoIncrement
 *   - hidden properties in json/object/everywhere
 *   - paginate results
 * - an error cleaner `model.cleanError()` for unique values (that will throw a standard mongoose error)
 */

var mongoose = require('mongoose');
var MongooseSchema = mongoose.Schema;
var MongooseError = require('mongoose/lib/error');
var paginatePlugin = require('mongoose-paginate');
var hiddenPlugin = require('mongoose-hidden')();
var autoIncrementPlugin = require('mongoose-auto-increment');
var createdAtPlugin = require('mongoose-plugin-createdat');
var updatedAtPlugin = require('mongoose-plugin-updatedat');

module.exports = function (_MongooseSchema) {
  (0, _inherits3.default)(Schema, _MongooseSchema);

  function Schema() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var name = _ref.name;
    var descriptor = _ref.descriptor;
    var connection = _ref.connection;
    (0, _classCallCheck3.default)(this, Schema);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Schema).call(this, descriptor, {
      toObject: { virtuals: true },
      toJSON: { virtuals: true }
    }));

    _this._descriptor = descriptor;
    _this._connection = connection;
    _this._options = {
      name: name,
      createdAt: true,
      updatedAt: true,
      autoIncrement: 'id',
      paginate: true
    };
    return _this;
  }

  (0, _createClass3.default)(Schema, [{
    key: 'getDescriptor',
    value: function getDescriptor() {
      return this._descriptor;
    }
  }, {
    key: 'getProperties',
    value: function getProperties() {
      var res = this.getDescriptor();
      var autoIncrementId = this.getOption('autoIncrement');

      if (autoIncrementId !== false) {
        res[autoIncrementId] = {
          type: Number,
          required: true,
          unique: true,
          index: true,
          querable: true
        };
      }

      if (this.getOption('createdAt')) {
        res.created_at = {
          type: Date,
          required: true,
          unique: false,
          querable: true
        };
      }

      if (this.getOption('updatedAt')) {
        res.updated_at = {
          type: Date,
          required: true,
          unique: false,
          querable: true
        };
      }

      return res;
    }
  }, {
    key: 'getConnection',
    value: function getConnection() {
      return this._connection;
    }
  }, {
    key: 'getOption',
    value: function getOption(name) {
      if (!this._options.hasOwnProperty(name)) {
        throw new Error('Unknown option ' + name);
      }
      return this._options[name];
    }
  }, {
    key: '_enablePlugins',
    value: function _enablePlugins() {
      if (this.getOption('autoIncrement') != false) {
        autoIncrementPlugin.initialize(this.getConnection());
        this.plugin(autoIncrementPlugin.plugin, {
          model: this.getOption('name'),
          field: this.getOption('autoIncrement'),
          startAt: 1,
          incrementBy: 1
        });
      }

      if (this.getOption('createdAt')) this.plugin(createdAtPlugin);
      if (this.getOption('updatedAt')) this.plugin(updatedAtPlugin);

      if (this.getOption('paginate')) this.plugin(paginatePlugin);

      this.plugin(hiddenPlugin);
    }
  }, {
    key: 'getModel',
    value: function getModel() {
      var _this2 = this;

      this._enablePlugins();

      this.virtual('__ressource__').get(function () {
        return _this2.getOption('name').toLowerCase();
      });

      var model = this._connection.model(this.getOption('name'), this);

      // Fucking code to clean mongoose unique error ... :( So ugly, sorry
      model.cleanError = function (err) {
        return new _promise2.default(function (resolve, reject) {
          var ValidationErrorCode = 481;

          // Not a mongoose error ? skip
          switch (err.name) {
            case 'MongoError':
              {
                if (err.code === 11000 || err.code === 11001) {
                  var _ret = function () {
                    // Unique key
                    var matches = /index:\s*(?:.+?\.\$)?(\S*)\s*dup key:\s*\{(.*?)\}/.exec(err.message);
                    if (matches.length < 2) {
                      return {
                        v: resolve(err)
                      };
                    }
                    var indexName = matches[1];
                    var rawValues = matches[2].trim();
                    var value = /^\s*:\s*(\S*).*,?$/g.exec(rawValues)[1];

                    var uniqueError = new MongooseError.ValidationError(model);
                    uniqueError.code = ValidationErrorCode;
                    model.collection.indexInformation(function (dbErr, indexes) {
                      if (dbErr || !indexes.hasOwnProperty(indexName)) {
                        return reject(err);
                      }
                      var index = indexes[indexName];
                      index.forEach(function (item) {
                        var path = item[0];
                        var message = _this2.getDescriptor().hasOwnProperty(path) && _this2.getDescriptor()[path].hasOwnProperty('unique') && _this2.getDescriptor()[path].unique.constructor === Array ? _this2.getDescriptor()[path].unique[1] : '';
                        uniqueError.errors[path] = new MongooseError.ValidatorError({ type: 'duplicated', path: path, value: value, message: message });
                      });
                      return resolve(uniqueError);
                    });
                  }();

                  if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
                }
                break;
              }
            case 'ValidationError':
              err.code = ValidationErrorCode;
              return resolve(err);
            default:
              return resolve(err);
          }
        });
      };

      model.getDefault = function (property) {
        if (!_this2.getDescriptor().hasOwnProperty(property)) {
          throw new Error('Unknwon property "' + property);
        }
        if (!_this2.getDescriptor()[property].hasOwnProperty('default')) {
          throw new Error('No default property for "' + property);
        }

        return _this2.getDescriptor()[property].default;
      };

      model.getProperties = function () {
        return _this2.getProperties();
      };
      model.getPropertiesNames = function () {
        var onlyBasics = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
        return (0, _keys2.default)(onlyBasics ? _this2.getDescriptor() : _this2.getProperties());
      };

      return model;
    }
  }]);
  return Schema;
}(MongooseSchema);