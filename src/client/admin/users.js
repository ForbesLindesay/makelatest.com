import {AutoSizer, Table, Column} from 'react-virtualized';
import Button from '../shared/button';
import View from '../shared/view';
// N.B. react-virtualized requires react-addons-shallow-compare but does not list it as a dependency

class LogViewer extends Component {
  _rowGetter = ({index}) => {
    return this.props.users[index];
  }
  _renderColumn({cellData}) {
    return <div>{cellData}</div>;
  }
  _renderNameColumn({cellData, rowData}) {
    return <div><a href={rowData.profileUrl}>{cellData}</a></div>;
  }
  _renderEmailColumn({cellData}) {
    return <div><a href={'mailto:' + cellData}>{cellData}</a></div>;
  }
  _renderWaitingListColumn = ({cellData, rowData}) => {
    if (cellData === false) {
      return <div>On beta</div>;
    }
    return <Button onClick={() => this.props.onAddToBeta(rowData.id)}>Add to beta</Button>;
  }
  render() {
    return (
      <View flexGrow={1}>
        <AutoSizer>
          {({width, height}) => (
            <Table
              headerHeight={30}
              height={height}
              rowCount={this.props.users.length}
              rowGetter={this._rowGetter}
              rowHeight={40}
              width={width}
            >
              <Column
                cellRenderer={this._renderNameColumn}
                dataKey="displayName"
                label="Name"
                width={150}
              />
              <Column
                cellRenderer={this._renderColumn}
                dataKey="company"
                label="Company"
                width={100}
              />
              <Column
                cellRenderer={this._renderEmailColumn}
                dataKey="email"
                label="e-mail"
                width={200}
              />
              <Column
                cellRenderer={this._renderWaitingListColumn}
                dataKey="waitingList"
                label="Waiting list"
                width={200}
              />
              <Column
                cellRenderer={this._renderColumn}
                dataKey="signUpDate"
                label="Sign Up Date"
                width={200}
              />
              <Column
                cellRenderer={this._renderColumn}
                dataKey="lastLogIn"
                label="Last Log In"
                width={200}
              />
              <Column
                cellRenderer={this._renderColumn}
                dataKey="lastSeen"
                label="Last Seen"
                width={200}
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
    users {
      id
      displayName
      profileUrl
      company
      email
      waitingList
      isAdmin
      signUpDate
      lastLogIn
      lastSeen
    }
  `,
  client => ({
    onAddToBeta(userID) {
      return client.update('User.joinBeta', {userID});
    },
  }),
)(LogViewer);
