import GitHubClient from 'github-basic';
import addCollaborator from './add-collaborator';
import makeLatestClient from './github-client';
import getPullRequests from './get-pull-requests';
import db from '../db';

function delay(time) {
  return new Promise((resolve, reject) => { setTimeout(delay, time); });
}
function getBetaClient(client) {
  const betaClient = new GitHubClient({version: 3});
  betaClient._authorization = client._authorization;
  betaClient._version = 'application/vnd.github.polaris-preview+json';
  return betaClient;
}
const betaMakeLatestClient = getBetaClient(makeLatestClient);

// process merge-when-passing records on a regular basis:

// If not completed:
//  - ignore

// If passing
//  - merge (unless there is more than one commit and no pull request, in which case submit a pull request and try again)

// If failing
//  - create a pull request if there isn't one already

/*
{
    "_id": "mopedjs/babel-plugin-import-globals/yarn/master",
    "owner": "mopedjs",
    "repo": "babel-plugin-import-globals",
    "sourceBranch": "yarn",
    "destinationBranch": "master",
    "userID": "1260646"
}
*/

async function autoMerge({_id, owner, repo, sourceBranch, destinationBranch, userID}) {
  const user = await db.users.findOne({_id: userID});
  const userClient = new GitHubClient({version: 3, auth: user.accessToken});
  await addCollaborator(owner, repo, userClient);
  const existingRequests = await getPullRequests(userClient, owner, repo, sourceBranch, destinationBranch);
  if (existingRequests.length === 1) {
    const [pr] = existingRequests;
    let statuses = await userClient.get(pr.statuses_url);

    // filter to the latest statatuses
    const statusesMap = {};
    for (const status of statuses) {
      if (!statusesMap[status.context] || status.created_at > statusesMap[status.context]) {
        statusesMap[status.context] = status.created_at;
      }
    }
    statuses = statuses.filter(
      status => status.created_at === statusesMap[status.context]
    );

    if (statuses.length && statuses.every(status => status.state === 'success')) {
      console.log('merging:');
      console.log(pr.title);
      console.dir(pr.html_url);
      await betaMakeLatestClient.put('/repos/:owner/:repo/pulls/:number/merge', {
        owner,
        repo,
        number: pr.number,
        commit_title: pr.title + ' (#' + pr.number + ')',
        commit_message: pr.body,
        sha: pr.head.sha,
        squash: true,
      });
      await makeLatestClient.delete('/repos/:owner/:repo/git/refs/:ref', {
        owner: pr.head.repo.owner.login,
        repo: pr.head.repo.name,
        ref: 'heads/' + pr.head.ref,
      });
      await delay(60000);
      await db.autoMerge.remove({_id});
    } else {
      console.log('not merging:');
      console.log(pr.title);
      console.dir(pr.html_url);
    }
  } else {
    // TODO: maybe directly merge?
  }
}
export default autoMerge;
