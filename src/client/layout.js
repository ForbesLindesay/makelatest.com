import getGitHubLoginUrl from 'moped-auth-github/client';
import Button from './shared/button';
import View from './shared/view';
import MarketingPage from './marketing-page';
import Owners from './owners';

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
function AuthenticatedLayout() {
  return (
    <View style={{height: '100%'}}>
      <View flexDirection="row" justifyContent="space-between" style={{height: 100}}>
        <View justifyContent="space-around">
          <h1>Make Latest</h1>
        </View>
        <View justifyContent="space-around">
          <Button onClick={logout}>Log Out</Button>
        </View>
      </View>
      <View flexGrow={1}>
        <Match exactly pattern="/" component={RedirectToMe} />
        <Owners />
      </View>

    </View>
  );
}

function AnonymousLayout() {
  return (
    <View style={{height: '100%'}}>
      <h1>Make Latest</h1>
      <Button href={getGitHubLoginUrl({returnURL: location.href, scope: ['user:email', 'public_repo', 'read:org']})}>
        Sign Up / Sign In
      </Button>
      <MarketingPage />
    </View>
  );
}

function Layout({isAuthenticated}) {
  return (
    isAuthenticated
    ? <AuthenticatedLayout />
    : <AnonymousLayout />
  );
}
export default connect(() => bql`isAuthenticated`, undefined, {renderLoading: true})(Layout);
