import { CategoryCourse } from '../database';
import Base, { SequelizeOpts } from './utils/Base';
import { AuthUser } from 'lib/middlewares/auth';
import {
  CategoryCourseAttributes,
  CategoryCourseModel,
} from 'lib/database/models/categoryCourse';

class CategoryCourseService extends Base<CategoryCourseModel> {
  getContextQuery() {
    return {};
  }

  async bulkCreate(
    payloads: CategoryCourseAttributes[],
    opts: SequelizeOpts = {}
  ) {
    const categoryCourses = await CategoryCourse.bulkCreate(payloads, {
      ...this.getSequelizeOpts(opts),
    });

    return this.rowsToJSON(categoryCourses);
  }

  async deleteByCourseId(courseId: string, opts: SequelizeOpts = {}) {
    await CategoryCourse.destroy({
      where: { courseId: courseId },
      ...this.getSequelizeOpts(opts),
    });

    return;
  }
}

export class AdminCategoryCourseService extends CategoryCourseService {
  getContextQuery() {
    return {};
  }
}
export class OwnerCategoryCourseService extends CategoryCourseService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export class UserCategoryCourseService extends CategoryCourseService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export function CategoryCourseServiceFactory(user: AuthUser) {
  if (user?.auth?.isAdmin) {
    return new AdminCategoryCourseService(CategoryCourse, user);
  } else if (user?.auth?.isOwner) {
    return new OwnerCategoryCourseService(CategoryCourse, user);
  }
  return new UserCategoryCourseService(CategoryCourse, user);
}
