/*
 * Build custom errors from a descriptor config file and optionally add errors details with
 * same format as mongoose error for consistence
 *
 * @example config file
 * ```
 * {
 *   UnauthorizedError: {
 *     code: 401,
 *     message: 'you need to be logged in to access this ressource',
 *   },
 *   ForbiddenError: {
 *     code: 403,
 *     message: 'you are not allow to access this ressource',
 *     details: true,
 *   },
 * }
 * ```
 */
const errorExtend = require('error-extend');

module.exports = function(config) {
  let errors = {};
  Object.keys(config).forEach((errorClassname) => {
    const cfg = config[errorClassname];

    if (!cfg.hasOwnProperty('code') || !cfg.hasOwnProperty('message')) {
      throw new Error('Configuration error: each error configuration object requires both "code" and "message" properties')
    }
    let code = cfg.code;
    let defaultMessage = cfg.message;
    let details = cfg.hasOwnProperty('details') && cfg.details === true;

    let init = false;
    if (details) {
      init = function () {
        // Details storage property
        this.details = {};

        // Details setter
        this.addDetail = ({ property = '', type = '', message = '', name = errorClassname, value = '' } = {}) => {
          this.details[property] = { message, name, kind: type, path: property, value, properties: { type, message, path: property, value } };
        };

        // Init from constructor if any detail
        for (let k = 1; k < arguments.length; k++) {
          this.addDetail(arguments[k]);
        }
      };
    }

    errors[errorClassname] = errorExtend({ name: errorClassname, code, defaultMessage, init });
  });

  return errors;
}
