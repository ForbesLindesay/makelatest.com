import assert from 'assert';
import Promise from 'promise';

export async function createCommit(client, {owner, repo, branch, updates, message}) {
  const shaBaseCommit = (
    await client.get('/repos/:owner/:repo/git/refs/:ref', {owner, repo, ref: 'heads/' + branch})
  ).object.sha;
  const updatesPromise = Promise.all(
    updates.map(file => {
      // {path: string, content: string|Buffer}
      assert(typeof file.path === 'string', '`file.path` must be a string');
      assert(typeof file.content === 'string' || Buffer.isBuffer(file.content), '`file.content` must be a string or a Buffer');
      var path = file.path.replace(/\\/g, '/').replace(/^\//, '')
      var mode = file.mode || '100644'
      var type = file.type || 'blob'
      return client.post('/repos/:owner/:repo/git/blobs', {
        owner,
        repo,
        content: typeof file.content === 'string' ? file.content : file.content.toString('base64'),
        encoding: typeof file.content === 'string' ? 'utf-8' : 'base64'
      }).then(
        res => ({
          path,
          mode,
          type,
          sha: res.sha,
        }),
      );
    }),
  );
  const shaBaseTree = (
    await client.get('/repos/:owner/:repo/git/commits/:sha', {owner, repo, sha: shaBaseCommit})
  ).tree.sha;
  const tree = await updatesPromise;
  const shaNewTree = (
    await client.post('/repos/:owner/:repo/git/trees', {owner, repo, tree, base_tree: shaBaseTree})
  ).sha;
  // return shaNewCommit
  return (
    await client.post('/repos/:owner/:repo/git/commits', {
      owner,
      repo,
      message,
      author: {name: '@MakeLatest', email: 'contact@makelatest.com', date: (new Date()).toISOString()},
      tree: shaNewTree,
      parents: [shaBaseCommit],
    })
  ).sha;
}
export function pushCommit(client, {owner, repo, branch, shaNewCommit, force}) {
  return client.patch('/repos/:owner/:repo/git/refs/:ref', {
    owner,
    repo,
    ref: 'heads/' + branch,
    sha: shaNewCommit,
    force: force || false
  });
}
export async function createBranch(client, {owner, repo, branch, baseBranch, commitSha}) {
  if (!commitSha) {
    commitSha = (
      await client.get('/repos/:owner/:repo/git/refs/:ref', {owner, repo, ref: 'heads/' + baseBranch})
    ).object.sha;
  }
  await client.post('/repos/:owner/:repo/git/refs', {
    owner,
    repo,
    ref: 'refs/heads/' + branch,
    sha: commitSha,
  });
}

// be a bit conservative
const ONE_MEGABYTE = 1000 * 1000;
export async function readGitFile(client, {owner, repo, branch, path}) {
  try {
    const fileObject = await client.get('/repos/:owner/:repo/contents/:path', {
      owner,
      repo,
      path,
      ref: 'heads/' + branch,
    });
    if (
      fileObject.type !== 'file' ||
      fileObject.size >= ONE_MEGABYTE ||
      typeof fileObject.content !== 'string' ||
      typeof fileObject.encoding !== 'string'
    ) {
      throw new Error('Failed to fetch yarn.lock');
    }
    return new Buffer(fileObject.content, fileObject.encoding).toString();
  } catch (ex) {
    if (ex.statusCode !== 404) {
      throw new Error('Failed to fetch ' + path + ': ' + ex.message);
    }
    return null;
  }
}

export async function exactlyOneAhead(client, {owner, repo, branch, baseBranch}) {
  const shaBaseCommit = (
    await client.get('/repos/:owner/:repo/git/refs/:ref', {owner, repo, ref: 'heads/' + baseBranch})
  ).object.sha;
  const shaBranchCommit = (
    await client.get('/repos/:owner/:repo/git/refs/:ref', {owner, repo, ref: 'heads/' + branch})
  ).object.sha;
  const branchCommit = (
    await client.get('/repos/:owner/:repo/git/commits/:sha', {owner, repo, sha: shaBranchCommit})
  );
  return branchCommit.parents.every(parent => parentsha === shaBaseCommit);
}
