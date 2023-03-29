'use strict';

const { v4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [pages] = await queryInterface.sequelize.query(`
      select * from lesson_pages
      where qoption is not null and qoption::text != '[]'::text and "quizId" is null; 
    `);

    await Promise.all(
      pages.map(async (page) => {
        let query;
        const quizId = v4();
        await queryInterface.sequelize.query(`
          insert into "Quiz"
          ("quizId", "maxAttempts", "createdAt", "updatedAt")
          values
          ('${quizId}', null, now(), now());
        `);

        try {
          query = `
            insert into "QuizQuestion"
            ("quizQuestionId", "quizId", type, choices, "order", "createdAt", "updatedAt") 
            values
            ('${v4()}', '${quizId}', 'multipleChoice', '${JSON.stringify(
            page.qoption
          ).replace(/'/g, "''")}', 1, now(), now());
          `;
          await queryInterface.sequelize.query(query);
        } catch (error) {
          console.error(`QuizQuestion error, ${page.id}`);
          console.error(query);
          throw error;
        }

        try {
          await queryInterface.sequelize.query(`
          update lesson_pages
          set "quizId" = '${quizId}'
          where id = ${page.id};
        `);
        } catch (error) {
          console.error(`LessonPage error, ${page.id}`);
          throw error;
        }
      })
    );
  },

  async down(queryInterface, Sequelize) {},
};
