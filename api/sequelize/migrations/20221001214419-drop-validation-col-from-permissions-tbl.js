'use strict';

const Migration = require('../Migration');

const table = 'permissions';
const column = 'validation';

module.exports = Migration.alterColumn('remove', table, column);
