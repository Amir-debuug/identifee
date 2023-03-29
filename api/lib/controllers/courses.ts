import { Router } from 'express';
import Joi from 'joi';

import asyncHandler from '../utils/async-handler';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { permissions } from 'lib/middlewares/sequelize';
import { InvalidPayload } from 'lib/middlewares/exception';
import { CourseServiceFactory } from 'lib/services';

const route = Router();
const path = '/courses';

route.patch(
  `${path}/:id`,
  isAuthorizedMiddleware(permissions.courses.edit),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const service = CourseServiceFactory(req.user);
    const result = await service.updateCourse(id, req.body);

    return res.json(result);
  })
);

route.get(
  `${path}/:id/lessons`,
  // isAuthorizedMiddleware(permissions.courses.view), TODO: Create permissions of courses
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = Joi.string().uuid().validate(id);

    if (error) throw new InvalidPayload(error.message);
    const service = CourseServiceFactory(req.user);
    const courseLesson = await service.getCourseLessonById(id);

    res.send(courseLesson);
  })
);

const courseUpdateSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  is_learning_path: Joi.boolean().required(),
  category_id: Joi.number().allow('', null),
  quiz_id: Joi.string().uuid().optional(),
  badge_id: Joi.string().uuid().optional(),
  lessons: Joi.array().min(2).required(),
  removedLessons: Joi.array().min(0).allow(null),
  status: Joi.string().allow(null).optional(),
  categoryIds: Joi.array().min(0).allow(null),
});

route.put(
  `${path}/:id/lessons`,
  isAuthorizedMiddleware(permissions.courses.edit),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { error } = courseUpdateSchema.validate(req.body);

    if (error) throw new InvalidPayload(error.message);
    const service = CourseServiceFactory(req.user);
    const courseLesson = await service.updateCourseWithLessons({
      ...req.body,
      id,
    });

    res.send(courseLesson);
  })
);

export default route;
