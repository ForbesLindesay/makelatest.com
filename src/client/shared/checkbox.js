class Checkbox extends Component {
  _onChange = e => {
    this.props.onChange(e.target.checked);
  };
  render() {
    return (
      <label style={{opacity: this.props.disabled ? 0.5 : 1}}>
        <input type="checkbox" disabled={this.props.disabled} checked={this.props.checked} onChange={this._onChange}/>
        {this.props.children}
      </label>
    );
  }
}
export default Checkbox;
