import { Express } from 'express';
import CubejsServerCore from '@cubejs-backend/server-core';
import PostgresDriver from '@cubejs-backend/postgres-driver';
import { CustomFileRepository } from './CustomFileRepository';
import { AuthUser } from '../auth';
import { Context } from 'lib/biz/utils';
import { extendAs } from '../context';

export function initCubejs(
  app: Express,
  config: {
    apiSecret?: string;
    basePath: string;
    db: {
      host: string;
      database: string;
      username: string;
      password: string;
    };
  }
) {
  const cubejsServer = CubejsServerCore.create({
    /**
     * See this issue: https://github.com/cube-js/cube.js/issues/335
     * Until CubeJS provides an official way to disable base path route usage,
     * we have to maintain our own forked repo to allow that option...
     *
     * Delete this option until above issue is resolved
     */
    disableBasePath: true,

    telemetry: false,
    dbType: 'postgres',
    apiSecret: config.apiSecret || '',
    basePath: config.basePath,
    // See class for explanation on class. Luckily repositoryFactory allows us to override
    // how cubejs imports files because they don't do it the TS way...
    repositoryFactory: () => new CustomFileRepository(),
    driverFactory: () =>
      new PostgresDriver({
        host: config.db.host,
        database: config.db.database,
        user: config.db.username,
        password: config.db.password,
        // this any is required until cubejs officially supports a way to disable base path
      }) as any,

    checkAuth: (req, auth) => {},
    queryRewrite: async (query, { securityContext }) => {
      const userReq = await extendAs(securityContext.user as AuthUser, {});
      const ctx = new Context({
        db: userReq.db,
        exception: userReq.exception,
        otel: userReq.otel,
        services: userReq.services,
        user: userReq.user,
      });

      if (!query.filters) {
        query.filters = [];
      }
      if (!query.dimensions) {
        query.dimensions = [];
      }
      query.filters = query.filters?.filter((filter) => {
        if ('member' in filter) {
          return filter.member !== 'Tenant.id';
        }
        return true;
      });

      const isRequestingDimension = (search: string) =>
        query.dimensions!.some((dimension) =>
          dimension.toLowerCase().startsWith(`${search.toLowerCase()}.`)
        );

      const hasDeals = isRequestingDimension('Deal');
      const hasLessonProgress = isRequestingDimension('LessonProgress');
      const hasUsers = isRequestingDimension('User');

      let ctxQuery;
      const orItems = [];
      if (hasDeals) {
        ctxQuery = {
          ...(await ctx.userDealQuery.build()),
        };

        if (ctxQuery.ownedIds && ctxQuery.ownedIds.length > 0) {
          orItems.push({
            member: 'Deal.id',
            operator: 'equals',
            values: ctxQuery.ownedIds,
          });
        }
        if (ctxQuery.userId) {
          orItems.push({
            member: 'Deal.createdById',
            operator: 'equals',
            values: ctxQuery.userId,
          });
          orItems.push({
            member: 'Deal.assignedUserId',
            operator: 'equals',
            values: ctxQuery.userId,
          });
        }
      } else {
        ctxQuery = {
          ...(await ctx.userQuery.build()),
        };
      }

      const hasSelf = query.filters.some((item) => {
        if ('values' in item) {
          return item.values && item.values[0] === 'self';
        }
        return false;
      });
      if (hasSelf) {
        query.filters.forEach((item) => {
          if ('values' in item) {
            if (item.values && item.values[0] === 'self') {
              item.values = [userReq.user.id];
            }
          }
        });
      }

      if ('userId' in ctxQuery && ctxQuery.userId) {
        if (hasLessonProgress) {
          orItems.push({
            member: 'LessonProgress.userId',
            operator: 'equals',
            values: [ctxQuery.userId],
          });
        }
        if (hasUsers) {
          orItems.push({
            member: 'User.id',
            operator: 'equals',
            values: [ctxQuery.userId],
          });
          orItems.push({
            member: 'User.status',
            operator: 'equals',
            values: ['active'],
          });
        }
      }
      if (ctxQuery.tenantId) {
        query.filters.push({
          member: 'Tenant.id',
          operator: 'equals',
          values: [ctxQuery.tenantId],
        });
      }

      if (orItems.length > 0) {
        query.filters.push({
          or: orItems,
        } as any);
      }

      return query;
    },
  });

  cubejsServer.initApp(app);
}
