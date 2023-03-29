'use strict';

const Migration = require('../Migration');

const table = 'users';
const column = 'description';

module.exports = Migration.alterColumn('remove', table, column);
