import {AutoSizer, Table, Column} from 'react-virtualized';
import View from '../shared/view';
// N.B. react-virtualized requires react-addons-shallow-compare but does not list it as a dependency

class LogViewer extends Component {
  render() {
    const {log} = this.props;
    return (
      <View flexGrow={1}>
        <dl>
          <dt>Timestamp</dt>
          <dd>{log.timestamp}</dd>
          <dt>Type</dt>
          <dd>{log.type}</dd>
          <dt>Repository</dt>
          <dd><a href={'https://github.com/' + log.repository.fullName}>{log.repository.fullName}</a></dd>
          <dt>User</dt>
          <dd><a href={log.user.profileUrl}>{log.user.displayName}</a></dd>
          <dt>Bot</dt>
          <dd>{log.botID}</dd>
          <dt>Message</dt>
          <dd><pre><code>{log.message}</code></pre></dd>
        </dl>
      </View>
    );
  }
}
export default connect(
  props => bql`
    log(id: ${props.params.id}) {
      id
      type
      user { displayName, profileUrl }
      repository { fullName }
      botID
      message
      timestamp
    }
  `,
)(LogViewer);
