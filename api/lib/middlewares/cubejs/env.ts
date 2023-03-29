exports.globalRefreshEvery = () => {
  return process.env.CUBEJS_GLOBAL_REFRESHKEY_EVERY || '1 minute';
};
exports.globalRefreshSql = (table: string, timestampCol: string) => {
  if (!timestampCol) {
    return `SELECT COUNT(*) FROM ${table}`;
  }

  return `SELECT MAX(${timestampCol}) FROM ${table}`;
};
