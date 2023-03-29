'use strict';

const Migration = require('../Migration');

const table = 'permissions';
const column = 'limit';

module.exports = Migration.alterColumn('remove', table, column);
