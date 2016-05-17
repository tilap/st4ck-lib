/*
 * Basic controller
 */
module.exports = class Controller {
  constructor({ logger = console } = {}) {
    this.logger = logger;
  }
};
