import disabledProfile from '../../disabled-profile';
import enabledProfile from '../../enabled-profile';

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
        // note that these aren **not** keyed with a userID becuase any member of the org can see the same profiles
        return db.repositoryProfiles.findOne({_id: repository.id}).then(profile => {
          if (!profile) {
            return db.getDefaultProfile(repo.ownerID);
          }
          if (profile.isCustom) {
            return profile;
          } else if (profile.profile === 'ENABLED') {
            return enabledProfile;
          } else if (profile.profile === 'DISABLED') {
            return disabledProfile;
          } else {
            return db.ownerProfiles.findOne({_id: profile.profile});
          }
        });
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
          db.repositories.findOne({id: repositoryID, userID: user.id}),
          builtInProfile ? null : db.ownerProfiles.findOne({_id: profileID}),
        ]).then(([repo, profile]) => {
          if (!(repo && (builtInProfile || (profile && repo.ownerID === profile.ownerID)))) {
            throw new Error('Access Denied');
          }
          return db.repositoryProfiles.update(
            {_id: repo.id},
            {$set: {isCustom: false, profile: profileID, userID: user.id}},
            {upsert: true},
          );
        });
      },
    },
    setCustomProfile: {
      args: {repositoryID: 'number', settings: 'BotSettings'},
      resolve({repositoryID, settings}, {user, db}) {
        return db.repositories.findOne({id: repositoryID, userID: user.id}).then(repo => {
          if (!repo) {
            throw new Error('Access Denied');
          }
          return db.repositoryProfiles.update(
            {_id: repo.id},
            {$set: {name: 'Custom', isCustom: true, settings, userID: user.id}},
            {upsert: true},
          );
        });
      },
    },
  },
};
