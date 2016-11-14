import ms from 'ms';
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
function poll() {
  runAll().done(() => {
    setTimeout(poll, ms('2 hours'));
  });
}
// allow time for startup before running bots
setTimeout(poll, ms('5 seconds'));
