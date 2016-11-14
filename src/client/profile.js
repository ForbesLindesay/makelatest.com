import View from './shared/view';
import YarnSettings from './bots/yarn';
import ProfileSection from './profile-section';

class Profile extends Component {
  _onUpdate = (objectKey, propertyName, value) => {
    const newSettings = {
      ...this.props.profile.settings,
      [objectKey]: {
        ...this.props.profile.settings[objectKey],
        [propertyName]: value,
      },
    };
    this.props.onChange({...this.props.profile, settings: newSettings});
  };
  render() {
    const {profile} = this.props;
    return (
      <View>
        <ProfileSection component={YarnSettings} profile={profile.settings} onUpdate={this._onUpdate} />
      </View>
    );
  }
}
export default Profile;
