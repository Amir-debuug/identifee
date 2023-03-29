'use strict';

const Migration = require('../Migration');

const table = 'permissions';
const column = 'fields';

module.exports = Migration.alterColumn('remove', table, column);
