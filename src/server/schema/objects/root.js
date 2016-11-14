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
    isAdmin: {
      type: 'boolean',
      resolve(root, args, {user}) {
        return !!(user && user.isAdmin);
      },
    },
    repositoryOwners: {
      type: 'Owner[]',
      resolve(root, args, {user, db}) {
        if (!user || user.waitingList) {
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
        if (!user || user.waitingList) {
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
        if (!user || user.waitingList) {
          throw new Error('Access Denied');
        }
        return db.getRepository(id, user.id);
      },
    },
    logs: {
      type: 'Log[]',
      resolve(root, args, {user, db}) {
        if (!user || !user.isAdmin) {
          throw new Error('Access Denied');
        }
        return db.log.find().sort({timestamp: -1});
      },
    },
    log: {
      type: 'Log',
      args: {id: 'string'},
      resolve(root, {id}, {user, db}) {
        if (!user || !user.isAdmin) {
          throw new Error('Access Denied');
        }
        return db.log.findOne({_id: new db.ObjectId(id)});
      },
    },
    users: {
      type: 'User[]',
      resolve(root, args, {user, db}) {
        if (!user || !user.isAdmin) {
          throw new Error('Access Denied');
        }
        return db.users.find().sort({signUpDate: -1});
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
