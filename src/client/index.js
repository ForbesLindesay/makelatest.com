import './normalize.css';
import './style.css';
import 'react-virtualized/styles.css';
import request from 'then-request';
import getGitHubLoginUrl from 'moped-auth-github/client';
import BicycleProvider, {client, defineOptimisticUpdaters} from 'moped-bicycle/client';
import Layout from './layout';

defineOptimisticUpdaters({
  Repository: {
    setProfile({args: {repositoryID, profileID}}) {
      return {
        ['Repository:' + repositoryID]: {profile: 'Profile:' + profileID},
      };
    },
  },
});

setInterval(() => {
  client.update('Root.refresh', {});
}, 2000);

render(
  <BicycleProvider>
    <Layout />
  </BicycleProvider>
);
