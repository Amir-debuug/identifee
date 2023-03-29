'use strict';

const Migration = require('../Migration');

const table = 'users';
const column = 'tags';

module.exports = Migration.alterColumn('remove', table, column);
