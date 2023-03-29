import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('User', {
  sql: 'SELECT * FROM public.users',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('users', 'created_at')}`,
  },

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Deal: {
      relationship: 'belongsTo',
      sql: `${CUBE.id} = ${Deal.assignedUserId}`,
    },
    LessonProgress: {
      relationship: 'belongsTo',
      sql: `${CUBE.id} = ${LessonProgress.userId}`,
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
        relatedTypes: [],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },

    count: {
      type: 'count',
      drillMembers: [],
      description: 'Count of - Users',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
      shown: false,
    },

    tags: {
      sql: 'tags',
      type: 'string',
      shown: false,
    },

    role: {
      sql: 'role',
      type: 'string',
      shown: false,
    },

    firstName: {
      sql: 'first_name',
      type: 'string',
      shown: false,
    },

    lastName: {
      sql: 'last_name',
      type: 'string',
      shown: false,
    },

    fullName: {
      sql: `CONCAT(${CUBE.firstName}, ' ', ${CUBE.lastName})`,
      type: 'string',
      title: 'Name',
    },

    email: {
      sql: 'email',
      type: 'string',
    },

    title: {
      sql: 'title',
      type: 'string',
      shown: false,
    },

    avatar: {
      sql: 'avatar',
      type: 'string',
      shown: false,
    },

    status: {
      sql: 'status',
      type: 'string',
    },

    lastPage: {
      sql: 'last_page',
      type: 'string',
      shown: false,
    },

    phone: {
      sql: 'phone',
      type: 'string',
      shown: false,
    },

    lastAccess: {
      sql: 'last_access',
      type: 'time',
      shown: false,
    },
    tenantId: {
      shown: false,
      sql: 'tenant_id',
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
  },
});

cube('CreatedBy', { extends: User });
cube('AssignedUser', { extends: User, title: 'Owner' });
