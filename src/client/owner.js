import Button from './shared/button';
import Checkbox from './shared/checkbox';
import View from './shared/view';
import Repositories from './repositories';

/*
function ViewProfilesButtonPresenter({ownerID, owner: {canAdmin}}) {
  return (
    <Button to={'/owners/' + ownerID + '/profiles'}>
      {
        canAdmin
        ? 'Edit Profiles'
        : 'View Profiles'
      }
    </Button>
  );
}
const ViewProfilesButton = connect(({ownerID}) => bql`
  owner (id: ${ownerID}) {
    canAdmin
  }
`)(ViewProfilesButtonPresenter);
*/
class Owner extends Component {
  state = {includeForks: false};
  _onToggleIncludeForks = includeForks => {
    this.setState({includeForks});
  };
  render() {
    const {params: {ownerID}} = this.props;
    const {includeForks} = this.state;
    return (
      <View flexGrow={1}>
        {/*<ViewProfilesButton ownerID={ownerID}/>*/}
        <Checkbox checked={includeForks} onChange={this._onToggleIncludeForks}>
          Include Forks
        </Checkbox>
        <View flexGrow={1}>
          <Repositories ownerID={ownerID} includeForks={includeForks}/>
        </View>
      </View>
    );
  }
}
export default Owner;
