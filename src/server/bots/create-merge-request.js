import addCollaborator from './add-collaborator';
import getPullRequests from './get-pull-requests';
import db from '../db';

export default async function createMergeRequest(
  repository,
  user,
  settings,
  {userClient, makeLatestClient},
  {
    sourceBranch,
    destinationBranch,
    title,
    body,
  },
)  {
  const {fullName} = repository;
  const [owner, repo] = fullName.split('/');
  await addCollaborator(owner, repo, userClient);

  const {createPullRequests, autoMerge} = settings;

  if (createPullRequests) {
    const existingRequests = await getPullRequests(userClient, owner, repo, sourceBranch, destinationBranch);
    if (!existingRequests.length) {
      const pullRequestOptions = {
        owner,
        repo,
        title,
        body,
        head: `${owner}:${sourceBranch}`,
        base: destinationBranch,
      };
      if (autoMerge) {
        pullRequestOptions.body += '\n\n' + 'This pull request will be automatically merged if the tests pass';
      }
      await makeLatestClient.post('/repos/:owner/:repo/pulls', pullRequestOptions);
    }
    if (autoMerge) {
      await addMergeWhenPassing(owner, repo, sourceBranch, destinationBranch, user);
    }
  } else {
    await addMergeWhenPassing(owner, repo, sourceBranch, destinationBranch, user);
  }
}
function addMergeWhenPassing(owner, repo, sourceBranch, destinationBranch, user) {
  const query = {
    _id: `${owner}/${repo}/${sourceBranch}/${destinationBranch}`,
  };
  const update = {
    owner,
    repo,
    sourceBranch,
    destinationBranch,
    userID: user.id,
  };
  return db.autoMerge.update(query, {$set: update}, {upsert: true})
}
// process merge-when-passing records on a regular basis:

// If not completed:
//  - ignore

// If passing
//  - merge (unless there is more than one commit and no pull request, in which case submit a pull request and try again)

// If failing
//  - create a pull request if there isn't one already
