export default {
  _id: 'DISABLED',
  name: 'Disabled',
  isBuiltIn: true,
  isCustom: false,
  settings: {
    yarn: {
      enabled: false,
      onlyIfYarnLockPresent: true,
      createPullRequests: true,
      autoMerge: true,
    },
  },
};
