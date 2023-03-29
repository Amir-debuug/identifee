'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [lessonProgresses] = await queryInterface.sequelize.query(`
      select * from lesson_trackings where is_favorited = 1;
    `);

    await Promise.all(
      lessonProgresses.map(async (lessonProgress) => {
        await queryInterface.sequelize.query(`
          insert into "LessonPreference"
          ("lessonId", "userId", "isFavorite", "createdAt", "updatedAt")
          values
          (${lessonProgress.lesson_id}, '${lessonProgress.user_id}', true, now(), now())
          on conflict ("lessonId", "userId") do nothing;
        `);
      })
    );
  },

  async down(queryInterface, Sequelize) {},
};
