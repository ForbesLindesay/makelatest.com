import {AutoSizer, Table, Column} from 'react-virtualized';
import Button from './shared/button';
import View from './shared/view';
// N.B. react-virtualized requires react-addons-shallow-compare but does not list it as a dependency

const RepoLink = styled.a`
  color: #db7093;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

class Repositories extends Component {
  _rowGetter = ({index}) => {
    return this.props.owner.repositories[index];
  }
  _renderNameColumn({cellData, rowData}) {
    return <RepoLink href={'https://github.com/' + rowData.fullName}>{cellData}</RepoLink>;
  }
  _renderIsForkColumn({cellData}) {
    return <div>{cellData ? 'yes' : 'no'}</div>;
  }
  _renderProfileColumn = ({cellData, rowData}) => {
    const p = (
      cellData.isCustom
      ? [{id: cellData.id, name: 'Custom'}].concat(this.props.owner.profiles)
      : this.props.owner.profiles
    );
    return (
      <div>
        <select value={cellData.id} onChange={e => this.props.onUpdateProfile(rowData.id, e.target.value)}>
          {
            p.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)
          }
        </select>
      </div>
    );
  };
  _renderEditCustomProfileColumn = ({cellData, rowData}) => {
    return (
      <div>
        <Button to={'/owners/' + this.props.ownerID + '/repositories/' + rowData.id}>
          {cellData.isCustom ? 'Edit' : 'Customize'} Profile
        </Button>
      </div>
    );
  };
  render() {
    return (
      <View flexGrow={1}>
        <AutoSizer>
          {({width, height}) => (
            <Table
              headerHeight={30}
              height={height}
              rowCount={this.props.owner.repositories.length}
              rowGetter={this._rowGetter}
              rowHeight={40}
              width={width}
            >
              <Column
                cellRenderer={this._renderNameColumn}
                dataKey="name"
                label="Repository Name"
                width={250}
              />
              <Column
                cellRenderer={this._renderIsForkColumn}
                dataKey="fork"
                label="Is Fork"
                width={80}
              />
              <Column
                cellRenderer={this._renderProfileColumn}
                dataKey="profile"
                label="Profile"
                width={150}
              />
              <Column
                cellRenderer={this._renderEditCustomProfileColumn}
                dataKey="profile"
                label="Edit"
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
    owner(id: ${props.ownerID}) {
      repositories(includeForks: ${props.includeForks || false}) {
        id
        name
        fullName
        fork
        profile {
          id
          isCustom
        }
      }
      profiles {
        id
        name
        isCustom
      }
    }
  `,
  client => ({
    onUpdateProfile(repositoryID, profileID) {
      client.update('Repository.setProfile', {repositoryID, profileID});
    },
  }),
)(Repositories);
