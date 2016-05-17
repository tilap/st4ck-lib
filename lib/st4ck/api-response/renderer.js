'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var beautify = require('json-beautify');

function toJson(apiResponse, showStackTraceOnError) {
  if (!apiResponse.isError() && apiResponse.hasErrorDetails()) {
    throw new Error('There are error details but no error set.');
  }

  var res = {};
  if (apiResponse.isError()) {
    res.is_success = false;
    res.result = 'error';
    res.error = {
      code: apiResponse.error.code || 500,
      message: apiResponse.error.message || 'Unexpected error'
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
    res.success = (0, _assign2.default)(apiResponse.success);
  }

  res.metas = apiResponse.metas;

  if (apiResponse.source) {
    res.source = apiResponse.source;
  }

  return res;
}

function toHtml(apiResponse, showStackTraceOnError) {
  var result = apiResponse.toString('json', showStackTraceOnErrorn);

  var content = '<html>';
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

module.exports = function renderer(apiResponse) {
  var format = arguments.length <= 1 || arguments[1] === undefined ? 'json' : arguments[1];
  var showStackTraceOnError = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  switch (format) {
    case 'json':
      return toJson(apiResponse, showStackTraceOnError);
    case 'html':
      return toHtml(apiResponse, showStackTraceOnError);
    default:
      throw new Error('Cannot format response into ' + format);
  }
};