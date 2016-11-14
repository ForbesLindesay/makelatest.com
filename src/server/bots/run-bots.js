import {tmpdir} from 'os';
import mkdir from 'mkdirp';
import rimraf from 'rimraf';
import GitHubClient from 'github-basic';
import Promise from 'promise';
import yarnBot from './yarn-bot';
import db from '../db';
import disabledProfile from '../disabled-profile';
import enabledProfile from '../enabled-profile';

const workingDirectory = tmpdir() + '/make-latest-working-directory';
console.dir(workingDirectory);
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
const makeLatesetClient = new GitHubClient({version: 3, auth: process.env.BOT_TOKEN});
async function runBots(repositoryProfile) {
  if (repositoryProfile.isCustom === false && repositoryProfile.profile === 'DISABLED') {
    return;
  }
  const repository = await db.repositories.findOne({id: repositoryProfile._id, userID: repositoryProfile.userID});
  console.log(repository.fullName);
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
  try {
    await rimrafAsync(wd);
    await mkdirAsync(wd);
    const options = {userClient, makeLatesetClient, workingDirectory: wd};
    // TODO: handle failure of any one bot
    await yarnBot(repository, user, settings.yarn, options);
    // cleanup between each bot:
    // await rimrafAsync(wd);
    // await mkdirAsync(wd);
  } finally {
    await rimrafAsync(wd);
  }
}
export default runBots;
