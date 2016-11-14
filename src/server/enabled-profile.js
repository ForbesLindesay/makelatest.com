export default {
  _id: 'ENABLED',
  name: 'Enabled',
  isBuiltIn: true,
  isCustom: false,
  settings: {
    yarn: {
      enabled: true,
      onlyIfYarnLockPresent: true,
      createPullRequests: true,
      autoMerge: true,
    },
  },
};
