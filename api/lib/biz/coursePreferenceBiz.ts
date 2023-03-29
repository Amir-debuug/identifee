import { Biz, UserQuery } from './utils';

export class CoursePreferenceBiz extends Biz {
  async toggleFavorite(override: UserQuery | undefined, courseId: string) {
    const context = await this.userQuery.build(override);

    await this.services.biz.course.getOneById(override, courseId);

    const existingPreference =
      await this.services.dao.coursePreference.findOneByCompositeIds(
        context,
        courseId,
        this.user.id
      );

    const preference = await this.services.dao.coursePreference.upsert(
      context,
      {
        courseId,
        userId: this.user.id,
        isFavorite: !existingPreference?.isFavorite,
      }
    );

    return preference;
  }
}
