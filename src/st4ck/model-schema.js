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

const mongoose = require('mongoose');
const MongooseSchema = mongoose.Schema;
const MongooseError = require('mongoose/lib/error');
const paginatePlugin = require('mongoose-paginate');
const hiddenPlugin = require('mongoose-hidden')();
const autoIncrementPlugin = require('mongoose-auto-increment');
const createdAtPlugin = require('mongoose-plugin-createdat');
const updatedAtPlugin = require('mongoose-plugin-updatedat');

module.exports = class Schema extends MongooseSchema {
  constructor({ name, descriptor, connection } = {}) {
    super(descriptor, {
      toObject: { virtuals: true },
      toJSON: { virtuals: true },
    });

    this._descriptor = descriptor;
    this._connection = connection;
    this._options = {
      name,
      createdAt: true,
      updatedAt: true,
      autoIncrement: 'id',
      paginate: true,
    };
  }

  getDescriptor() {
    return this._descriptor;
  }

  getProperties() {
    let res = this.getDescriptor();
    const autoIncrementId = this.getOption('autoIncrement');

    if (autoIncrementId !== false) {
      res[autoIncrementId] = {
        type: Number,
        required: true,
        unique: true,
        index: true,
        querable: true,
      };
    }

    if (this.getOption('createdAt')) {
      res.created_at = {
        type: Date,
        required: true,
        unique: false,
        querable: true,
      };
    }

    if (this.getOption('updatedAt')) {
      res.updated_at = {
        type: Date,
        required: true,
        unique: false,
        querable: true,
      };
    }

    return res;
  }

  getConnection() {
    return this._connection;
  }

  getOption(name) {
    if (!this._options.hasOwnProperty(name)) {
      throw new Error(`Unknown option ${name}`);
    }
    return this._options[name];
  }

  _enablePlugins() {
    if (this.getOption('autoIncrement') != false) {
      autoIncrementPlugin.initialize(this.getConnection());
      this.plugin(autoIncrementPlugin.plugin, {
        model: this.getOption('name'),
        field: this.getOption('autoIncrement'),
        startAt: 1,
        incrementBy: 1,
      });
    }

    if (this.getOption('createdAt')) this.plugin(createdAtPlugin);
    if (this.getOption('updatedAt')) this.plugin(updatedAtPlugin);

    if (this.getOption('paginate')) this.plugin(paginatePlugin);

    this.plugin(hiddenPlugin);
  }


  getModel() {
    this._enablePlugins();

    this.virtual('__ressource__').get(() => this.getOption('name').toLowerCase());

    const model = this._connection.model(this.getOption('name'), this);

    // Fucking code to clean mongoose unique error ... :( So ugly, sorry
    model.cleanError = (err) => new Promise((resolve, reject) => {
      const ValidationErrorCode = 481;

      // Not a mongoose error ? skip
      switch (err.name) {
        case 'MongoError': {
          if (err.code === 11000 || err.code === 11001) {
            // Unique key
            const matches = /index:\s*(?:.+?\.\$)?(\S*)\s*dup key:\s*\{(.*?)\}/.exec(err.message);
            if (matches.length < 2) {
              return resolve(err);
            }
            const indexName = matches[1];
            const rawValues = matches[2].trim();
            let value = /^\s*:\s*(\S*).*,?$/g.exec(rawValues)[1];

            const uniqueError = new MongooseError.ValidationError(model);
            uniqueError.code = ValidationErrorCode;
            model.collection.indexInformation((dbErr, indexes) => {
              if (dbErr || !indexes.hasOwnProperty(indexName)) {
                return reject(err);
              }
              const index = indexes[indexName];
              index.forEach((item) => {
                const path = item[0];
                const message = (
                    this.getDescriptor().hasOwnProperty(path) &&
                    this.getDescriptor()[path].hasOwnProperty('unique') &&
                    this.getDescriptor()[path].unique.constructor === Array
                  ) ? this.getDescriptor()[path].unique[1] : '';
                uniqueError.errors[path] = new MongooseError.ValidatorError({ type: 'duplicated', path, value, message });
              });
              return resolve(uniqueError);
            });
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

    model.getDefault = (property) => {
      if (!this.getDescriptor().hasOwnProperty(property)) {
        throw new Error(`Unknwon property "${property}`);
      }
      if (!this.getDescriptor()[property].hasOwnProperty('default')) {
        throw new Error(`No default property for "${property}`);
      }

      return this.getDescriptor()[property].default;
    };

    model.getProperties = () => this.getProperties();
    model.getPropertiesNames = (onlyBasics = true) => (Object.keys(onlyBasics ? this.getDescriptor() : this.getProperties()));

    return model;
  }
};
