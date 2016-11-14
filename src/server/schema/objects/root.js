export default {
  name: 'Root',
  fields: {
    me: {
      type: 'User?',
      resolve(root, args, {user, db}) {
        if (!user) {
          return null;
        }
        return db.users.findOne({_id: user._id});
      },
    },
    isAuthenticated: {
      type: 'boolean',
      resolve(root, args, {user}) {
        return !!user;
      },
    },
    isWaitingList: {
      type: 'boolean',
      resolve(root, args, {user}) {
        return !!(user && user.waitingList);
      },
    },
    repositoryOwners: {
      type: 'Owner[]',
      resolve(root, args, {user, db}) {
        if (!user) {
          throw new Error('Access Denied');
        }
        return db.getOwners(user.id);
      },
    },
    owner: {
      type: 'Owner',
      args: {
        id: 'OwnerID',
      },
      resolve(root, {id}, {user, db}) {
        if (!user) {
          throw new Error('Access Denied');
        }
        return db.getOwner(id === 'me' ? +user.id : +id, user.id);
      },
    },
    repository: {
      type: 'Repository',
      args: {
        id: 'number',
      },
      resolve(root, {id}, {user, db}) {
        if (!user) {
          throw new Error('Access Denied');
        }
        return db.getRepository(id, user.id);
      },
    },
  },
  mutations: {
    refresh: {
      resolve() {
        // intentionlly a no-op mutation
      },
    },
  },
};
