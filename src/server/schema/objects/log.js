export default {
  name: 'Log',
  id(log) {
    return log._id + '';
  },
  fields: {
    id: {
      type: 'string',
      resolve(log) {
        return log._id + '';
      },
    },
    type: 'string',
    botID: 'string',
    message: 'string',
    timestamp: {
      type: 'string',
      resolve(log, args, {user, db}) {
        return log.timestamp.toISOString();
      },
    },
    repository: {
      type: 'Repository',
      resolve(log, args, {user, db}) {
        return db.getRepository(log.repositoryID, log.userID);
      },
    },
    user: {
      type: 'User',
      resolve(log, args, {user, db}) {
        return db.users.findOne({_id: log.userID});
      },
    },
  },
};
