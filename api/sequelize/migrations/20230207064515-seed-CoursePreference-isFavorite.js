'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [courseProgresses] = await queryInterface.sequelize.query(`
      select * from course_progress where is_favorite = true;
    `);

    await Promise.all(
      courseProgresses.map(async (courseProgress) => {
        await queryInterface.sequelize.query(`
          insert into "CoursePreference"
          ("courseId", "userId", "isFavorite", "createdAt", "updatedAt")
          values
          ('${courseProgress.course_id}', '${courseProgress.user_id}', true, now(), now())
          on conflict ("courseId", "userId") do nothing;
        `);
      })
    );
  },

  async down(queryInterface, Sequelize) {},
};
