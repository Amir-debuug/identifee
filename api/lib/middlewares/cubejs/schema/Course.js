import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('Course', {
  sql: 'SELECT * FROM public.courses',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('courses', 'created_at')}`,
  },

  joins: {
    CourseProgress: {
      relationship: 'hasMany',
      sql: `${CUBE.id} = ${CourseProgress.courseId}`,
    },
  },

  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: ['CourseProgress'],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },
    count: {
      type: 'count',
      drillMembers: [],
      description: 'Count of - Courses',
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
    createdAt: {
      sql: 'created_at',
      type: 'time',
      title: 'Created Time',
    },
  },
});
