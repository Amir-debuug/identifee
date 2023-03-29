import { Pagination } from 'lib/dao';
import { CourseContentCreateQuizBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class CourseContentBiz extends Biz {
  async getByCourseId(
    override: UserQuery | undefined,
    courseId: string,
    pagination: Pagination
  ) {
    // need to access public stuff...
    // const context = await this.tenantQuery.build(override);

    const contents = await this.services.dao.courseContent.findByCourseId(
      {},
      courseId,
      pagination
    );

    return contents;
  }

  async createByCourseId(
    override: UserQuery | undefined,
    courseId: string,
    payload: CourseContentCreateQuizBiz
  ) {
    const context = await this.tenantQuery.build(override);

    const quiz = await this.services.dao.quiz.create(context, {
      maxAttempts: payload.quiz.maxAttempts,
    });

    const [courseContent, ...questions] = await Promise.all([
      this.services.dao.courseContent.create(context, {
        courseId,
        tenantId: context.tenantId,
        order: payload.order,
        quizId: quiz.quizId,
      }),
      ...payload.quiz.questions.map((question) =>
        this.services.dao.quizQuestion.create(context, {
          ...question,
          quizId: quiz.quizId,
        })
      ),
    ]);

    return courseContent;
  }
}
