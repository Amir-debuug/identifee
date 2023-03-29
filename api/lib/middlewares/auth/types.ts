import { JWTContext } from 'lib/util';

/**
 * Contains the authenticated context when a route uses authenticate middleware
 */
export type AuthUser = {
  id: string;
  tenant: string;
  jwt: JWTContext;
  auth: {
    isAdmin: boolean; // able to query across all tenants
    isOwner: boolean; // able to query an entire tenant
    isAppUser: boolean; // standard user, able to do most things
    isGuest: boolean; // restricted by organization id
    roleIds: string[]; // assigned role ids for the user

    /**
     * @deprecated This should be removed in favor of using `Context` in Biz layer...
     */
    userIds: string[]; // user ids accessible to user through group permission
  };
};

export type AuthMiddleware = {
  user: AuthUser;
};
