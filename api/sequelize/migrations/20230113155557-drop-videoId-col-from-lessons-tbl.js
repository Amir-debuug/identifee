'use strict';

const Migration = require('../Migration');

const table = 'lessons';
const column = '"videoId"';

module.exports = Migration.alterColumn('remove', table, column);
