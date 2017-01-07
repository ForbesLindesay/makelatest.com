const {readFileSync, writeFileSync} = require('fs');
const request = require('then-request');
const {unpack} = require('tar-pack');

const currentYarnVersion = JSON.parse(readFileSync(__dirname + '/package.json', 'utf8')).yarnVersion;
let installedYarnVersion = 'NOTHING';
try {
  installedYarnVersion = JSON.parse(readFileSync(require.resolve('./yarn/package.json'), 'utf8')).version;
} catch (ex) {
  // ignore ex
}

request('get', 'https://yarnpkg.com/latest-version').getBody('utf8').then(latestYarnVersion => {
  if (latestYarnVersion !== currentYarnVersion) {
    console.warn('Latest yarn version is: ' + latestYarnVersion);
    console.warn('Current yarn version is: ' + currentYarnVersion);
  }
  if (installedYarnVersion === currentYarnVersion) {
    process.exit(0);
  }
  return currentYarnVersion;
}).then(version => {
  console.log('Downloading yarn@' + version);
  return request('get', `https://yarnpkg.com/downloads/${version}/yarn-v${version}.tar.gz`).getBody();
}).done(data => {
  console.log('Unpacking yarn');
  unpack(__dirname + '/yarn/', function (err) {
    if (err) throw err;
    else console.log('done');
  }).end(data);
});
