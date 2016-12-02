import GitHubClient from 'github-basic';

export default new GitHubClient({version: 3, auth: process.env.BOT_TOKEN});
