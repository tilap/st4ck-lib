/**
 * Service with:
 * - context (setContext, getContext, hasContext)
 * - acl (setAcl, getAcl, hasAcl)
 * - logger (setLogger, getLogger, hasLogger)
 * - modelLoader (setModelLoader, getModelLoader, hasModelLoader, getModel)
 * - assert instance.assert(condition, FullErrorObject)
 */
const EventEmitter = require('events');

module.exports = class Service extends EventEmitter {
  constructor() {
    super();
    this.context = {};
    this.logger = null;
    this.acl = null;
    this.serviceFactory = null;
    this.defaultModelName = '';
    this.emit('initialized');
  }

  // Service factory -----------------------------------------------------------
  getServiceFactory() {
    this.assert(this.hasServiceFactory(), new Error('No service factory provided'));
    return this.serviceFactory;
  }

  setServiceFactory(serviceFactory) {
    this.serviceFactory = serviceFactory;
    return this;
  }

  hasServiceFactory() {
    return this.serviceFactory ? true : false;;
  }

  getService(serviceId) {
    this.assert(this.hasServiceFactory(), new Error('No service factory available'));
    const service = this.getServiceFactory()(serviceId);
    if (this.hasContextUser() && service.setContextUser) {
      service.setContextUser(this.getContextUser());
    }
    if (this.hasAcl() && service.setAcl) {
      service.setAcl(this.getAcl());
    }
    if (this.hasServiceFactory() && service.setServiceFactory) {
      service.setServiceFactory(this.getServiceFactory());
    }
    if (this.hasModelLoader() && service.setModelLoader) {
      service.setModelLoader(this.getModelLoader());
    }
    if (this.hasLogger() && service.setLogger) {
      service.setLogger(this.getLogger());
    }
    return service;
  }

  // Context --------------------------------------------------------------
  setContext(key, value) {
    if (this.hasContext(key) && this.getContext(key)!==value) {
      this.emit('context:change', { key, previous: this.getContext(key), new: value } );
    } else if (!this.hasContext(key)) {
      this.emit('context:added', { key, value } );
    }
    this.context[key] = value;
    return this;
  }

  getContext(key) {
    return this.hasContext(key) ? this.context[key] : null;
  }

  hasContext(key) {
    return this.context.hasOwnProperty(key);
  }

  // Acl -----------------------------------------------------------------------
  setAcl(acl) {
    this.acl = acl;
    return this;
  }

  getAcl() {
    this.assert(this.hasAcl(), new Error('acl loader not set'))
    return this.acl;
  }

  hasAcl() {
    return this.acl ? true : false;
  }

  // Model loader --------------------------------------------------------------
  setModelLoader(modelLoader) {
    this.modelLoader = modelLoader;
    return this;
  }

  getModelLoader() {
    this.assert(this.hasModelLoader(), new Error('model loader not set'))
    return this.modelLoader;
  }

  hasModelLoader() {
    return this.modelLoader ? true : false;
  }

  getModel(name = null) {
    if (!this.modelLoader) throw new Error('No model loader set');
    const modelToLoad = name || this.defaultModelName;
    return this.modelLoader(modelToLoad);
  }

  // Logger --------------------------------------------------------------------
  setLogger(logger) {
    this.logger = logger;
    return this;
  }

  getLogger() {
    this.assert(this.hasLogger(), new Error('logger not set'))
    return this.logger;
  }

  hasLogger() {
    return this.logger ? true : false;
  }

  // Assert --------------------------------------------------------------------
  assert(condition, error) {
    if (condition) return true;
    if (error.constructor === String) throw new Error(error);
    throw error;
  }
};
