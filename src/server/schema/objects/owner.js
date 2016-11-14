import ms from 'ms';
import disabledProfile from '../../disabled-profile';
import enabledProfile from '../../enabled-profile';

export default {
  name: 'Owner',
  fields: {
    id: 'number',
    login: 'string',
    avatarUrl: 'string',
    type: 'string',
    isSelf: {
      type: 'boolean',
      resolve(owner, args, {user}) {
        return owner.id + '' === user.id + '';
      },
    },
    canAdmin: {
      type: 'boolean',
      resolve(owner, args, {user, db}) {
        if (owner.id + '' === user.id + '') {
          return true;
        }
        if (!owner.canAdminLastUpdated || owner.canAdminLastUpdated.getTime() < Date.now() - ms('2 hours')) {
          return db.updateAdminStatus(user, owner);
        }
        return owner.canAdmin;
      },
    },
    profiles: {
      type: 'Profile[]',
      resolve(owner, args, {user, db}) {
        return [disabledProfile, enabledProfile];
        // note that these aren **not** keyed with a userID becuase any member of the org can see the same profiles
      },
    },
    defaultProfile: {
      type: 'Profile',
      resolve(owner, args, {user, db}) {
        return db.getDefaultProfile(owner.id);
      },
    },
    repositories: {
      type: 'Repository[]',
      args: {
        includeForks: 'boolean',
      },
      resolve(owner, {includeForks}, {user, db}) {
        if (!user) {
          throw new Error('Access Denied');
        }
        const query = {userID: user.id, ownerID: owner.id};
        if (!includeForks) {
          query.fork = false;
        }
        return db.repositories.find(query);
      },
    },
  },
};
