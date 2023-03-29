import express from 'express';
import Joi from 'joi';

import asyncHandler from '../utils/async-handler';
import { userServiceFactory } from '../services';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { InvalidPayload } from 'lib/middlewares/exception';
import { permissions } from 'lib/middlewares/sequelize';

const router = express.Router();

export type UserData = {
  firstName?: string;
  lastName?: string;
  email: string;
};

// TODO FE to split GET /users and GET /contacts
router.get(
  '/users/guests',
  asyncHandler(async (req, res) => {
    const { search } = req.query;

    const service = userServiceFactory(req.user);
    const guests = await service.getMatchGuests(String(search));

    res.json(guests);
  })
);

// TODO FE to split GET /users/ids and GET /contacts/ids
router.get(
  '/users/guests/ids',
  asyncHandler(async (req, res) => {
    const ids = req.query.ids || '';

    // front end is providing string of: ',{id}' which results in ['',id]
    const idsParse = (<string>ids).split(',').filter((item) => !!item);

    const service = userServiceFactory(req.user);
    const guests = await service.getGuestByIds(idsParse);

    res.json(guests);
  })
);

router.delete(
  '/users',
  isAuthorizedMiddleware(permissions.privileged.owner),
  asyncHandler(async (req, res) => {
    const { ids } = req.query as { ids: string };
    const service = userServiceFactory(req.user);
    const resp = await service.deleteAll(ids.split(','));

    res.json(resp);
  })
);

router.patch(
  '/users/:id/status',
  isAuthorizedMiddleware(permissions.privileged.owner),
  asyncHandler(async (req, res) => {
    const {
      params: { id },
      body: { status },
    } = req;
    const { error } = Joi.string().not('').required().validate(status);

    if (error) throw new InvalidPayload(error.message);

    const usersServices = userServiceFactory(req.user);
    const userUpdate = await usersServices.changeStatusById(id, status);

    return res.json(userUpdate);
  })
);

router.post(
  '/users/invite',
  isAuthorizedMiddleware(permissions.privileged.owner),
  asyncHandler(async (req, res) => {
    const service = userServiceFactory(req.user);
    const { users, roleId, groupId, tenant } = req.body;

    const inviteUser = async (user: UserData) => {
      try {
        await service.inviteUser(tenant, user, roleId, groupId);
        return { isValid: true, user };
      } catch (error: any) {
        return {
          isValid: false,
          user,
          error: { ...error, message: error.message },
        };
      }
    };

    const invitationResults = await Promise.all(
      users.map(async (user: UserData) => {
        return inviteUser(user);
      })
    );

    return res.json(invitationResults);
  })
);

const resentInviteSchema = Joi.object({
  id: Joi.string().uuid({ version: 'uuidv4' }).required(),
  email: Joi.string().email(),
});

router.post(
  '/users/resent-invite',
  isAuthorizedMiddleware(permissions.privileged.owner),
  asyncHandler(async (req, res) => {
    const { error } = resentInviteSchema.validate(req.body);
    if (error) throw new InvalidPayload(error.message);

    const service = userServiceFactory(req.user);

    const user = await service.getUser(req.body.id);
    if (!user) {
      throw new InvalidPayload(
        `Email address ${req.body.email} hasn't been invited.`
      );
    }

    if (user?.status !== 'invited') {
      throw new InvalidPayload(
        `Email address ${req.body.email} is already registered.`
      );
    }

    await service.sendEmailInvite(req.body.id, user.tenant_id, req.body.email);

    return res.json();
  })
);

const messageSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  message: Joi.string().required(),
});

router.post(
  '/users/message',
  asyncHandler(async (req, res) => {
    const { error } = messageSchema.validate(req.body);

    if (error) throw new InvalidPayload(error.message);

    const { name, email, message } = req.body || {};

    const service = userServiceFactory(req.user);

    await service.message(name, email, message);

    return res.json();
  })
);

// Delete user from group
router.delete(
  `/users/:userId/group`,
  isAuthorizedMiddleware(permissions.privileged.owner),
  asyncHandler(async (req, res) => {
    const { users } = req.body;
    const { id } = req.params;
    const userService = userServiceFactory(req.user);
    // TODO refactor this
    const updateUser = await userService.updateUserById({
      ...users,
      id,
      group_id: null,
    });
    res.json(updateUser);
  })
);

export default router;
