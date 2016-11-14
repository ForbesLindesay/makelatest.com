import Button from '../shared/button';
import View from '../shared/view';
import Logs from './logs';
import Log from './log';
import Users from './users';

function Admin() {
  return (
    <View flexGrow={1}>
      <View flexDirection="row">
        <Button to="/admin/logs">Logs</Button>
        <Button to="/admin/users">Users</Button>
      </View>
      <Match pattern="logs" exactly component={Logs} />
      <Match pattern="logs/:id" exactly component={Log} />
      <Match pattern="users" exactly component={Users} />
    </View>
  );
}
export default Admin;
