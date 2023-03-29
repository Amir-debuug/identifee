import { RequestHandler } from 'express';
import { Forbidden } from '../exception';
import { APIRequest } from 'lib/utils';
import { Permission } from 'lib/middlewares/sequelize';

export const isAuthorizedMiddleware = (permission: Permission) =>
  (async (req, res, next) => {
    const userIsAuthorized = await isAuthorized(req as APIRequest, permission);
    if (userIsAuthorized) {
      return next();
    }

    throw new Forbidden();
  }) as RequestHandler;

export async function isAuthorized(req: APIRequest, permission: Permission) {
  if (!req.user) {
    return false;
  }

  const { isAdmin, isOwner } = req.user.auth;

  if (permission.collection === 'admin') {
    if (!isAdmin) {
      throw new Forbidden();
    }
    return true;
  }
  // admin supersedes owner permission
  if (permission.collection === 'owner') {
    if (!isAdmin && !isOwner) {
      throw new Forbidden();
    }
    return true;
  }
  // admins and owners have wildcard access to all items
  if (isAdmin || isOwner) {
    return true;
  }

  // guest routes are scope based... feels iffy...
  if (req.user.auth.isGuest) {
    return true;
  }

  try {
    const [userRoleId] = req.user.auth.roleIds;
    const rolePermissions = await req.services.biz.permission.getAllByRoleId(
      undefined,
      userRoleId
    );
    if (rolePermissions.length === 0) {
      return false;
    }

    const hasPermission = rolePermissions.some(
      (rolePermission) =>
        rolePermission.collection === permission.collection &&
        rolePermission.action === permission.action
    );

    return hasPermission;
  } catch (error) {
    throw new req.exception.Forbidden();
  }
}
