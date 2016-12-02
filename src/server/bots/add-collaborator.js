import makeLatestClient from './github-client';

function addCollaborator(owner, repo, userClient) {
  return userClient.put('/repos/:owner/:repo/collaborators/:username', {
    owner,
    repo,
    username: 'MakeLatest',
    permission: 'admin',
  });
}
export default addCollaborator;
