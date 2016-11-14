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
    repositoryOwners: {
      type: 'Owner[]',
      resolve(root, args, {user, db}) {
        if (!user) {
          throw new Error('Access Denied');
        }
        return db.owners.find({userID: user.id}).then(owners => {
          return owners.sort((a, b) => {
            if (a.type === 'User' && b.type !== 'User') {
              return -1;
            }
            if (a.type !== 'User' && b.type === 'User') {
              return 1;
            }
            return a.login < b.login ? -1 : 1;
          })
        })
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
        return db.owners.findOne({id: id === 'me' ? +user.id : +id, userID: user.id});
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
        return db.repositories.findOne({userID: user.id, id});
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
