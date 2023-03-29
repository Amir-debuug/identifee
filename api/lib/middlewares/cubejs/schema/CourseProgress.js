import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('CourseProgress', {
  sql: 'SELECT * FROM public.course_progress',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('course_progress', 'created_at')}`,
  },

  joins: {
    Course: {
      relationship: 'belongsTo',
      sql: `${CUBE.courseId} = ${Course.id}`,
    },
    Tenant: {
      relationship: 'belongsTo',
      sql: `${CUBE.tenantId} = ${Tenant.id}`,
    },
    User: {
      relationship: 'belongsTo',
      sql: `${CUBE.userId} = ${User.id}`,
    },
  },

  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: ['Course', 'User'],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },

    count: {
      drillMembers: [],
      type: 'count',
      description: 'Count of - Course Progress',
    },
    countOfCompleted: {
      filters: [
        {
          sql: `${CUBE.completedAt} IS NOT NULL`,
        },
      ],
      type: 'count',
      description: 'Count of Completed - Courses',
    },
    countOfInProgress: {
      filters: [
        {
          sql: `${CUBE.completedAt} IS NULL AND ${CUBE.startedAt} IS NOT NULL`,
        },
      ],
      type: 'count',
      description: 'Count of In Progress - Courses',
    },
    averageOfScore: {
      sql: `score`,
      type: 'avg',
      description: 'Average of Score - Courses',
    },
    maxPoints: {
      sql: `points`,
      type: 'max',
      description: 'Max of Points - Courses',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
    },

    courseId: {
      sql: 'course_id',
      type: 'string',
    },
    userId: {
      sql: 'user_id',
      type: 'string',
    },

    completedAt: {
      sql: 'completed_at',
      type: 'time',
    },
    startedAt: {
      sql: 'started_at',
      type: 'time',
    },
    score: {
      sql: 'score',
      type: 'number',
    },
    points: {
      sql: 'points',
      type: 'number',
    },

    createdAt: {
      sql: 'created_at',
      type: 'time',
      title: 'Created Time',
    },
    tenantId: {
      shown: false,
      sql: 'tenant_id',
      type: 'string',
    },
  },
});
