import {tmpdir} from 'os';
import mkdir from 'mkdirp';
import rimraf from 'rimraf';
import GitHubClient from 'github-basic';
import Promise from 'promise';
import makeLatestClient from './github-client';
import yarnBot from './yarn-bot';
import db from '../db';
import disabledProfile from '../disabled-profile';
import enabledProfile from '../enabled-profile';

const workingDirectory = tmpdir() + '/make-latest-working-directory';
rimraf.sync(workingDirectory);
mkdir.sync(workingDirectory);
let nextIndex = 0;
const mkdirAsync = Promise.denodeify(mkdir);
const rimrafAsync = Promise.denodeify(rimraf);

function getProfileById(id) {
  if (id === 'ENABLED') {
    return enabledProfile;
  } else if (id === 'DISABLED') {
    return disabledProfile;
  } else {
    return db.ownerProfiles.findOne({_id: id});
  }
}

function log(obj) {
  if (process.env.NODE_ENV !== 'production') {
    console.dir(obj);
    console.error(obj.message);
    return;
  }
  return db.log.insert(obj);
}
async function runBots(repositoryProfile) {
  if (repositoryProfile.isCustom === false && repositoryProfile.profile === 'DISABLED') {
    return;
  }
  const repository = await db.getRepository(repositoryProfile._id, repositoryProfile.userID);
  const user = await db.users.findOne({_id: repositoryProfile.userID});
  const settings = (
    repositoryProfile.isCustom
    ? repositoryProfile.settings
    : (await getProfileById(repositoryProfile.profile)).settings
  );
  const userClient = new GitHubClient({version: 3, auth: user.accessToken});
  const wd = workingDirectory + '/' + repository.name + '-' + (nextIndex++);
  if (nextIndex > 100000000) {
    // don't let nextIndex get anywhere near max int since we cleanup afterwards anyway
    nextIndex = 0;
  }
  const options = {userClient, makeLatestClient, workingDirectory: wd};
  async function runBot(botID, fn) {
    await rimrafAsync(wd);
    await mkdirAsync(wd);
    try {
      await yarnBot(repository, user, settings[botID], options);
      await log({
        type: 'log',
        userID: repositoryProfile.userID,
        repositoryID: repositoryProfile._id,
        botID,
        message: 'Bot run completed',
        timestamp: new Date(),
      });
    } catch (ex) {
      const message = (ex.stack || ex.message || ex) + '';
      await log({
        type: 'error',
        userID: repositoryProfile.userID,
        repositoryID: repositoryProfile._id,
        botID,
        message,
        timestamp: new Date(),
      });
    }
  }
  try {
    console.log('running yarn');
    await runBot('yarn', yarnBot);
  } finally {
    await rimrafAsync(wd);
  }
}
export default runBots;
