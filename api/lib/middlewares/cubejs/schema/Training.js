view(`Training`, {
  description: 'Training',
  includes: [],
  measures: {
    count: {
      sql: `${Lesson.count}`,
      type: `number`,
      title: 'Count of trainings ',
      description: 'Count of- Trainings',
    },
    countOfCourses: {
      sql: `${Course.count}`,
      type: `number`,
      title: 'Count of courses ',
      description: 'Count of- Courses',
    },
    completeTraining: {
      sql: `${LessonProgress.countOfCompleted}`,
      type: `number`,
      title: 'Complete - Trainings',
      description: 'Complete - Training',
    },
    incompleteTraining: {
      sql: `${LessonProgress.countOfInProgress}`,
      type: `number`,
      title: 'Incomplete - Trainings',
      description: 'Incomplete - Trainings',
    },
    completeCourses: {
      sql: `${CourseProgress.countOfCompleted}`,
      type: `number`,
      title: 'Complete - Courses ',
      description: 'Complete - Courses',
    },
    incompleteCourses: {
      sql: `${CourseProgress.countOfInProgress}`,
      type: `number`,
      title: 'Incomplete - Courses',
      description: 'Incomplete - Courses',
    },
  },
  dimensions: {
    title: {
      sql: `${Lesson.title}`,
      type: `string`,
    },
    courseTitle: {
      sql: `${Course.name}`,
      type: `string`,
      title: 'Course Title',
    },
    status: {
      sql: `${Lesson.status}`,
      type: 'string',
    },

    categoryId: {
      sql: `${Lesson.categoryId}`,
      type: 'number',
    },

    createdAt: {
      sql: `${Lesson.createdAt}`,
      type: 'time',
    },

    updatedAt: {
      sql: `${Lesson.updatedAt}`,
      type: 'time',
    },
    tags: {
      sql: `${Lesson.tags}`,
      type: 'string',
    },
    startedAt: {
      sql: `${LessonProgress.startedAt}`,
      type: 'time',
    },

    lastAttemptedAt: {
      sql: `${LessonProgress.lastAttemptedAt}`,
      type: 'time',
    },

    completedAt: {
      sql: `${LessonProgress.completedAt}`,
      type: 'time',
    },
    points: {
      sql: `${LessonProgress.points}`,
      type: 'number',
    },
    progress: {
      sql: `${LessonProgress.progress}`,
      type: 'number',
    },
    progressStatus: {
      sql: `${LessonProgress.status}`,
      type: 'number',
    },
    attempts: {
      sql: `${LessonProgress.attempts}`,
      type: 'number',
    },
    user: {
      sql: `${User.fullName}`,
      type: 'string',
    },
    courseId: {
      sql: `${CourseProgress.courseId}`,
      type: 'string',
    },

    courseCompletedAt: {
      sql: `${CourseProgress.completedAt}`,
      type: 'time',
    },
    courseStartedAt: {
      sql: `${CourseProgress.startedAt}`,
      type: 'time',
    },
  },
});
