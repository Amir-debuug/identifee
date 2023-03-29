import {
  CourseContentCreateDAO,
  QuizAttr,
  QuizQuestionAttr,
} from 'lib/middlewares/sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class CourseContentDAO extends DAO<'CourseContentDB'> {
  async findByCourseId(
    context: ContextQuery,
    courseId: string,
    pagination: Pagination
  ) {
    const builder = this.where();
    builder.merge({ courseId });
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      include: [
        {
          association: 'quiz',
          include: ['questions'],
          required: false,
        },
      ],
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(
      this.rowsToJSON<{ quiz?: QuizAttr & { questions: QuizQuestionAttr[] } }>(
        rows
      ),
      count,
      pagination
    );
  }

  async create(context: ContextQuery, payload: CourseContentCreateDAO) {
    const builder = this.where();
    builder.context(context);

    const courseContent = await this.repo.create(payload);

    return this.toJSON(courseContent)!;
  }
}
