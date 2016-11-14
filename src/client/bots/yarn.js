import Checkbox from '../shared/checkbox';
import View from '../shared/view';

function YarnSettings({settings: {enabled, onlyIfYarnLockPresent, createPullRequests, autoMerge}, getUpdater}) {
  return (
    <View>
      <h3>Yarn Bot Settings</h3>
      <p>
        Yarn bot continually updates your yarn.lock file.
      </p>
      <Checkbox checked={enabled} onChange={getUpdater('enabled')}>
        Enabled
      </Checkbox>
      <Checkbox
        disabled={!enabled}
        checked={enabled && onlyIfYarnLockPresent}
        onChange={getUpdater('onlyIfYarnLockPresent')}
      >
        Only enabled if yarn.lock is present
      </Checkbox>
      <Checkbox
        disabled={!enabled}
        checked={enabled && createPullRequests}
        onChange={getUpdater('createPullRequests')}
      >
        Create pull requests, rather than adding changes directly to the master branch.  Pull requests are always
        created if continuous integration (e.g. travis) would fail for the update.
      </Checkbox>
      <Checkbox
        disabled={!(enabled && createPullRequests)}
        checked={enabled && (!createPullRequests || autoMerge)}
        onChange={getUpdater('autoMerge')}
      >
        Automatically merge pull requests if they do not have any errors.
      </Checkbox>
    </View>
  );
}

YarnSettings.key = 'yarn';

export default YarnSettings;
