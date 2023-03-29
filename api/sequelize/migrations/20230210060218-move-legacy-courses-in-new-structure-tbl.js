'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [courses] = await queryInterface.sequelize.query(`
      select c.category_id, c.id from courses c;
    `);

    const bulkInserts = [];
    courses.forEach((course) => {
      const categoryId = course.category_id;
      const courseId = course.id;
      if (categoryId) {
        bulkInserts.push({
          categoryId,
          courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    if (bulkInserts.length === 0) {
      console.warn(`nothing to migrate due to length 0: ${bulkInserts}`);
      return;
    }

    try {
      await queryInterface.bulkInsert('CategoryCourse', bulkInserts, {});
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface, Sequelize) {},
};
