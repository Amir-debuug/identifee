import { ResourceAccess } from 'lib/util';
import { AuthUser } from '../auth';

export type UserTags =
  // standard users
  | {
      auth: Omit<AuthUser['auth'], 'userIds'>;
      impersonatorId?: string;
      scope: string;
      tenantId: string;
      userId: string;
    }
  // for guests
  | {
      contactId: string;
      resourceAccess: ResourceAccess;
      tenantId: string;
    };
