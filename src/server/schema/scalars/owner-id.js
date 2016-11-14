export default {
  name: 'OwnerID',
  validate(value) {
    if (value === 'me' || +value === (+value | 0)) {
      return;
    } else {
      throw new Error('Expected value to be "me" or a number');
    }
  }
};
