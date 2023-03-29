import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Deal', {
  sql: 'SELECT * FROM public.deals',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('deals', 'date_entered')}`,
  },

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    AssignedUser: {
      relationship: 'belongsTo',
      sql: `${CUBE.assignedUserId} = ${AssignedUser.id}`,
    },
    CreatedBy: {
      relationship: 'belongsTo',
      sql: `${CUBE.createdBy} = ${CreatedBy.id}`,
    },
    Tenant: {
      relationship: 'belongsTo',
      sql: `${CUBE.tenantId} = ${Tenant.id}`,
    },
    TenantDealStage: {
      relationship: 'belongsTo',
      sql: `${CUBE.tenantDealStageId} = ${TenantDealStage.id}`,
    },
    Contact: {
      relationship: 'belongsTo',
      sql: `${CUBE.contactPersonId} = ${Contact.id}`,
    },
    Organization: {
      relationship: 'belongsTo',
      sql: `${CUBE.contactOrganizationId} = ${Organization.id}`,
    },
  },

  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: ['Notes', 'Activities'],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },

    count: {
      drillMembers: [],
      type: 'count',
      description: 'Count of - Deal',
    },
    countOfWon: {
      sql: `CASE WHEN ${CUBE}.status = 'won' THEN 1 END`,
      type: 'count',
      description: 'Count of Won - Deal',
      shown: false,
    },
    countOfLost: {
      sql: `CASE WHEN ${CUBE}.status = 'lost' THEN 1 END`,
      type: 'count',
      description: 'Count of Lost - Deal',
      shown: false,
    },
    sumOfPendingRevenue: {
      format: 'currency',
      sql: `CASE WHEN ${CUBE}.status IS DISTINCT FROM 'won' THEN ${CUBE}.amount ELSE 0 END`,
      type: 'sum',
      description: 'Sum of Pending Revenue (Not Won) - Deal',
      shown: false,
    },
    sumOfRevenue: {
      format: 'currency',
      sql: `CASE WHEN ${CUBE}.status = 'won' THEN ${CUBE}.amount ELSE 0 END`,
      type: 'sum',
      description: 'Sum of Revenue (Won) - Deal',
      shown: false,
    },
    sumOfAmount: {
      format: 'currency',
      sql: `amount`,
      type: 'sum',
      description: 'Sum of Revenue - Deal',
    },
    minimumOfAmount: {
      format: 'currency',
      sql: `amount`,
      type: 'min',
      description: 'Minimum of amount - Deal',
    },
    maximumOfAmount: {
      format: 'currency',
      sql: `amount`,
      type: 'max',
      description: 'Maximum of amount - Deal',
    },
    averageOfAmount: {
      format: 'currency',
      sql: `amount`,
      type: 'avg',
      description: 'Average of amount - Deal',
    },
    uniqueCountOfTenantDealStageId: {
      shown: false,
      sql: 'tenant_deal_stage_id',
      type: 'count',
      description: 'Unique Count of Tenant Deal Stage Id - Deal',
    },
  },

  dimensions: {
    salesStage: {
      sql: 'sales_stage',
      type: 'string',
      shown: false,
    },

    id: {
      shown: false,
      sql: 'id',
      type: 'string',
      primaryKey: true,
    },

    leadSource: {
      shown: false,
      sql: 'lead_source',
      type: 'string',
    },

    name: {
      sql: 'name',
      type: 'string',
    },

    amount: {
      format: 'currency',
      sql: 'amount',
      type: 'string',
    },

    contactPersonId: {
      sql: 'contact_person_id',
      type: 'string',
      shown: false,
    },
    contactOrganizationId: {
      sql: 'contact_organization_id',
      type: 'string',
      shown: false,
    },
    modifiedUserId: {
      shown: false,
      sql: 'modified_user_id',
      type: 'string',
    },

    currency: {
      shown: false,
      sql: 'currency',
      type: 'string',
    },

    deleted: {
      shown: false,
      sql: 'deleted',
      type: 'string',
    },

    description: {
      shown: false,
      sql: 'description',
      type: 'string',
    },

    nextStep: {
      shown: false,
      sql: 'next_step',
      type: 'string',
    },

    lastStatusUpdate: {
      shown: false,
      sql: 'last_status_update',
      type: 'time',
    },

    dateClosed: {
      sql: 'date_closed',
      type: 'time',
    },

    dateEntered: {
      sql: 'date_entered',
      type: 'time',
    },

    dateModified: {
      sql: 'date_modified',
      type: 'time',
    },

    dateLostClosed: {
      shown: false,
      sql: 'date_lost_closed',
      type: 'time',
    },

    dateWonClosed: {
      shown: false,
      sql: 'date_won_closed',
      type: 'time',
    },

    status: {
      sql: 'status',
      type: 'string',
    },

    tenantDealStageId: {
      sql: 'tenant_deal_stage_id',
      type: 'string',
      shown: false,
    },

    createdBy: {
      sql: 'created_by',
      type: 'string',
    },
    assignedUserId: {
      sql: 'assigned_user_id',
      type: 'string',
      title: 'Owner',
    },
    tenantId: {
      shown: false,
      sql: 'tenant_id',
      type: 'string',
    },
  },
});
