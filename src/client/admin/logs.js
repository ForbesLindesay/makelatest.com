import {AutoSizer, Table, Column} from 'react-virtualized';
import View from '../shared/view';
// N.B. react-virtualized requires react-addons-shallow-compare but does not list it as a dependency

class LogViewer extends Component {
  _rowGetter = ({index}) => {
    return this.props.logs[index];
  }
  _renderColumn({cellData}) {
    return <div>{cellData}</div>;
  }
  _renderUserColumn({cellData}) {
    return <div><a href={cellData.profileUrl}>{cellData.displayName}</a></div>;
  }
  _renderRepositoryColumn({cellData}) {
    return <div><a href={'https://github.com/' + cellData.fullName}>{cellData.fullName}</a></div>;
  }
  _renderMessageColumn({cellData, rowData}) {
    const sp = cellData.split('\n');
    if (sp.length > 1) {
      return <div><Link to={'/admin/logs/' + rowData.id}>{sp[0]}</Link></div>;
    }
    return <div>{sp[0]}</div>;
  }
  render() {
    return (
      <View flexGrow={1}>
        <AutoSizer>
          {({width, height}) => (
            <Table
              headerHeight={30}
              height={height}
              rowCount={this.props.logs.length}
              rowGetter={this._rowGetter}
              rowHeight={20}
              width={width}
            >
              <Column
                cellRenderer={this._renderColumn}
                dataKey="timestamp"
                label="Timestamp"
                width={200}
              />
              <Column
                cellRenderer={this._renderColumn}
                dataKey="type"
                label="Type"
                width={50}
              />
              <Column
                cellRenderer={this._renderUserColumn}
                dataKey="user"
                label="User"
                width={150}
              />
              <Column
                cellRenderer={this._renderRepositoryColumn}
                dataKey="repository"
                label="Repository"
                width={300}
              />
              <Column
                cellRenderer={this._renderColumn}
                dataKey="botID"
                label="Bot"
                width={50}
              />
              <Column
                cellRenderer={this._renderColumn}
                dataKey="message"
                label="Message"
                width={300}
                flexGrow={1}
              />
            </Table>
          )}
        </AutoSizer>
      </View>
    );
  }
}
export default connect(
  props => bql`
    logs {
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
