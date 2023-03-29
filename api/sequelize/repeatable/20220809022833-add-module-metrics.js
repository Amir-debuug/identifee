'use strict';

const v4 = require('uuid').v4;

const table = 'analytic';

const seeds = [
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Bottom 5 Users by Lessons Completed',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify(['User']),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['User.firstName', 'User.lastName']),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['LessonProgress.countOfCompleted']),
    order: JSON.stringify([['LessonProgress.countOfCompleted', 'asc']]),
    segments: JSON.stringify([]),
  },

  /**
   * Overview
   */
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Total Accounts',
    type: 'User',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: '',
    isMulti: true,
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([]),
    limit: 1000,
    measures: JSON.stringify(['User.count']),
    order: JSON.stringify([]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'User.createdAt',
        granularity: 'month',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Revenue By Product',
    type: 'Product',
    relatedTypes: JSON.stringify(['Deal']),
    displayType: 'kpi_rankings',
    icon: '',
    isMulti: true,
    dimensions: JSON.stringify(['Product.name']),
    filters: JSON.stringify([
      {
        member: 'Deal.status',
        values: ['won'],
        operator: 'equals',
      },
    ]),
    limit: 5,
    measures: JSON.stringify(['Product.sumOfUnitPrice']),
    order: JSON.stringify([]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'Deal.dateModified',
        dateRange: 'this month',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top Products',
    type: 'Product',
    relatedTypes: JSON.stringify(['Deal']),
    displayType: 'kpi_rankings',
    icon: '',
    isMulti: true,
    dimensions: JSON.stringify(['Product.name']),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['Product.count']),
    order: JSON.stringify([]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Deal.dateModified',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Latest Accounts',
    type: 'User',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: '',
    isMulti: true,
    dimensions: JSON.stringify(['User.fullName']),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['User.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'User.createdAt',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Contacts Created',
    type: 'Contact',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: '',
    isMulti: true,
    filters: JSON.stringify([]),
    measures: JSON.stringify(['Contact.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Contact.dateEntered',
      },
    ]),
  },
  ,
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Activity Breakdown',
    type: 'Activities',
    relatedTypes: JSON.stringify([]),
    dimensions: JSON.stringify(['Activities.type']),
    displayType: 'chart_donut',
    icon: '',
    isMulti: true,
    limit: 1000,
    filters: JSON.stringify([]),
    measures: JSON.stringify(['Activities.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Open Deals by Stage',
    type: 'Deal',
    relatedTypes: JSON.stringify(['DealStage']),
    displayType: 'chart_line',
    icon: 'monetization_on',
    dimensions: JSON.stringify(['DealStage.name']),
    filters: JSON.stringify([]),
    limit: 10000,
    measures: JSON.stringify(['Deal.count']),
    order: JSON.stringify([]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Deal.dateModified',
        granularity: 'month',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Revenue Won By Month',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'chart_column',
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([]),
    limit: 10000,
    measures: JSON.stringify(['Deal.sumOfRevenue']),
    order: JSON.stringify([['Deal.dateEntered', 'desc']]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'Deal.dateEntered',
        granularity: 'month',
        dateRange: 'from 6 month ago to now',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 5 Organizations',
    type: 'Organization',
    relatedTypes: JSON.stringify(['Deal']),
    displayType: 'kpi_rankings',
    icon: '',
    isMulti: true,
    dimensions: JSON.stringify(['Organization.name']),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['Organization.count']),
    order: JSON.stringify([]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Deal.dateModified',
      },
    ]),
  },

  // name: 'Deals Won',

  /**
   * Deal
   */

  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Open Deals',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: 'monetization_on',
    isMulti: true,
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([
      { member: 'Deal.status', values: [''], operator: 'notSet' },
    ]),
    limit: 10000,
    measures: JSON.stringify(['Deal.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Deal.dateEntered',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Deals Won',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([
      { member: 'Deal.status', values: ['won'], operator: 'equals' },
    ]),
    limit: 10000,
    measures: JSON.stringify(['Deal.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Deal.dateModified',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Deals Lost',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([
      { member: 'Deal.status', values: ['lost'], operator: 'equals' },
    ]),
    limit: 10000,
    measures: JSON.stringify(['Deal.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Deal.dateModified',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Total Revenue',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([]),
    limit: 10000,
    measures: JSON.stringify(['Deal.sumOfAmount']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Deal.dateEntered',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Revenue Won',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([
      { member: 'Deal.status', values: ['won'], operator: 'equals' },
    ]),
    limit: 10000,
    measures: JSON.stringify(['Deal.sumOfAmount']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Deal.dateModified',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Monthly Revenue By User',
    type: 'Deal',
    relatedTypes: JSON.stringify(['User']),
    displayType: 'chart_column',
    icon: 'monetization_on',
    dimensions: JSON.stringify(['User.firstName', 'User.lastName']),
    filters: JSON.stringify([]),
    limit: 10000,
    measures: JSON.stringify(['Deal.sumOfRevenue']),
    order: JSON.stringify([['Deal.dateEntered', 'desc']]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'Deal.dateEntered',
        granularity: 'month',
        dateRange: 'from 6 month ago to now',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 5 Users by Deals Won',
    type: 'Deal',
    relatedTypes: JSON.stringify(['User']),
    displayType: 'kpi_rankings',
    icon: 'monetization_on',
    isMulti: false,
    dimensions: JSON.stringify(['AssignedUser.fullName']),
    filters: JSON.stringify([
      {
        member: 'Deal.status',
        values: ['won'],
        operator: 'equals',
      },
    ]),
    limit: 5,
    measures: JSON.stringify(['Deal.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Deal.dateModified',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 5 Users by Deals Lost',
    type: 'Deal',
    relatedTypes: JSON.stringify(['User']),
    displayType: 'kpi_rankings',
    icon: 'monetization_on',
    isMulti: false,
    dimensions: JSON.stringify(['AssignedUser.fullName']),
    filters: JSON.stringify([
      {
        member: 'Deal.status',
        values: ['lost'],
        operator: 'equals',
      },
    ]),
    limit: 5,
    measures: JSON.stringify(['Deal.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Deal.dateModified',
      },
    ]),
  },

  ,
  /* Activities */
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Overdue Tasks',
    type: 'Activities',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    isMulti: true,
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([
      {
        member: 'Activities.type',
        values: ['task'],
        operator: 'equals',
      },
      {
        member: 'Activities.endDate',
        values: ['2023-01-01'],
        operator: 'beforeDate',
      },
      {
        member: 'Activities.done',
        values: ['in progress'],
        operator: 'equals',
      },
    ]),
    limit: 10000,
    measures: JSON.stringify(['Activities.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Activities.updatedAt',
        granularity: 'month',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Open Tasks',
    type: 'Activities',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    isMulti: true,
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([
      {
        member: 'Activities.type',
        values: ['task'],
        operator: 'equals',
      },
      {
        member: 'Activities.done',
        values: ['in progress'],
        operator: 'equals',
      },
    ]),
    limit: 10000,
    measures: JSON.stringify(['Activities.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Activities.updatedAt',
        granularity: 'month',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Closed Tasks',
    type: 'Activities',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    isMulti: true,
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([
      {
        member: 'Activities.type',
        values: ['task'],
        operator: 'equals',
      },
      {
        member: 'Activities.done',
        values: ['completed'],
        operator: 'equals',
      },
    ]),
    limit: 10000,
    measures: JSON.stringify(['Activities.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Activities.updatedAt',
        granularity: 'month',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Total Activities',
    type: 'Activities',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    isMulti: true,
    icon: 'monetization_on',
    dimensions: JSON.stringify([]),
    filters: JSON.stringify([]),
    limit: 10000,
    measures: JSON.stringify(['Activities.count']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        compareDateRange: ['this month', 'last month'],
        dimension: 'Activities.startDate',
        granularity: 'month',
      },
    ]),
  },
  /**
   * Training
   */
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top Revenue by User',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: true,
    dimensions: JSON.stringify(['AssignedUser.fullName']),
    filters: JSON.stringify([
      {
        member: 'Deal.status',
        values: ['won'],
        operator: 'equals',
      },
    ]),
    limit: 5,
    measures: JSON.stringify(['Deal.sumOfAmount']),
    order: JSON.stringify([]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Deal.dateModified',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 5 Completed Lessons',
    type: 'Training',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['Training.title']),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['Training.completeTraining']),
    order: JSON.stringify([['Training.completeTraining', 'desc']]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Training.completedAt',
      },
    ]),
    segments: JSON.stringify([]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 5 Users by Lessons Completed',
    type: 'Training',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['Training.user']),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Training.completedAt',
      },
    ]),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['Training.completeTraining']),
    order: JSON.stringify([['Training.completeTraining', 'desc']]),
    segments: JSON.stringify([]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 5 Users by Courses Completed',
    type: 'Training',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['Training.user']),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Training.courseCompletedAt',
      },
    ]),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['Training.completeCourses']),
    order: JSON.stringify([['Training.completeCourses', 'desc']]),
    segments: JSON.stringify([]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 5 Completed Courses',
    type: 'Training',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['Training.courseTitle']),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Training.courseCompletedAt',
      },
    ]),
    filters: JSON.stringify([]),
    limit: 5,
    measures: JSON.stringify(['Training.completeCourses']),
    order: JSON.stringify([['Training.completeCourses', 'desc']]),
    segments: JSON.stringify([]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Lessons Open',
    type: 'Training',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: true,
    dimensions: JSON.stringify(['Training.title']),
    filters: JSON.stringify([]),
    measures: JSON.stringify(['Training.incompleteTraining']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Training.lastAttemptedAt',
      },
    ]),
  },
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Lessons Completed',
    type: 'Training',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: true,
    dimensions: JSON.stringify(['Training.title']),
    filters: JSON.stringify([]),
    measures: JSON.stringify(['Training.completeTraining']),
    order: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'this month',
        dimension: 'Training.completedAt',
      },
    ]),
  },

  /**
   * Survey
   */

  /**
   * Insights
   */

  // Active Training Users

  // Deal Performance
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Count of Deals by Status - Last 6 Months',
    type: 'Deal',
    relatedTypes: JSON.stringify([]),
    displayType: 'kpi_standard',
    icon: 'monetization_on',
    isMulti: false,
    dimensions: JSON.stringify(['Deal.status']),
    filters: JSON.stringify([]),
    limit: 10000,
    measures: JSON.stringify(['Deal.count']),
    order: JSON.stringify([['Deal.count', 'desc']]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'Deal.dateModified',
        granularity: 'month',
        dateRange: 'from 6 month ago to now',
      },
    ]),
  },
  // Lesson Attempts
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 25 Lessons Attempted - Last 90 Day',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify(['Lesson']),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['Lesson.title']),
    filters: JSON.stringify([
      {
        member: 'LessonProgress.status',
        operator: 'notEquals',
        values: ['pending'],
      },
    ]),
    limit: 25,
    measures: JSON.stringify([
      'LessonProgress.avg',
      'LessonProgress.sumOfAttempts',
    ]),
    order: JSON.stringify([['LessonProgress.sumOfAttempts', 'desc']]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'LessonProgress.updatedAt',
        dateRange: 'from 90 day ago to now',
      },
    ]),
  },
  // Lessons started and completed
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Daily Lesson Completion Rate - Last 7 Day',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify([]),
    displayType: 'chart_column',
    icon: 'local_library',
    isMulti: false,
    dimensions: JSON.stringify(['LessonProgress.status']),
    filters: JSON.stringify([
      {
        member: 'LessonProgress.status',
        operator: 'notEquals',
        values: ['pending'],
      },
    ]),
    limit: 10000,
    measures: JSON.stringify([
      'LessonProgress.count',
      'LessonProgress.avgTimeToComplete',
    ]),
    order: JSON.stringify([['LessonProgress.createdAt', 'desc']]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dateRange: 'last 7 day',
        dimension: 'LessonProgress.createdAt',
        granularity: 'day',
      },
    ]),
  },
  // Lesson Leaderboard
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 25 Users by Lesson Points - Last 90 Day',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify(['User']),
    displayType: 'kpi_rankings',
    icon: 'leaderboard',
    isMulti: false,
    dimensions: JSON.stringify([
      'User.firstName',
      'User.lastName',
      'User.avatar',
    ]),
    filters: JSON.stringify([]),
    limit: 25,
    measures: JSON.stringify([
      'LessonProgress.sumOfPoints',
      'LessonProgress.countOfCompleted',
      'LessonProgress.countOfInProgress',
    ]),
    order: JSON.stringify([
      ['LessonProgress.sumOfPoints', 'desc'],
      ['LessonProgress.countOfCompleted', 'desc'],
      ['LessonProgress.countOfInProgress', 'desc'],
    ]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'LessonProgress.updatedAt',
        dateRange: 'from 90 day ago to now',
      },
    ]),
  },
  // Lessons Pending
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 25 Lessons in Progress - Last 90 Day',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify(['User']),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify([
      'User.firstName',
      'User.lastName',
      'User.avatar',
    ]),
    filters: JSON.stringify([
      {
        member: 'LessonProgress.status',
        operator: 'equals',
        values: ['in_progress'],
      },
    ]),
    limit: 25,
    measures: JSON.stringify(['LessonProgress.count']),
    order: JSON.stringify([['LessonProgress.count', 'desc']]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'LessonProgress.updatedAt',
        dateRange: 'from 90 day ago to now',
      },
    ]),
  },
  // Popular Lessons
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top Categories by Lesson Progress',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify(['Category']),
    displayType: 'kpi_rankings',
    icon: 'local_library',
    isMulti: false,
    dimensions: JSON.stringify(['Category.title', 'LessonProgress.status']),
    filters: JSON.stringify([
      {
        member: 'LessonProgress.status',
        operator: 'equals',
        values: ['completed'],
      },
    ]),
    limit: 10000,
    measures: JSON.stringify(['LessonProgress.count']),
    order: JSON.stringify([['LessonProgress.count', 'desc']]),
    segments: JSON.stringify([]),
  },
  // Trainings Completed
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 25 Lessons Completed - Last 90 Day',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify(['Lesson']),
    displayType: 'kpi_rankings',
    icon: 'school',
    isMulti: false,
    dimensions: JSON.stringify(['Lesson.title']),
    filters: JSON.stringify([
      {
        member: 'LessonProgress.status',
        operator: 'equals',
        values: ['completed'],
      },
    ]),
    limit: 25,
    measures: JSON.stringify(['LessonProgress.count']),
    order: JSON.stringify([['LessonProgress.count', 'desc']]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'LessonProgress.updatedAt',
        dateRange: 'from 90 day ago to now',
      },
    ]),
  },
  // Top Lessons
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Top 25 Lessons In Progress - Last 90 Day',
    type: 'LessonProgress',
    relatedTypes: JSON.stringify(['Lesson']),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['Lesson.title']),
    limit: 25,
    filters: JSON.stringify([
      {
        member: 'LessonProgress.status',
        operator: 'notEquals',
        values: ['pending'],
      },
    ]),
    measures: JSON.stringify(['LessonProgress.count', 'LessonProgress.avg']),
    order: JSON.stringify([['LessonProgress.count', 'desc']]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'LessonProgress.updatedAt',
        dateRange: 'from 90 day ago to now',
      },
    ]),
  },
  // Course Progress Report
  {
    id: v4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Course Progress Report',
    type: 'CourseProgress',
    relatedTypes: JSON.stringify(['Course', 'User']),
    displayType: 'kpi_rankings',
    icon: 'class',
    isMulti: false,
    dimensions: JSON.stringify(['User.fullName']),
    limit: 25,
    filters: JSON.stringify([]),
    measures: JSON.stringify([
      'CourseProgress.count',
      'CourseProgress.averageOfScore',
      'CourseProgress.maxPoints',
    ]),
    order: JSON.stringify([['CourseProgress.count', 'asc']]),
    segments: JSON.stringify([]),
    timeDimensions: JSON.stringify([
      {
        dimension: 'CourseProgress.startedAt',
        dateRange: 'from 90 day ago to now',
      },
    ]),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return Promise.all(
        seeds.map(async (seed) => {
          const metricId = await queryInterface.rawSelect(
            table,
            {
              where: {
                name: seed.name,
              },
            },
            ['id']
          );

          if (metricId) {
            delete seed.id;
            delete seed.createdAt;
            await queryInterface.bulkUpdate(table, seed, {
              id: metricId,
            });
          } else {
            await queryInterface.bulkInsert(table, [seed], {});
          }
        })
      );
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {},
};
