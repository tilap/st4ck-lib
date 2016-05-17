/*
 * Extends Koa router to build them from a config file
 *
 * @usage
 * const router = new Router({ controllerPath: '/controllers/' });
 *
 * @todo: complete documentation
 */
const KoaRouter = require('koa-router');
const fs = require('fs');

module.exports = class Router extends KoaRouter {
  constructor(options) {
    super(options);
    if (!options.hasOwnProperty('controllerPath')) {
      throw new Error('Missing controller path');
    }

    this.controllerPath = options.controllerPath;
    this.logger = options.logger || console;

    let { controllerBefore = [], controllerAfter = [] } = options;
    this.controllerBefore = controllerBefore;
    this.controllerAfter = controllerAfter;
    this.routesConfig = {};
  }

  addBeforeRunningController(func) {
    this.controllerBefore.push(func);
    return this;
  }

  addAfterRunningController(func) {
    this.controllerAfter.push(func);
    return this;
  }

  addRoutesFromConfigFolders(folders) {
    if (folders.constructor === String) {
      folders = [folders];
    }

    let routesConfig = {};
    folders.forEach((src) => {
      try {
        fs.accessSync(src, fs.F_OK);
      } catch (e) {
        throw new Error(`Path "${src}" not found`);
      }
      fs.readdirSync(src).forEach((file) => {
        const fullPath = `${src}/${file}`;
        if (fs.statSync(fullPath).isFile()) {
          const newObject = require(fullPath);
          routesConfig = Object.assign(routesConfig, newObject);
        }
      });
    });

    this.addRoutesFromConfigs(routesConfig);
    return this;
  }

  addRoutesFromConfigs(routesConfig) {
    return Object.assign(this.routesConfig, routesConfig);
  }

  addDocumentation({
    id = 'documentation.methods',
    path = '/documentation/methods',
    method = 'get',
    description = 'Provide full api documentation',
    returns = 'List of available mathods',
  } = {}) {
    this.routesConfig[id] = {
      method,
      description,
      returns,
      path,
      dispatch: async (ctx, next) => {
        Object.keys(this.routesConfig).forEach((name) => {
          const { method = 'get', path = '', dataset = [], description = '', args = {} } = this.routesConfig[name];
          ctx.apiResponse.addData({ name, description, method, path, args, dataset });
        });
      },
    };
    return this;
  }

  init() {
    const router = this;
    Object.keys(this.routesConfig).forEach((name) => {
      const routeCgf = this.routesConfig[name];
      const { method = 'get', path = '', dispatch = null } = routeCgf;
      router.logger.verbose(`Mount route ${name} - [${method}] ${path}`);

      switch (dispatch.constructor) {
        case Function:
          router[method](name, path, async (ctx, next) => {
            router.controllerBefore.forEach((func) => func({ ctx, router: routeCgf, name }));
            await dispatch(ctx, next);
            router.controllerAfter.forEach((func) => func({ ctx, router: routeCgf, name }));
          });
          break;

        case Object:
          if (!dispatch.hasOwnProperty('controller') || !dispatch.hasOwnProperty('method')) {
            router.logger.error('Unable to mount router, the dispatch Object has not the controller/method properties');
            throw new Error(`Bad dispatch for route ${name}`);
          }
          router[method](name, path, async (ctx, next) => {
            router.controllerBefore.forEach((func) => func({ ctx, router: routeCgf, name }));
            const Controller = require(`${router.controllerPath}/${dispatch.controller}`);
            let controller = new Controller();
            await controller[dispatch.method](ctx, next);
            router.controllerAfter.forEach((func) => func({ ctx, router: routeCgf, name }));
          });
          break;

        default:
          router.logger.error('Unable to mount router, the given dispatch is neither Function nor Object');
          throw new Error(`Bad dispatch for route ${name}`);
      }
    });
    return this;
  }
};
