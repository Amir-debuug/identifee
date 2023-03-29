import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Contact', {
  sql: 'SELECT * FROM public.contacts',
  title: 'People',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('contacts', 'date_entered')}`,
  },

  joins: {
    Tenant: {
      relationship: 'belongsTo',
      sql: `${CUBE.tenantId} = ${Tenant.id}`,
    },
  },

  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: ['Deal', 'Notes', 'Activities'],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },

    count: {
      drillMembers: [],
      type: 'count',
      description: 'Count of - Contact',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
    },
    frist_name: {
      sql: `frist_name`,
      type: 'string',
    },
    last_name: {
      sql: `last_name`,
      type: 'string',
    },
    name: {
      sql: `CONCAT(${CUBE.frist_name}, ' ', ${CUBE.last_name})`,
      type: 'string',
    },
    status: {
      sql: 'status',
      type: 'string',
    },
    tenantId: {
      shown: false,
      sql: 'tenant_id',
      type: 'string',
    },
    dateEntered: {
      sql: 'date_entered',
      type: 'time',
    },
    dateModified: {
      sql: 'date_modified',
      type: 'time',
    },
  },
});
