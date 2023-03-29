import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Activities', {
  sql: 'SELECT * FROM public.activities',
  title: 'Activity',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('activities', 'created_at')}`,
  },

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Deal: {
      relationship: 'belongsTo',
      sql: `${CUBE.dealId} = ${Deal.id}`,
    },
    Organization: {
      relationship: 'belongsTo',
      sql: `${CUBE.organizationId} = ${Organization.id}`,
    },
    Tenant: {
      relationship: 'belongsTo',
      sql: `${CUBE.tenantId} = ${Tenant.id}`,
    },
    User: {
      relationship: 'belongsTo',
      sql: `${CUBE.owner} = ${User.id}`,
    },
    Contact: {
      relationship: 'belongsTo',
      sql: `${CUBE.contactId} = ${Contact.id}`,
    },
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
      description: 'Count of - Activities ',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
      shown: false,
    },
    Owner: {
      sql: 'owner',
      type: 'string',
    },
    createdBy: {
      sql: 'created_by',
      type: 'string',
    },
    startDate: {
      sql: 'start_date',
      type: 'time',
      title: 'Start Time',
    },
    endDate: {
      sql: 'end_date',
      type: 'time',
      title: 'End Time',
    },
    name: {
      sql: 'name',
      type: 'string',
      title: 'Title',
    },

    type: {
      sql: 'type',
      type: 'string',
      title: 'Type',
    },
    done: {
      sql: `CASE WHEN ${CUBE}.done THEN 'completed' ELSE 'in progress' END`,
      type: 'string',
      title: 'Status',
    },
    createdAt: {
      sql: 'created_at',
      type: 'time',
      title: 'Created Time',
    },
    updatedAt: {
      sql: 'updated_at',
      type: 'time',
      title: 'Modified Time',
    },
    contactId: {
      sql: 'contact_id',
      type: 'string',
      shown: false
    },
    organizationId: {
      sql: 'organization_id',
      type: 'string',
      shown: false
    },
    dealId: {
      sql: 'deal_id',
      type: 'string',
      shown: false
    },
    tenantId: {
      shown: false,
      sql: 'tenant_id',
      type: 'string',
    },
  },
});
