export default {
  name: 'User',
  fields: {
    id: 'string',
    displayName: 'string',
    username: 'string',
    profileUrl: 'string',
    avatarUrl: 'string',
    company: 'string',
    email: 'string',
    waitingList: 'boolean',
    isAdmin: 'boolean',
    signUpDate: {
      type: 'string',
      resolve(user) {
        return user.signUpDate.toISOString();
      },
    },
    lastLogIn: {
      type: 'string',
      resolve(user) {
        return user.signUpDate.toISOString();
      },
    },
    lastSeen: {
      type: 'string',
      resolve(user) {
        return user.signUpDate.toISOString();
      },
    },
  },
  mutations: {
    joinBeta: {
      args: {userID: 'string'},
      resolve({userID}, {user, db}) {
        if (!user || !user.isAdmin) {
          throw new Error('Access Denied');
        }
        return db.users.update({_id: userID}, {$set: {waitingList: false}});
      },
    },
  },
};
