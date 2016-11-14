export default {
  name: 'Profile',
  id(profile) {
    return 'Profile:' + profile._id;
  },
  fields: {
    id: {
      type: 'string',
      resolve(profile) {
        return '' + profile._id;
      },
    },
    name: 'string',
    isBuiltIn: {
      type: 'boolean',
      resolve(profile) {
        return profile.isBuiltIn === true;
      },
    },
    isCustom: 'boolean',
    settings: 'BotSettings',
  },
};
