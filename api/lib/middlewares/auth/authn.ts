import { dot } from 'dot-object';
import { NextFunction, Request, Response } from 'express';
import { APIRequest } from 'lib/utils';
import { createServiceMiddleware, extendAs } from '../context';
import { InvalidCredentials } from '../exception';
import { UserTags } from '../opentelemetry';
import { AuthMiddleware, AuthUser } from './types';

let opts: {
  jwtSecret: string;
  basicUser: string;
  basicPass: string;
};

/**
 * Use this in situations where service classes need to be initialized but
 * there is no user (non authenticated request or server process)
 */
export const defaultUsers: { user: AuthUser; admin: AuthUser } = {
  user: {
    id: '0',
    tenant: '0',
    jwt: {
      scope: 'profile',
      exp: new Date().valueOf(),
      id: '0',
      iat: 0,
      tenant_id: '0',
    },
    auth: {
      isAdmin: false,
      isAppUser: true,
      isGuest: false,
      isOwner: false,
      roleIds: [],
      userIds: [],
    },
  },
  admin: {
    id: '0',
    tenant: '0',
    jwt: {
      scope: 'profile',
      exp: new Date().valueOf(),
      id: '0',
      iat: 0,
      tenant_id: '0',
    },
    auth: {
      isAdmin: true,
      isAppUser: false,
      isGuest: false,
      isOwner: false,
      roleIds: [],
      userIds: [],
    },
  },
};

export function authenticateMiddleware(authOpts: typeof opts) {
  opts = authOpts;

  return async function reqAuthenticate(
    req: Omit<Request, 'user'> & AuthMiddleware,
    res: Response,
    next: NextFunction
  ) {
    try {
      await authenticate(req);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export async function authenticate(
  req: Omit<Request, 'user'> & AuthMiddleware
) {
  let token: string | null = null;

  req.user = {
    id: null as any,
    tenant: null as any,
    jwt: {} as any,
    auth: {
      isAdmin: false,
      isOwner: false,
      isAppUser: false,
      isGuest: false,
      roleIds: [],
      userIds: [],
    },
  } as AuthUser;

  if (req.query && req.query.access_token) {
    token = req.query.access_token as string;
  }

  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      const [scheme, credentials] = parts;

      if (scheme === 'Bearer') {
        token = credentials;
      } else if (scheme === 'Basic') {
        const decodedBasic = Buffer.from(credentials, 'base64').toString(
          'ascii'
        );
        const [user, password] = decodedBasic.split(':');
        if (user === opts.basicUser && password === opts.basicPass) {
          req.user.auth.isAdmin = true;
          return;
        } else {
          throw new InvalidCredentials('Invalid credentials');
        }
      }
    }
  }

  if (!token) {
    throw new InvalidCredentials('No JWT Provided');
  }

  const adminReq = await extendAs(defaultUsers.admin, {
    otel: (req as any).otel,
  });

  const payload = adminReq.services.util.jwt.verify(token);
  req.user.jwt = payload;

  req.user.tenant = req.user.jwt.tenant_id;
  if (req.user.jwt.scope === 'guest') {
    req.user.auth.isGuest = true;

    const userTags = {
      contactId: req.user.jwt.contact_id,
      resourceAccess: req.user.jwt.resource_access,
      tenantId: req.user.jwt.tenant_id,
    } as UserTags;
    (req as any).otel.telemetry.rootSpan.setAttributes(
      dot({ app: { user: userTags } })
    );

    return;
  }

  req.user.id = req.user.jwt.id;

  // this is kept for backwards compatibility with "controllers"
  // OpenAPI will initialize this portion as part of authorization middleware
  const { role, groupId } =
    await adminReq.services.biz.user.getOneAuthorizationById(
      undefined,
      req.user.id
    );
  if (role) {
    req.user.auth.roleIds = [role.id as string];
    req.user.auth.isAdmin = role.admin_access;
    req.user.auth.isOwner = role.owner_access;
    req.user.auth.isAppUser = role.app_access;

    // ideally this should be in Contex Biz layer but we still have old controllers
    // that have not been migrated...
    if (!req.user.auth.isAdmin && !req.user.auth.isOwner) {
      (req as any).services = await createServiceMiddleware(req as any);
      const apiReq = req as APIRequest;

      let groupIds: string[] = [];

      try {
        const groupHierarchy = await apiReq.services.biz.group.getFullHierarchy(
          { self: true },
          groupId
        );
        if (groupHierarchy.has_sibling_access && groupHierarchy.parent_id) {
          const siblings = await apiReq.services.biz.group.getAllByParentId(
            { self: true },
            groupHierarchy.parent_id
          );
          groupIds = siblings.map(({ id }) => id);
        }
        groupIds.push(groupHierarchy.id);

        // recursive groupid insert
        const recurse = (group: typeof groupHierarchy) => {
          group.children.forEach((child) => {
            groupIds.push(child.id);
            return recurse(child);
          });
        };
        recurse(groupHierarchy);
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }
      const users = await apiReq.services.biz.user.getAllByGroupId(
        {},
        groupIds
      );
      req.user.auth.userIds = users.map(({ id }) => id);
    }
  }

  const { userIds, ...authTags } = req.user.auth;
  const userTags: UserTags = {
    auth: { ...authTags },
    scope: req.user.jwt.scope,
    tenantId: req.user.jwt.tenant_id,
    userId: req.user.jwt.id,
  };
  if (req.user.jwt.scope === 'impersonation') {
    userTags.impersonatorId = req.user.jwt.impersonator;
  }

  (req as any).otel.telemetry.rootSpan.setAttributes(
    dot({ app: { user: userTags } })
  );

  // for cubejs
  (req as any).securityContext = {
    db: (req as any).db,
    exception: (req as any).exception,
    user: req.user,
  };

  return;
}
