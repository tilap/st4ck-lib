'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
  function LoggerFactoryConfig() {
    (0, _classCallCheck3.default)(this, LoggerFactoryConfig);

    this.loggers = {};
    this.transporters = {};
    this.ErrorClass = Error;
  }

  // Error


  (0, _createClass3.default)(LoggerFactoryConfig, [{
    key: 'setErrorClass',
    value: function setErrorClass(ErrorClass) {
      this.ErrorClass = ErrorClass;
    }

    // Loggers

  }, {
    key: 'addLogger',
    value: function addLogger(id) {
      var _this = this;

      var transporters = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      if (id.constructor !== String) {
        throw new this.ErrorClass('Logger id must be a string');
      }

      if (transporters.constructor !== Array) {
        throw new this.ErrorClass('transporters must be an array');
      }

      transporters.forEach(function () {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var _ref$transporter = _ref.transporter;
        var transporter = _ref$transporter === undefined ? '' : _ref$transporter;
        var _ref$options = _ref.options;
        var options = _ref$options === undefined ? {} : _ref$options;

        _this.addTransporterToLogger(id, transporter, options);
      });
    }
  }, {
    key: 'setLoggers',
    value: function setLoggers(config) {
      var _this2 = this;

      if (!config.constructor === Object) {
        throw new this.ErrorClass('Logger config is not an object');
      }
      (0, _keys2.default)(config).forEach(function (id) {
        return _this2.addLogger(id, config[id]);
      });
    }
  }, {
    key: 'getLogger',
    value: function getLogger(id) {
      if (!this.loggers.hasOwnProperty(id)) {
        throw new this.ErrorClass('Unknown logger id "' + id + '"');
      }
      return this.loggers[id];
    }

    // Logger transporters

  }, {
    key: 'addTransporterToLogger',
    value: function addTransporterToLogger(id, transporter, options) {
      if (!this.loggers.hasOwnProperty(id)) {
        this.loggers[id] = [];
      }
      this.loggers[id].push({ transporter: transporter, options: options });
    }

    // Transporters

  }, {
    key: 'addTransporter',
    value: function addTransporter(id, _ref2) {
      var _ref2$transport = _ref2.transport;
      var transport = _ref2$transport === undefined ? '' : _ref2$transport;
      var _ref2$options = _ref2.options;
      var options = _ref2$options === undefined ? {} : _ref2$options;

      if (id.constructor !== String) {
        throw new this.ErrorClass('Transporter id must be a string');
      }

      if (!transport) {
        throw new this.ErrorClass('"transport" property is required in transporter config');
      }

      this.transporters[id] = { transport: transport, options: options };
    }
  }, {
    key: 'setTransporters',
    value: function setTransporters(config) {
      var _this3 = this;

      if (!config.constructor === Object) {
        throw new this.ErrorClass('Transporter config is not an object');
      }

      (0, _keys2.default)(config).forEach(function (id) {
        return _this3.addTransporter(id, config[id]);
      });
    }
  }, {
    key: 'getTransporter',
    value: function getTransporter(id) {
      if (!this.transporters.hasOwnProperty(id)) {
        throw new this.ErrorClass('Unknown transporter id "' + id + '"');
      }
      return this.transporters[id];
    }
  }, {
    key: 'getTransporterOptions',
    value: function getTransporterOptions(id) {
      var transportConfig = this.getTransporter(id);
      return transportConfig.hasOwnProperty('options') ? transportConfig.options : {};
    }
  }, {
    key: 'getTransporterType',
    value: function getTransporterType(id) {
      var transportConfig = this.getTransporter(id);
      if (!transportConfig.hasOwnProperty('transport')) {
        throw new this.ErrorClass('transporter "' + id + '" has no transport');
      }
      return transportConfig.transport;
    }
  }]);
  return LoggerFactoryConfig;
}();