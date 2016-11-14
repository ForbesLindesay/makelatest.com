import deepEqual from 'deep-equal';
import Button from './shared/button';
import View from './shared/view';
import Profile from './profile';

class RepositoryProfileEditor extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  };
  state = {profile: null, saving: false, error: false};
  _onChange = (profile) => {
    this.setState({profile});
  };
  _onSave = () => {
    let ready = Promise.resolve(null);
    if (this.state.profile && !deepEqual(this.props.repository.profile.settings, this.state.profile.settings)) {
      ready = this.props.onSaveSettings(this.props.repository.id, this.state.profile.settings);
    }
    this.setState({saving: true, error: false});
    ready.done(
      () => this.context.router.transitionTo('/owners/' + this.props.params.ownerID),
      () => this.setState({saving: false, error: true}),
    );
  };
  render() {
    const {repository, params: {ownerID}} = this.props;
    const heading = <h2>Customise Profile for {repository.name}</h2>;
    if (this.state.saving) {
      return (
        <View flexGrow={1}>
          {heading}
          <p>Saving...</p>
        </View>
      );
    }
    return (
      <View flexGrow={1}>
        {heading}
        {this.state.error ? <p>There was an error saving settings, please try again.</p> : null}
        <Profile profile={this.state.profile || repository.profile} onChange={this._onChange} />
        <View flexDirection="row">
          <Button onClick={this._onSave}>Save</Button>
          <Button to={'/owners/' + ownerID}>Cancel</Button>
        </View>
      </View>
    );
  }
}
export default connect(
  ({params: {ownerID, repositoryID}}) => bql`
    repository(id: ${+repositoryID}) {
      id
      name
      profile {
        settings
      }
    }
  `,
  client => ({
    onSaveSettings(repositoryID, settings) {
      return client.update('Repository.setCustomProfile', {repositoryID, settings});
    },
  }),
)(RepositoryProfileEditor);
