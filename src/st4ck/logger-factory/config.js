module.exports = class LoggerFactoryConfig {
  constructor() {
    this.loggers = {};
    this.transporters = {};
    this.ErrorClass = Error;
  }

  // Error
  setErrorClass(ErrorClass) {
    this.ErrorClass = ErrorClass;
  }

  // Loggers
  addLogger(id, transporters = []) {
    if (id.constructor !== String) {
      throw new this.ErrorClass('Logger id must be a string');
    }

    if (transporters.constructor !== Array) {
      throw new this.ErrorClass('transporters must be an array');
    }

    transporters.forEach(({ transporter = '', options = {} } = {}) => {
      this.addTransporterToLogger(id, transporter, options);
    });
  }

  setLoggers(config) {
    if (!config.constructor === Object) {
      throw new this.ErrorClass('Logger config is not an object');
    }
    Object.keys(config).forEach((id) => this.addLogger(id, config[id]));
  }

  getLogger(id) {
    if (!this.loggers.hasOwnProperty(id)) {
      throw new this.ErrorClass(`Unknown logger id "${id}"`);
    }
    return this.loggers[id];
  }

  // Logger transporters
  addTransporterToLogger(id, transporter, options) {
    if (!this.loggers.hasOwnProperty(id)) {
      this.loggers[id] = [];
    }
    this.loggers[id].push({ transporter, options });
  }

  // Transporters
  addTransporter(id, { transport = '', options = {} }) {
    if (id.constructor !== String) {
      throw new this.ErrorClass('Transporter id must be a string');
    }

    if (!transport) {
      throw new this.ErrorClass('"transport" property is required in transporter config');
    }

    this.transporters[id] = { transport, options };
  }

  setTransporters(config) {
    if (!config.constructor === Object) {
      throw new this.ErrorClass('Transporter config is not an object');
    }

    Object.keys(config).forEach((id) => this.addTransporter(id, config[id]));
  }

  getTransporter(id) {
    if (!this.transporters.hasOwnProperty(id)) {
      throw new this.ErrorClass(`Unknown transporter id "${id}"`);
    }
    return this.transporters[id];
  }

  getTransporterOptions(id) {
    const transportConfig = this.getTransporter(id);
    return transportConfig.hasOwnProperty('options') ? transportConfig.options : {};
  }

  getTransporterType(id) {
    const transportConfig = this.getTransporter(id);
    if (!transportConfig.hasOwnProperty('transport')) {
      throw new this.ErrorClass(`transporter "${id}" has no transport`);
    }
    return transportConfig.transport;
  }
};
