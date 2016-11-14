import getGitHubLoginUrl from 'moped-auth-github/client';
import Button from './shared/button';
import View from './shared/view';
import MarketingPage from './marketing-page';
import Owners from './owners';
import Admin from './admin';

class RedirectToMe extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };
  componentDidMount() {
    this.context.router.replaceWith('/owners/me');
  }
  render() {
    return <div />;
  }
}
function AuthenticatedLayout({isAdmin}) {
  return (
    <View style={{height: '100%'}}>
      <View flexDirection="row" justifyContent="space-between" style={{height: 100}}>
        <View justifyContent="space-around">
          <h1>Make Latest</h1>
        </View>
        <View flexDirection="row">
          <View justifyContent="space-around">
            <Button to="/admin">Admin</Button>
          </View>
          <View justifyContent="space-around">
            <Button onClick={logout}>Log Out</Button>
          </View>
        </View>
      </View>
      <View flexGrow={1}>
        <Match exactly pattern="/" component={RedirectToMe} />
        <Match pattern="/owners" component={Owners} />
        <Match pattern="/admin" component={Admin} />
      </View>

    </View>
  );
}

function AnonymousLayout({isWaitingList}) {
  return (
    <View style={{height: '100%'}}>
      <h1>Make Latest</h1>
      {
        isWaitingList
        ? (
          <p>
            You have been added to the waiting list.  makelatest.com is still in private beta at the moment, but
            thank you for your interest.
          </p>
        )
        : (
          <Button
            href={getGitHubLoginUrl({returnURL: location.href, scope: ['user:email', 'public_repo', 'read:org']})}
          >
            Sign Up / Sign In
          </Button>
        )
      }
      <MarketingPage />
    </View>
  );
}

function Layout({isAuthenticated, isWaitingList, isAdmin}) {
  return (
    isAuthenticated && (!isWaitingList || isAdmin)
    ? <AuthenticatedLayout isAdmin={isAdmin} />
    : <AnonymousLayout isWaitingList={isWaitingList} />
  );
}
export default connect(() => bql`
  isAuthenticated
  isWaitingList
  isAdmin
`, undefined, {renderLoading: true})(Layout);
