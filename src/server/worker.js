import ms from 'ms';
import autoMerge from './bots/auto-merge';
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
setTimeout(poll, ms('10 seconds'));

async function runAutoMerge() {
  console.log('running bots');
  const autoMerges = await db.autoMerge.find();
  console.log('got profiles');
  for (const autoMergeConfig of autoMerges) {
    await autoMerge(autoMergeConfig);
  }
}
function pollAutoMerge() {
  runAutoMerge().done(() => {
    setTimeout(pollAutoMerge, ms('30 minutes'));
  });
}
// allow time for startup before running bots
setTimeout(pollAutoMerge, ms('10 seconds'));
