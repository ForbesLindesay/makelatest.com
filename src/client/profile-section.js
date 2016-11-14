class ProfileSection extends Component {
  _updaters = {};
  _getUpdaterCached = (name) => {
    return this._updaters[name] || (this._updaters[name] = this._getUpdater(name));
  };
  _getUpdater = (name) => {
    return value => {
      this.props.onUpdate(this.props.component.key, name, value);
    };
  };
  render() {
    const {component: Component, profile} = this.props;
    return <Component settings={profile[Component.key]} getUpdater={this._getUpdater} />;
  }
}
export default ProfileSection;
