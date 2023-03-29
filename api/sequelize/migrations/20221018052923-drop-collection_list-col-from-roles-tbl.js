'use strict';

const Migration = require('../Migration');

const table = 'roles';
const column = 'collection_list';

module.exports = Migration.alterColumn('remove', table, column);
