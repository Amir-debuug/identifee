import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Products', {
  sql: 'SELECT * FROM public.products',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('products', 'created_at')}`,
  },
  joins: {
    Tenant: {
      relationship: 'belongsTo',
      sql: `${CUBE.tenantId} = ${Tenant.id}`,
    },
  },
  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: [],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },
    count: {
      drillMembers: [],
      type: 'count',
      description: 'Count of - Products ',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
      shown: false,
    },
    code: {
      sql: 'code',
      type: 'string',
    },

    name: {
      sql: 'name',
      type: 'string',
    },

    createdTime: {
      sql: 'created_at',
      type: 'time',
    },

    updatedAt: {
      sql: 'updatedAt',
      type: 'time',
      title: 'modifiedTime',
    },
    tenantId: {
      shown: false,
      sql: 'tenant_id',
      type: 'string',
    },
  },
});
