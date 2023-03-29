'use strict';

const Migration = require('../Migration');

const table = 'users';
const column = 'location';

module.exports = Migration.alterColumn('remove', table, column);
