'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Acl builder based on rights in groups, and profiles with 0 to n groups
 * expose 3 methods:
 * - acl.hasProfileRight(profile, rightId) => does the profile "profile" has the right "rightId"
 * - acl.getProfileRights(profile) => return the list of the "profile" rights
 * - acl.getRightProfiles(rightId); => return the list of profiles that own the right "rightId"
 *
 * @example Config file
 * ```
 * const groups = {
 *    usermanagement: ['users.create', 'users.list', 'users.edit', 'users.delete'],
 *    itemsstuff: ['items.dothis', 'items.dothat'],
 * }
 * const groupes = {
 *    admin: ['usermanagement', 'itemsstuff'],
 *    user: ['itemsstuff'],
 *    default: []
 * }
 * ```
 *
 * @example: acl.canProfileDo('admin', 'users.list') // true
 * @example: acl.canProfileDo('admin', 'items.dothis') // true
 * @example: acl.canProfileDo('user', 'users.list') // false
 * @example: acl.canProfileDo('user', 'items.dothis') // true
 * @example: acl.canProfileDo('user', 'does-not-exists') // false
 * @example: acl.canProfileDo('does-not-exists', 'whatever') // false, will base results on default profile
 */

module.exports = function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$groups = _ref.groups;
  var groups = _ref$groups === undefined ? {} : _ref$groups;
  var _ref$profiles = _ref.profiles;
  var profiles = _ref$profiles === undefined ? {} : _ref$profiles;
  var _ref$defaultProfile = _ref.defaultProfile;
  var defaultProfile = _ref$defaultProfile === undefined ? 'default' : _ref$defaultProfile;

  if (!profiles.hasOwnProperty(defaultProfile)) {
    throw new Error('defaultProfile is not defined in acl configuration');
  };

  var profileRights = {};
  var rightProfiles = {};
  (0, _keys2.default)(profiles).forEach(function (profileId) {
    profileRights[profileId] = [];
    profiles[profileId].forEach(function (groupdId) {
      profileRights[profileId] = profileRights[profileId].concat(groups[groupdId]);
      groups[groupdId].forEach(function (right) {
        if (!rightProfiles.hasOwnProperty(right)) {
          rightProfiles[right] = [];
        }
        rightProfiles[right].push(profileId);
      });
    });
  });

  var getProfileRights = function getProfileRights(profile) {
    if (!profile || !profiles.hasOwnProperty(profile)) {
      profile = defaultProfile;
    }
    return profileRights.hasOwnProperty(profile) ? profileRights[profile] : [];
  };

  var hasProfileRight = function hasProfileRight(profile, right) {
    return getProfileRights(profile).indexOf(right) > -1;
  };

  var getRightProfiles = function getRightProfiles(right) {
    return rightProfiles.hasOwnProperty(right) ? rightProfiles[right] : [];
  };

  return { hasProfileRight: hasProfileRight, getProfileRights: getProfileRights, getRightProfiles: getRightProfiles };
};