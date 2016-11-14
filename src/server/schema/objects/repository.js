export default {
  name: 'Repository',
  fields: {
    id: 'number',
    name: 'string',
    fullName: 'string',
    fork: 'boolean',
    profile: {
      type: 'Profile',
      resolve(repository, args, {user, db}) {
        return db.getRepositoryProfile(repository.id);
      },
    },
  },
  mutations: {
    setProfile: {
      args: {repositoryID: 'number', profileID: 'string'},
      resolve({repositoryID, profileID}, {user, db}) {
        const builtInProfile = profileID === 'ENABLED' || profileID === 'DISABLED';
        if (!builtInProfile) {
          profileID = new db.ObjectId(profileID);
        }
        return Promise.all([
          db.getRepository(repositoryID, user.id),
          builtInProfile ? null : db.ownerProfiles.findOne({_id: profileID}),
        ]).then(([repo, profile]) => {
          if (!(repo && (builtInProfile || (profile && repo.ownerID === profile.ownerID)))) {
            throw new Error('Access Denied');
          }
          return db.updateRepositoryProfile(
            repo.id,
            {name: null, isCustom: false, profile: profileID, setings: null, userID: user.id},
          );
        });
      },
    },
    setCustomProfile: {
      args: {repositoryID: 'number', settings: 'BotSettings'},
      resolve({repositoryID, settings}, {user, db}) {
        return db.getRepository(repositoryID, user.id).then(repo => {
          if (!repo) {
            throw new Error('Access Denied');
          }
          return db.updateRepositoryProfile(
            repo.id,
            {name: 'Custom', isCustom: true, profile: null, settings, userID: user.id},
          );
        });
      },
    },
  },
};
