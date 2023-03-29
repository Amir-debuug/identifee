'use strict';

const Migration = require('../Migration');

const table = 'permissions';
const column = 'permissions';

module.exports = Migration.alterColumn('remove', table, column);
