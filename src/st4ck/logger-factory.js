/*
 * A logger factory for Winston based on 3 config level:
 * - logger
 * - transporter
 * - custome call
 *
 * @example
 * ```
 * const myLoggerFactory = new LoggerFactory();
 *
 * // Add a transporter for file
 * myLoggerFactory.config.addTransporter('myFileTransporter', {
 *   transport: 'file',
 *   options: {
 *     filename: `path/to/logs/default.log` ,
 *     level: 'warn',
 *   },
 * });
 *
 * // Add another file transporter
 * myLoggerFactory.config.addTransporter('myOtherFileTransporter', {
 *   transport: 'file',
 *   options: {
 *     filename: `another/path/for/logs/other.log` ,
 *     level: 'warn',
 *   },
 * });
 *
 * // A console transporter
 * myLoggerFactory.config.addTransporter('myConsoleTransporter', {
 *   transport: 'console',
 * });
 *
 * // You can add more transporter with existing winston-transport packages
 * // ...
 *
 * // Register a full logger name 'database' with different transports
 * myLoggerFactory.config.addLogger('database', [
 *   {
 *     transporter: 'myFileTransporter', // A previous inserted transporter id
 *     options: { filename: `/path/to/log/directory/logfile.log` },
 *   },
 *   {
 *     transporter: 'myConsoleTransporter'
 *   },
 *   {
 *     transporter: 'myOtherFileTransporter',
 *     options: {
 *       level: 'error',
 *     }
 *   }
 * ]);
 *
 * // In code, call a logger
 * const myDatabaseLogger = myLoggerFactory.get('database');
 * myDatabaseLogger.info('here a fabulous message')
 * ```
 *
 */

const winston = require('winston');
const cliColor = require('cli-color');
const LoggerFactoryConfig = require('./logger-factory/config');

module.exports = class LoggerFactory {
  constructor() {
    this.config = new LoggerFactoryConfig();
    this.setErrorClass(Error);
  }

  setErrorClass(ErrorClass) {
    this.ErrorClass = ErrorClass;
    this.config.setErrorClass(ErrorClass);
  }

  getTranspoterClass(id) {
    const type = this.config.getTransporterType(id);
    switch (type) {
      case 'console':
        return winston.transports.Console;
      case 'file':
        return winston.transports.File;
      default:
        if (type.constructor === String) {
          try {
            return require(type);
          } catch (err) {
            throw new this.ErrorClass(`Unable to load npm module ${type}`);
          }
        }
        return type;
    }
  }

   // Final override of transporter settings
  customizeOptions(id, options) {
    const type = this.config.getTransporterType(id);

    switch (type) {
      case 'console': {
        const settings = {
          silly: { icon: '→', color: 'magenta' },
          verbose: { icon: '→', color: 'blackBright' },
          debug: { icon: '→', color: 'green' },
          info: { icon: '✔', color: 'cyan' },
          warn: { icon: '!', color: 'yellow' },
          error: { icon: '✖', color: 'red' },
        };

        if (!options.hasOwnProperty('timestamp')) {
          options.timestamp = () => Date.now();
        }

        if (!options.hasOwnProperty('formatter')) {
          options.formatter = (opts) => {
            const color = settings.hasOwnProperty(opts.level) ? settings[opts.level].color : 'green';
            const icon = settings.hasOwnProperty(opts.level) ? settings[opts.level].icon : '→';

            let res = [];
            if (options.message_prefix) {
              res.push(`[${options.message_prefix}]`);
            }
            res.push(icon);
            res.push(undefined !== opts.message ? opts.message : '');
            res.push(opts.meta && Object.keys(opts.meta).length ? `\n\t${JSON.stringify(opts.meta)}` : '');
            return cliColor[color](res.join(' '));
          };
        }
        break;
      }
      case 'file':
        if (!options.hasOwnProperty('formatter') && !options.hasOwnProperty('json')) {
          options.json = false;
          options.formatter = (opts) => `${new Date} [${options.message_prefix || '-'}] ${opts.level} --- ${opts.message}`;
        }
        break;
      default:
    }

    return options;
  }

  get(id, optionsOverride = {}) {
    const loggerOptions = this.config.getLogger(id);

    let transports = [];
    loggerOptions.forEach(({ transporter = '', options = {} } = {}) => {
      const TransportClass = this.getTranspoterClass(transporter);

      const optionFromTransporterConfig = this.config.getTransporterOptions(transporter);
      let returnOptions = Object.assign({}, optionFromTransporterConfig, options);
      returnOptions = this.customizeOptions(transporter, returnOptions);
      returnOptions = Object.assign(returnOptions, optionsOverride);

      transports.push(new (TransportClass)(returnOptions));
    });

    return new (winston.Logger)({ transports });
  }
};
