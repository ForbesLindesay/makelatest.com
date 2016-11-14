import db from './db';

export default function (req) {
  return {user: req.user, db};
}
