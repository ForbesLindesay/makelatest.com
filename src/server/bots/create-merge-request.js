export default function createMergeRequest(repository, user, settings, {userClient, makeLatesetClient}, {sourceBranch, destinationBranch})  {
  const {createPullRequests, autoMerge} = settings;
  // If `createPullRequests`:
  // 1. check for existing, open pull request
  // 2. If no existing request, create one
  // 3. If `autoMerge`, add a "merge-when-passing" record to the database pointing at the pull request

  // If `!createPullRequests`
  // 1. Add a "merge-when-passing" record to the database pointing at the two branches
}

// process merge-when-passing records on a regular basis:

// If not completed:
//  - ignore

// If passing
//  - merge (unless there is more than one commit and no pull request, in which case submit a pull request and try again)

// If failing
//  - create a pull request if there isn't one already
