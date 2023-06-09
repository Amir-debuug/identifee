import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Category', {
  sql: 'SELECT * FROM public.categories',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('categories', 'created_at')}`,
  },

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Lesson: {
      relationship: 'belongsTo',
      sql: `${CUBE.id} = ${Lesson.categoryId}`,
    },
    Tenant: {
      relationship: 'belongsTo',
      sql: `${CUBE.tenantId} = ${Tenant.id}`,
    },
  },

  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: ['Lesson'],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },

    count: {
      type: 'count',
      drillMembers: [],
    },
  },

  dimensions: {
    title: {
      sql: 'title',
      type: 'string',
    },

    id: {
      sql: 'id',
      type: 'number',
      primaryKey: true,
    },

    description: {
      sql: 'description',
      type: 'string',
    },

    createdAt: {
      sql: 'created_at',
      type: 'time',
    },

    updatedAt: {
      sql: 'updated_at',
      type: 'time',
    },

    tenantId: {
      shown: false,
      sql: 'tenant_id',
      type: 'string',
    },
  },
});
