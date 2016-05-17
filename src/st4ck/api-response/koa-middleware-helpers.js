module.exports = function ({ contextKey = 'apiResponse' } = {}) {
  return async (ctx, next) => {
    ctx.setFromPaginateResult = ({ total = null, limit = null, page = null, pages = null, docs = null } = {}) => {
      if (total || limit || page || pages || docs) {
        let pagination = {};
        if (total !== null) pagination.total = total;
        if (limit !== null) pagination.limit = limit;
        if (page !== null) pagination.page = page;
        if (pages !== null) pagination.pages = pages;
        if (docs !== null) ctx.apiResponse.addData(docs);
        ctx[contextKey].setSuccessProperty('paging', pagination);
      }
    };
    await next();
  };
};
