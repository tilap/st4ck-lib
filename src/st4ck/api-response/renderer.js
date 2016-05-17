const beautify = require('json-beautify');

function toJson(apiResponse, showStackTraceOnError) {
  if (!apiResponse.isError() && apiResponse.hasErrorDetails()) {
    throw new Error('There are error details but no error set.');
  }

  let res = {};
  if (apiResponse.isError()) {
    res.is_success = false;
    res.result = 'error';
    res.error = {
      code: apiResponse.error.code || 500,
      message: apiResponse.error.message || 'Unexpected error',
    };

    if (apiResponse.error.details) {
      res.error.details = apiResponse.error.details;
    }

    if (showStackTraceOnError && res.error.stack) {
      res.error.stack = apiResponse.error.stack.split('\n');
    }
  } else {
    res.is_success = true;
    res.result = 'success';
    res.success = Object.assign(apiResponse.success);
  }

  res.metas = apiResponse.metas;

  if (apiResponse.source) {
    res.source = apiResponse.source;
  }

  return res;
}

function toHtml(apiResponse, showStackTraceOnError) {
  const result = apiResponse.toString('json', showStackTraceOnErrorn);

  let content = '<html>';
  content += '<head>';
  content += '<style>';
  content += 'body { background: #fafbfa; color: #121312; font-size: 1.1em}';
  content += 'div { display: block; border-radius: 3px; overflow: hidden; border: 1px solid #d2d3d2; }';
  content += 'span { display: block; padding: 15px; background: #f1f2f3; text-transform: uppercase}';
  content += 'pre { margin: 0; padding: 15px; background: #fff; }';
  content += 'footer { margin: 10px; text-align: center; font-size: .85em }';
  content += '</style>';
  content += '</head><body>';
  content += '<div><span>Api response</span><pre>';
  content += beautify(result, null, 2, 80);
  content += '</pre></div>';
  content += '<footer><em>This is a Html version of the api output.</em></footer>';
  content += '</body></html>';

  content = content.replace(/(https?:\/\/[^\s]*)/ig, '<a href="$1">$1</a>');
  return content;
}

module.exports = function renderer(apiResponse, format = 'json', showStackTraceOnError = false) {
  switch (format) {
    case 'json': return toJson(apiResponse, showStackTraceOnError);
    case 'html': return toHtml(apiResponse, showStackTraceOnError);
    default:
      throw new Error(`Cannot format response into ${format}`);
  }
}
