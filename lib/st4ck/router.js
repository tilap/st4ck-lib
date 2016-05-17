'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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
 * Extends Koa router to build them from a config file
 *
 * @usage
 * const router = new Router({ controllerPath: '/controllers/' });
 *
 * @todo: complete documentation
 */
var KoaRouter = require('koa-router');
var fs = require('fs');

module.exports = function (_KoaRouter) {
  (0, _inherits3.default)(Router, _KoaRouter);

  function Router(options) {
    (0, _classCallCheck3.default)(this, Router);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Router).call(this, options));

    if (!options.hasOwnProperty('controllerPath')) {
      throw new Error('Missing controller path');
    }

    _this.controllerPath = options.controllerPath;
    _this.logger = options.logger || console;

    var _options$controllerBe = options.controllerBefore;
    var controllerBefore = _options$controllerBe === undefined ? [] : _options$controllerBe;
    var _options$controllerAf = options.controllerAfter;
    var controllerAfter = _options$controllerAf === undefined ? [] : _options$controllerAf;

    _this.controllerBefore = controllerBefore;
    _this.controllerAfter = controllerAfter;
    _this.routesConfig = {};
    return _this;
  }

  (0, _createClass3.default)(Router, [{
    key: 'addBeforeRunningController',
    value: function addBeforeRunningController(func) {
      this.controllerBefore.push(func);
      return this;
    }
  }, {
    key: 'addAfterRunningController',
    value: function addAfterRunningController(func) {
      this.controllerAfter.push(func);
      return this;
    }
  }, {
    key: 'addRoutesFromConfigFolders',
    value: function addRoutesFromConfigFolders(folders) {
      if (folders.constructor === String) {
        folders = [folders];
      }

      var routesConfig = {};
      folders.forEach(function (src) {
        try {
          fs.accessSync(src, fs.F_OK);
        } catch (e) {
          throw new Error('Path "' + src + '" not found');
        }
        fs.readdirSync(src).forEach(function (file) {
          var fullPath = src + '/' + file;
          if (fs.statSync(fullPath).isFile()) {
            var newObject = require(fullPath);
            routesConfig = (0, _assign2.default)(routesConfig, newObject);
          }
        });
      });

      this.addRoutesFromConfigs(routesConfig);
      return this;
    }
  }, {
    key: 'addRoutesFromConfigs',
    value: function addRoutesFromConfigs(routesConfig) {
      return (0, _assign2.default)(this.routesConfig, routesConfig);
    }
  }, {
    key: 'addDocumentation',
    value: function addDocumentation() {
      var _this2 = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$id = _ref.id;
      var id = _ref$id === undefined ? 'documentation.methods' : _ref$id;
      var _ref$path = _ref.path;
      var path = _ref$path === undefined ? '/documentation/methods' : _ref$path;
      var _ref$method = _ref.method;
      var method = _ref$method === undefined ? 'get' : _ref$method;
      var _ref$description = _ref.description;
      var description = _ref$description === undefined ? 'Provide full api documentation' : _ref$description;
      var _ref$returns = _ref.returns;
      var returns = _ref$returns === undefined ? 'List of available mathods' : _ref$returns;

      this.routesConfig[id] = {
        method: method,
        description: description,
        returns: returns,
        path: path,
        dispatch: function () {
          var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
            return _regenerator2.default.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    (0, _keys2.default)(_this2.routesConfig).forEach(function (name) {
                      var _routesConfig$name = _this2.routesConfig[name];
                      var _routesConfig$name$me = _routesConfig$name.method;
                      var method = _routesConfig$name$me === undefined ? 'get' : _routesConfig$name$me;
                      var _routesConfig$name$pa = _routesConfig$name.path;
                      var path = _routesConfig$name$pa === undefined ? '' : _routesConfig$name$pa;
                      var _routesConfig$name$da = _routesConfig$name.dataset;
                      var dataset = _routesConfig$name$da === undefined ? [] : _routesConfig$name$da;
                      var _routesConfig$name$de = _routesConfig$name.description;
                      var description = _routesConfig$name$de === undefined ? '' : _routesConfig$name$de;
                      var _routesConfig$name$ar = _routesConfig$name.args;
                      var args = _routesConfig$name$ar === undefined ? {} : _routesConfig$name$ar;

                      ctx.apiResponse.addData({ name: name, description: description, method: method, path: path, args: args, dataset: dataset });
                    });

                  case 1:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this2);
          }));
          return function dispatch(_x2, _x3) {
            return ref.apply(this, arguments);
          };
        }()
      };
      return this;
    }
  }, {
    key: 'init',
    value: function init() {
      var _this3 = this;

      var router = this;
      (0, _keys2.default)(this.routesConfig).forEach(function (name) {
        var routeCgf = _this3.routesConfig[name];
        var _routeCgf$method = routeCgf.method;
        var method = _routeCgf$method === undefined ? 'get' : _routeCgf$method;
        var _routeCgf$path = routeCgf.path;
        var path = _routeCgf$path === undefined ? '' : _routeCgf$path;
        var _routeCgf$dispatch = routeCgf.dispatch;
        var dispatch = _routeCgf$dispatch === undefined ? null : _routeCgf$dispatch;

        router.logger.verbose('Mount route ' + name + ' - [' + method + '] ' + path);

        switch (dispatch.constructor) {
          case Function:
            router[method](name, path, function () {
              var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        router.controllerBefore.forEach(function (func) {
                          return func({ ctx: ctx, router: routeCgf, name: name });
                        });
                        _context2.next = 3;
                        return dispatch(ctx, next);

                      case 3:
                        router.controllerAfter.forEach(function (func) {
                          return func({ ctx: ctx, router: routeCgf, name: name });
                        });

                      case 4:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this3);
              }));
              return function (_x4, _x5) {
                return ref.apply(this, arguments);
              };
            }());
            break;

          case Object:
            if (!dispatch.hasOwnProperty('controller') || !dispatch.hasOwnProperty('method')) {
              router.logger.error('Unable to mount router, the dispatch Object has not the controller/method properties');
              throw new Error('Bad dispatch for route ' + name);
            }
            router[method](name, path, function () {
              var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(ctx, next) {
                var Controller, controller;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        router.controllerBefore.forEach(function (func) {
                          return func({ ctx: ctx, router: routeCgf, name: name });
                        });
                        Controller = require(router.controllerPath + '/' + dispatch.controller);
                        controller = new Controller();
                        _context3.next = 5;
                        return controller[dispatch.method](ctx, next);

                      case 5:
                        router.controllerAfter.forEach(function (func) {
                          return func({ ctx: ctx, router: routeCgf, name: name });
                        });

                      case 6:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, _this3);
              }));
              return function (_x6, _x7) {
                return ref.apply(this, arguments);
              };
            }());
            break;

          default:
            router.logger.error('Unable to mount router, the given dispatch is neither Function nor Object');
            throw new Error('Bad dispatch for route ' + name);
        }
      });
      return this;
    }
  }]);
  return Router;
}(KoaRouter);