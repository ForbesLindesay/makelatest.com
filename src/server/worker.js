import runBots from './bots/run-bots';
import db from './db';

async function runAll() {
  console.log('running bots');
  const repositoryProfiles = await db.repositoryProfiles.find();
  console.log('got profiles');
  for (const profile of repositoryProfiles) {
    await runBots(profile);
  }
}
setTimeout(() => {
  runAll().done(profiles => {
    console.log('all bots ran');
  });
}, 2000);
