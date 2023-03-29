import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Notes', {
  sql: 'SELECT * FROM public.note',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('note', 'created_at')}`,
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
    Contact: {
      relationship: 'belongsTo',
      sql: `${CUBE.contactId} = ${Contact.id}`,
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
      sql: `${CUBE.createdBy} = ${User.id}`,
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
      description: 'Count of - Notes ',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
      shown: false,
    },
    noteOwner: {
      sql: 'assigned_user_id',
      type: 'string',
    },

    createdBy: {
      sql: 'created_by',
      type: 'string',
    },
    contactId: {
      shown: false,
      sql: 'contact_id',
      type: 'string',
    },
    organizationId: {
      shown: false,
      sql: 'organization_id',
      type: 'string',
    },
    dealId: {
      shown: false,
      sql: 'deal_id',
      type: 'string',
    },

    noteTitle: {
      sql: 'name',
      type: 'string',
    },

    noteContent: {
      sql: 'note',
      type: 'string',
    },

    createdTime: {
      sql: 'created_at',
      type: 'time',
    },

    modifiedTime: {
      sql: 'updatedAt',
      type: 'time',
    },
    tenantId: {
      shown: false,
      sql: 'tenant_id',
      type: 'string',
    },
  },
});
