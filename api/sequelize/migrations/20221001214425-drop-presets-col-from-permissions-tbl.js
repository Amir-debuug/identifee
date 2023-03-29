'use strict';

const Migration = require('../Migration');

const table = 'permissions';
const column = 'presets';

module.exports = Migration.alterColumn('remove', table, column);
