TODO:

# Yarn Bot

1. Auto-merge if CI passes

# Profiles support

1. Build a page for editing the owners profiles and saving/creating new ones
  1. Add read-only mode for built in profiles & users without permission to edit org profiles
1. Load these user created profiles in addition to "ENABLED" and "DISABLED" for the drop downs
1. Add option to change default profile for an org
1. Add a feature for bulk switching all repositories from one profile to another (allow selecting to include/exclude forks)

# bots

1. dependencies bot - automatically update dependencies to the latest version using `^`, `~` or exact versions
1. peer dependencies bot - automatically update peer dependencies that are written as a range to keep increasing the upper bound
1. node-version bot - update `.travis.yml`, `circle.yml` and `package.json`'s `engines` field.  Modes for latest, latest-stable or all supported.

# Payments

Support payment plans:

1. free tier for one public repo only with only weekly updates
1. low cost for public repos only (but including orgs you are a member of) (maybe $1/month)
1. mid cost for personal private repos only (maybe $7/month)
1. relatively high cost for private org repos (maybe $50/month/org)

To cover costs I need to be able to support at least 10 users per heroku hobby drone (assuming 90% of users are using it for public repos only and 10MB per user in mongodb storage).

# Long Term Plans

## Advanced bots

1. npm-release bot - automatically write a changelog in one of a few formats.  Update version using semver or breaking-semver.
1. community-managed-project bot - auto-merge pull requests once some criteria are met (e.g. support public veto?)

## Cool Features

1. Bulk edit for owner (premium feature)
  1. Rename all files that match `/foo/` to `'bar'`
  1. Replace everything that matches `/foo/` in files that match `/bar/` with `'baz'`
1. Code mod on all of GitHub or on  (pay per use as this is very resource intensive)
  1. Allow running some JavaScript to transform the files in a repository.  Require some search string to narrow down results and charge based on number of repos that match.
