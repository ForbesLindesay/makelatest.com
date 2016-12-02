export default function getPullRequests(userClient, owner, repo, sourceBranch, destinationBranch) {
  return userClient.get('/repos/:owner/:repo/pulls', {
    owner,
    repo,
    state: 'open',
    head: `${owner}:${sourceBranch}`,
    base: destinationBranch,
  });
}
