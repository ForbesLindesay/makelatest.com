import createServer from 'moped-runtime/server';
import githubAuth from 'moped-auth-github/server';
import createBicycleMiddleware from 'moped-bicycle/server';
import GitHubClient from 'github-basic';
import ms from 'ms';
import db, {updateRepos} from './db';
import './worker';

import yarnBot from './bots/yarn-bot';

Promise = require('promise');

const app = createServer({
  serializeUser(user) {
    return user._id;
  },
  deserializeUser(id) {
    return db.users.findOne({_id: id}).then(user => {
      if (user) {
        const now = Date.now();
        // auto update repositories in the background every two hours if logged in
        if (
          (!user.reposLastUpdateEnd || user.reposLastUpdateEnd.getTime() < now - ms('2 hour')) &&
          (!user.reposLastUpdateStart || user.reposLastUpdateStart < now - ms('30 minutes'))
        ) {
          updateRepos(user).done();
        }
        return db.users.update(
          {_id: user._id},
          {$set: {lastSeen: new Date()}},
        ).then(() => user);
      }
      return user;
    })
  }
});

app.use(githubAuth((accessToken, refreshToken, profile) => {
  const client = new GitHubClient({version: 3, auth: accessToken});
  return client.get('/user/emails').then(emails => {
    const user = {
      _id: profile.id,
      id: profile.id,
      accessToken,
      refreshToken,
      displayName: profile.displayName,
      username: profile.username,
      profileUrl: profile.profileUrl,
      avatarUrl: profile._json.avatar_url,
      company: profile._json.company,
      lastLogIn: new Date(),
    };
    emails.forEach(({email, primary}) => {
      if (primary) {
        user.email = email;
      }
    })
    return db.users.update(
      {_id: profile.id},
      {$set: user, $setOnInsert: {waitingList: true, signUpDate: new Date()}},
      {upsert: true},
    ).then(() => user);
  });
}));
app.use(createBicycleMiddleware());

export default app;
