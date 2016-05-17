const assert = require('assert');

module.exports = class KoaCtxHelpers {
  constructor(ctx) {
    this.ctx = ctx;
  }

  assertBodyRequest() {
    assert(this.ctx.request && this.ctx.request.hasOwnProperty('body'), 'Not a valid post request');
  }

  getRequestBodies() {
    this.assertBodyRequest();
    return this.ctx.request.body;
  }

  getRequestBody(id, defaultValue = '') {
    this.assertBodyRequest();
    return this.ctx.request.body.hasOwnProperty(id) ? this.ctx.request.body[id] : defaultValue;
  }

  getExistingRequestBodies(items) {
    assert(items.constructor === Array, 'getExistingRequestBodies requires an Array as param');
    let output = {};
    try {
      this.assertBodyRequest();
    } catch (err) {
      return output;
    }
    items.filter((key) => this.ctx.request.body.hasOwnProperty(key)).forEach((k) => output[k] = this.ctx.request.body[k]);
    return output;
  }

  getDefaultRequestBodies(items) {
    this.assertBodyRequest();
    assert(items.constructor === Object, 'getDefaultRequestBodies requires an Object as param');
    let output = {};
    Object.keys(items).forEach((key) => {
      output[key] = this.getRequestBody(key, items[key]);
    });
    return output;
  }

  getQueries() {
    return this.ctx.query || [];
  }

  getQuery(id, defaultValue) {
    return this.ctx.query.hasOwnProperty(id) ? this.ctx.query[id] : defaultValue;
  }

  getQueriesIfExists(items) {
    assert(items.constructor === Array, new Error('getQueryIfExists requires an Array as param'));
    let output = {};
    items.filter((key) => this.ctx.query.hasOwnProperty(key)).forEach((k) => output[k] = this.ctx.query[k]);
    return output;
  }

  getParams() {
    return this.ctx.params;
  }

  getParam(id, defaultValue = '') {
    return this.ctx.params.hasOwnProperty(id) ? this.ctx.params[id] : defaultValue;
  }
};
