const ApiResponse = require('st4ck-lib-apiresponse');
const renderer = require('./renderer');

module.exports = function ({ contextKey = 'apiResponse', showStackTraceOnError = false, logger = console }) {
  return async (ctx, next) => {
    const apiResponse = new ApiResponse();
    apiResponse.showStackTraceOnError = showStackTraceOnError;
    ctx[contextKey] = apiResponse;

    const start = new Date();
    try {
      await next();
    } catch (err) {
      if (!err.code || err.code > 499) {
        logger.error(err.message || err, err.stack);
      } else {
        logger.log(err.message || err, err.stack);
      }

      ctx[contextKey].resetData();
      ctx[contextKey].setError(err);
      if (err.details) {
        ctx[contextKey].addErrorDetails(err.details);
      } else if (err.errors) {
        ctx[contextKey].addErrorDetails(err.errors);
      }
      ctx.response.status = ctx[contextKey].error.code === 500 ? 500 : 200;
    } finally {
      // Add common metas
      ctx[contextKey].setMeta('dispatch_start', start);
      ctx[contextKey].setMeta('dispatch_end', new Date());
      ctx[contextKey].setMeta('dispatch_duration', (new Date() - start));

      // Output format in a nice way
      const format = ctx.accepts('json', 'html');
      ctx.body = renderer(ctx[contextKey], format, showStackTraceOnError);
    }
  };
};
