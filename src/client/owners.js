import {AutoSizer, List} from 'react-virtualized';
import View from './shared/view';
import Owner from './owner';
import RepositoryProfileEditor from './repository-profile-editor';
// N.B. react-virtualized requires react-addons-shallow-compare but does not list it as a dependency

const SideMenu = styled(View)`
  width: 200px;
  border-right: 1px solid gray;
`;
const linkStyle = {
  display: 'block',
  height: '100%',
  borderBottom: '1px solid gray',
  color: 'black',
  textDecoration: 'none',
};
const linkStyleActive = {
  background: 'palevioletred',
  color: 'white',
};
function Owners({repositoryOwners}) {
  function rowRenderer({key, index, columnIndex, isScrolling, isVisible, style}) {
    const owner = repositoryOwners[index];
    const url = owner.isSelf ? '/owners/me' : '/owners/' + owner.id;
    return (
      <div key={key} style={style}>
        <Link to={url} style={linkStyle} activeStyle={linkStyleActive}>
          <View flexDirection="row">
            <View>
              <img src={owner.avatarUrl} height="50px" width="50px"/>
            </View>
            <View flexGrow={1} justifyContent="space-around" style={{paddingLeft: '1em', paddingRight: '0.1em'}}>
              {owner.login}
            </View>
          </View>
        </Link>
      </div>
    );
  }
  return (
    <View flexGrow={1} flexDirection="row" style={{borderTop: '1px solid gray'}}>
      <SideMenu>
        <AutoSizer>
          {({width, height}) => (
            <List
              height={height}
              rowCount={repositoryOwners.length}
              rowHeight={51}
              rowRenderer={rowRenderer}
              width={width}
            />
          )}
        </AutoSizer>
      </SideMenu>
      <View flexGrow={1}>
        <Match pattern="/owners/:ownerID" exactly component={Owner} />
        <Match pattern="/owners/:ownerID/profiles" exactly component={Owner} />
        <Match pattern="/owners/:ownerID/repositories/:repositoryID" exactly component={RepositoryProfileEditor} />
      </View>
    </View>
  );
}
export default connect(() => bql`repositoryOwners { id, avatarUrl, login, isSelf }`)(Owners);
