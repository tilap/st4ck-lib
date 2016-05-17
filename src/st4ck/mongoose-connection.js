/*
 * A simple mongoose db connection with log and connection retry on error
 */

const mongoose = require('mongoose');

module.exports = function getMongoConnection({ url, id, logger = console, retry = 1000 } = {}) {
  const connect = (url) => (mongoose.createConnection(url, (err) => {
    if (err) setTimeout(() => connect(url), retry);
  }));

  const db = connect(url);
  db.on('connecting', () => logger.info('connecting...'));
  db.on('error', (err) => logger.error(`error: ${err.message || err}`));
  db.on('connected', () => logger.info('connected'));
  db.once('open', () => logger.info('connection opened'));
  db.on('reconnected', () => logger.info('reconnected'));
  db.on('disconnected', () => logger.warn(`disconnected, will retry every ${retry}ms`));
  return db;
};
