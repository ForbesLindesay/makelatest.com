function expect(bool, msg) {
  if (!bool) {
    throw msg;
  }
}
function validateSchema(value, schema) {
  if (typeof schema === 'string') {
    if (typeof value !== schema) {
      throw new Error('Expected ' + schema + ' but got ' + (value === null ? 'null' : typeof value));
    }
    return;
  }
  if (typeof schema === 'object') {
    if (!value || typeof value !== 'object') {
      throw new Error('Expected object but got ' + (value === null ? 'null' : typeof value));
    }
    Object.keys(schema).forEach(key => {
      validateSchema(value[key], schema[key]);
    });
    Object.keys(value).forEach(key => {
      if (!(key in schema)) {
        throw new Error('Unexpected key ' + key);
      }
    })
    return;
  }
  throw new Error('Invalid schema');
}
const schema =  {
  yarn: {
    enabled: 'boolean',
    onlyIfYarnLockPresent: 'boolean',
    createPullRequests: 'boolean',
    autoMerge: 'boolean',
  }
};
export default {
  name: 'BotSettings',
  validate(value) {
    validateSchema(value, schema);
  }
};
