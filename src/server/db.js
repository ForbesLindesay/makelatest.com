import mongo from 'then-mongo';
import GitHubClient from 'github-basic';
import throat from 'throat';
import disabledProfile from './disabled-profile';

const DUPLICATE_KEY_ERROR_CODE = 11000;

if (!process.env.MONGO_CONNECTION) {
  console.error('You must add a connection string in the MONGO_CONNECTION environment variable');
  process.exit(1);
}
const db = mongo(
  process.env.MONGO_CONNECTION,
  [
    'owners',
    'repositories',
    'users',
    'repositoryProfiles',
    'ownerProfiles',
  ],
);
db.updateAdminStatus = (user, owner) => {
  const client = new GitHubClient({version: 3, auth: user.accessToken});

  return client.get('/orgs/:org/memberships/:username', {
    org: owner.login,
    username: user.username,
  }).then(({state, role}) => {
    const canAdmin = state === 'active' && role === 'admin';
    return db.owners.update(
      {
        id: owner.id,
        userID: user.id,
      },
      {
        $set: {canAdminLastUpdated: new Date(), canAdmin}
      },
    ).then(() => canAdmin);
  });
};
db.getDefaultProfile = (ownerID) => {
  return Promise.resolve(disabledProfile);
};
export default db;

export function updateRepos(user) {
  const ownerIDs = [];
  const repoIDs = [];
  const defaultProfiles = new Map();
  function getDefaultProfile(ownerID) {
    if (defaultProfiles.has(ownerID)) {
      return defaultProfiles.get(ownerID);
    }
    const result = db.getDefaultProfile(ownerID);
    defaultProfiles.set(ownerID, result);
    return result;
  }
  return db.users.update({_id: user.id}, {$set: {reposLastUpdateStart: new Date()}}).then(() => {
    return new Promise((resolve, reject) => {
      const client = new GitHubClient({version: 3, auth: user.accessToken});
      function onPage(page) {
        page.then(repos => {
          return Promise.all(repos.map(repo => {
            if (!repo.permissions.admin) {
              return;
            }
            if (!ownerIDs.includes(repo.owner.id)) {
              ownerIDs.push(repo.owner.id);
              const owner = {
                id: repo.owner.id,
                userID: user.id,
                login: repo.owner.login,
                avatarUrl: repo.owner.avatar_url,
                type: repo.owner.type,
              };
              return db.owners.update({id: owner.id, userID: user.id}, {$set: owner}, {upsert: true});
            }
          })).then(() => {
            return Promise.all(repos.map(throat(10, repo => {
              if (!repo.permissions.admin) {
                return;
              }
              repoIDs.push(repo.id);
              const repoToSave = {
                id: repo.id,
                userID: user.id,
                name: repo.name,
                fullName: repo.full_name,
                ownerID: repo.owner.id,
                fork: repo.fork,
                createdAt: repo.created_at,
                updatedAt: repo.updated_at,
                pushedAt: repo.pushed_at,
                defaultBranch: repo.default_branch,
                permissions: {
                  admin: repo.permissions.admin,
                  push: repo.permissions.push,
                  pull: repo.permissions.pull,
                },
              };
              return getDefaultProfile(repo.owner.id).then(defaultProfile => {
                return db.repositoryProfiles.insert({_id: repo.id, isCustom: false, profile: defaultProfile._id, userID: user.id}).catch(
                  err => {
                    if (err.code !== DUPLICATE_KEY_ERROR_CODE) {
                      throw err;
                    }
                  }
                ).then(
                  () => db.repositories.update({id: repo.id, userID: user.id}, {$set: repoToSave}, {upsert: true}),
                );
              });
            })));
          }).then(() => {
            if (repos.getNext) {
              console.log('on page');
              onPage(repos.getNext());
            } else {
              console.log('resolve');
              resolve();
            }
          });
        }).done(null, reject);
      }
      onPage(client.get('/user/repos', {affiliation: 'owner,organization_member'}));
    });
  }).then(() => {
    // TODO: remove any owners and repos not in ownerIDs and repoIDs
    return db.users.update({_id: user.id}, {$set: {reposLastUpdateEnd: new Date()}});
  });
}
