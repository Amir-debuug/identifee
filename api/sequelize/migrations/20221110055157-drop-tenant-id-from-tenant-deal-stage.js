'use strict';

const Migration = require('../Migration');

const table = 'tenant_deal_stage';
const column = 'tenant_id';

module.exports = Migration.alterColumn('remove', table, column);
