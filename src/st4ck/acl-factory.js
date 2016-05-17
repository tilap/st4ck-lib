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

module.exports = function ({ groups = {}, profiles = {}, defaultProfile = 'default' } = {}) {
  if (!profiles.hasOwnProperty(defaultProfile)) {
    throw new Error('defaultProfile is not defined in acl configuration');
  };

  let profileRights = {};
  let rightProfiles = {};
  Object.keys(profiles).forEach((profileId) => {
    profileRights[profileId] = [];
    profiles[profileId].forEach((groupdId) => {
      profileRights[profileId] = profileRights[profileId].concat(groups[groupdId]);
      groups[groupdId].forEach((right) => {
        if (!rightProfiles.hasOwnProperty(right)) {
          rightProfiles[right] = [];
        }
        rightProfiles[right].push(profileId);
      });
    });
  });

  const getProfileRights = (profile) => {
    if (!profile || !profiles.hasOwnProperty(profile)) {
      profile = defaultProfile;
    }
    return profileRights.hasOwnProperty(profile) ? profileRights[profile] : [];
  };

  const hasProfileRight = (profile, right) => getProfileRights(profile).indexOf(right) > -1;

  const getRightProfiles = (right) => (rightProfiles.hasOwnProperty(right) ? rightProfiles[right] : []);

  return { hasProfileRight, getProfileRights, getRightProfiles };
};
