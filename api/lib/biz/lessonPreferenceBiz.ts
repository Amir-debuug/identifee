import { Biz, UserQuery } from './utils';

export class LessonPreferenceBiz extends Biz {
  async toggleFavorite(override: UserQuery | undefined, lessonId: number) {
    const context = await this.userQuery.build(override);

    await this.services.biz.lesson.getOneById(override, lessonId);

    const existingPreference =
      await this.services.dao.lessonPreference.findOneByCompositeIds(
        context,
        lessonId,
        this.user.id
      );

    const preference = await this.services.dao.lessonPreference.upsert(
      context,
      {
        lessonId,
        userId: this.user.id,
        isFavorite: !existingPreference?.isFavorite,
      }
    );

    return preference;
  }
}
