import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Organization', {
  sql: 'SELECT * FROM public.organizations',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('organizations', 'date_entered')}`,
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
      description: 'Count of - Organizations',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
    },
    name: {
      sql: 'name',
      type: 'string',
    },
    annualRevenue: {
      sql: 'annual_revenue',
      type: 'string',
    },
    rating: {
      sql: 'rating',
      type: 'string',
    },
    status: {
      sql: 'status',
      type: 'string',
    },
    naicsCode: {
      sql: 'naics_code',
      type: 'string',
    },
    totalRevenue: {
      sql: 'total_revenue',
      type: 'string',
    },
    employees: {
      sql: 'employees',
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
