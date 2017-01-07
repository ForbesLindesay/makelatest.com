import mongo from 'then-mongo';
import GitHubClient from 'github-basic';
import throat from 'throat';
import createCache from 'lru-cache';
import disabledProfile from './disabled-profile';
import enabledProfile from './enabled-profile';

const DUPLICATE_KEY_ERROR_CODE = 11000;

if (!process.env.MONGO_CONNECTION) {
  console.error('You must add a connection string in the MONGO_CONNECTION environment variable');
  process.exit(1);
}
const cache = createCache({
  // assume most objects use approximately 1KB in memory and we want to allocate up to about 20MB to the cache
  max: 20000,
  length(entry, key) {
    return entry.length;
  },
});
const db = mongo(
  process.env.MONGO_CONNECTION,
  [
    'owners',
    'repositories',
    'users',
    'repositoryProfiles',
    'ownerProfiles',
    'log',
    'autoMerge',
  ],
);
function useCache(keyFunction, valueFunction) {
  return function (...args) {
    const key = keyFunction(...args);
    const entry = cache.get(key);
    if (entry) {
      return entry.value;
    }
    return Promise.resolve(valueFunction(...args)).then(value => {
      // assume individual items are 1KB and therefore arrays are length * 1KB
      const entry = {value: Promise.resolve(value), length: Array.isArray(value) ? value.length : 1};
      cache.set(key, entry);
      return value;
    });
  };
}

db.updateAdminStatus = (user, owner) => {
  const client = new GitHubClient({version: 3, auth: user.accessToken});

  return client.get('/orgs/:org/memberships/:username', {
    org: owner.login,
    username: user.username,
  }).then(({state, role}) => {
    const canAdmin = state === 'active' && role === 'admin';
    return db.updateOwner(
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

// owners
db.getOwners = useCache(
  userID => 'owners:' + userID,
  userID => {
    if (typeof userID !== 'string') {
      throw new TypeError('You must provide a valid userID');
    }
    return db.owners.find({userID}).then(owners => {
      return owners.sort((a, b) => {
        if (a.type === 'User' && b.type !== 'User') {
          return -1;
        }
        if (a.type !== 'User' && b.type === 'User') {
          return 1;
        }
        return a.login < b.login ? -1 : 1;
      })
    });
  },
);
db.getOwner = useCache(
  (id, userID) => 'owner:' + userID + ':' + id,
  (id, userID) => {
    if (typeof id !== 'number') {
      throw new TypeError('You must provide a valid id');
    }
    if (typeof userID !== 'string') {
      throw new TypeError('You must provide a valid userID');
    }
    return db.owners.findOne({id, userID});
  },
)
db.updateOwner = (query, ...args) => {
  if (typeof query.id !== 'number') {
    throw new TypeError('You must provide a valid id');
  }
  if (typeof query.userID !== 'string') {
    throw new TypeError('You must provide a valid userID');
  }
  return db.owners.update(query, ...args).then(() => {
    cache.del('owners:' + query.userID);
    cache.del('owner:' + query.userID + ':' + query.id);
  });
};
db.removeOwner = (owner) => {
  if (typeof owner.id !== 'number') {
    throw new TypeError('You must provide a valid id');
  }
  if (typeof owner.userID !== 'string') {
    throw new TypeError('You must provide a valid userID');
  }
  return db.owners.remove({id: owner.id, userID: owner.userID}).then(() => {
    cache.del('owners:' + owner.userID);
    cache.del('owner:' + owner.userID + ':' + owner.id);
  });
};

// repositories
db.getRepository = useCache(
  (id, userID) => 'repository:' + userID + ':' + id,
  (id, userID) => {
    if (typeof id !== 'number') {
      throw new TypeError('You must provide a valid id');
    }
    if (typeof userID !== 'string') {
      throw new TypeError('You must provide a valid userID');
    }
    return db.repositories.findOne({id, userID});
  },
);
db.getRepositories = useCache(
  ({ownerID, userID, includeForks}) => 'repositories:' + userID + ':' + ownerID + ':' + (includeForks ? '1' : '0'),
  ({ownerID, userID, includeForks}) => {
    const query = {userID, ownerID};
    if (!includeForks) {
      query.fork = false;
    }
    return db.repositories.find(query).then(repositories => {
      return repositories.sort((a, b) => {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      })
    });
  },
)
db.updateRepository = (query, update) => {
  if (typeof query.id !== 'number') {
    throw new TypeError('You must provide a valid id');
  }
  if (typeof query.userID !== 'string') {
    throw new TypeError('You must provide a valid userID');
  }
  if (typeof update.ownerID !== 'number') {
    throw new TypeError('You must provide a valid ownerID');
  }
  db.repositories.update(query, {$set: update}, {upsert: true}).then(() => {
    cache.del('repositories:' + query.userID + ':' + update.ownerID + ':1');
    cache.del('repositories:' + query.userID + ':' + update.ownerID + ':0');
    cache.del('repository:' + query.userID + ':' + query.id);
  });
};
db.removeRepository = (repo) => {
  if (typeof repo.id !== 'number') {
    throw new TypeError('You must provide a valid id');
  }
  if (typeof repo.userID !== 'string') {
    throw new TypeError('You must provide a valid userID');
  }
  if (typeof repo.ownerID !== 'number') {
    throw new TypeError('You must provide a valid ownerID');
  }
  db.repositories.remove({
    id: repo.id,
    userID: repo.userID,
    ownerID: repo.ownerID,
  }).then(() => {
    cache.del('repositories:' + repo.userID + ':' + repo.ownerID + ':1');
    cache.del('repositories:' + repo.userID + ':' + repo.ownerID + ':0');
    cache.del('repository:' + repo.userID + ':' + repo.id);
  });
};

// repository profile
db.getRepositoryProfile = useCache(
  (repositoryID) => 'repository-profile:' + repositoryID,
  (repositoryID) => {
    // note that these aren **not** keyed with a userID becuase any member of the org can see the same profiles
    return db.repositoryProfiles.findOne({_id: repositoryID}).then(profile => {
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
  }
);
db.updateRepositoryProfile = (repositoryID, details) => {
  return db.repositoryProfiles.update(
    {_id: repositoryID},
    {$set: details},
    {upsert: true},
  ).then(() => {
    cache.del('repository-profile:' + repositoryID);
  });
};

export default db;

function retry(getResult) {
  return new Promise((resolve, reject) => {
    let attemptCount = 0;
    function attempt() {
      Promise.resolve(getResult()).done(resolve, err => {
        if (attemptCount > 5) {
          reject(err);
        } else {
          attempt();
        }
      });
    }
    attempt();
  });
}
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
              return db.updateOwner({id: owner.id, userID: user.id}, {$set: owner}, {upsert: true});
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
                  () => db.updateRepository({id: repo.id, userID: user.id}, repoToSave),
                );
              });
            })));
          }).then(() => {
            if (repos.getNext) {
              console.log('on page');
              onPage(retry(() => repos.getNext()));
            } else {
              console.log('resolve');
              resolve();
            }
          });
        }).done(null, reject);
      }
      onPage(retry(() => client.get('/user/repos', {affiliation: 'owner,organization_member'})));
    });
  }).then(() => {
    // TODO: remove any owners and repos not in ownerIDs and repoIDs
    return db.repositories.find({userID: user.id});
  }).then(repositories => {
    Promise.all([
      repositories.filter(repo => {
        return !repoIDs.includes(repo.id);
      }).map(repo => {
        return db.removeRepository(repo);
      })
    ]);
  }).then(() => {
    return db.owners.find({userID: user.id});
  }).then(owners => {
    Promise.all([
      owners.filter(owner => {
        return !ownerIDs.includes(owner.id);
      }).map(owner => {
        return db.removeOwner(owner);
      })
    ]);
  }).then(() => {
    console.log('user repos updated');
    return db.users.update({_id: user.id}, {$set: {reposLastUpdateEnd: new Date()}});
  });
}
