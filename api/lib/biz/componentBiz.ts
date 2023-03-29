import {
  AnalyticAttr,
  AnalyticModifyBiz,
  ComponentCreateWithAssociationBiz,
  ComponentModifyBiz,
  ComponentTextAttr,
} from 'lib/middlewares/sequelize';
import { Transaction, TransactionOptions } from 'sequelize';
import { Biz, UserQuery } from './utils';

export class ComponentBiz extends Biz {
  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const component = await this.services.dao.component.findOneById(
      context,
      id
    );
    if (!component) {
      throw new this.exception.ResourceNotFound('component');
    }
    return component;
  }

  async createComponentWithAssociations(
    override: UserQuery | undefined,
    payload: ComponentCreateWithAssociationBiz,
    opts: TransactionOptions = {}
  ) {
    const [userContext, tenantContext] = await Promise.all([
      this.userQuery.build(override),
      this.tenantQuery.build(override),
    ]);

    return this.services.dao.component.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
        ...opts,
      },
      async (transaction) => {
        if (
          !payload.component.analyticId &&
          !payload.component.componentTextId &&
          !payload.analytic &&
          !payload.componentText
        ) {
          throw new this.exception.InvalidPayload(
            'analytic or componentText required'
          );
        }

        let analytic: AnalyticAttr | undefined;
        if (payload.analytic) {
          analytic = await this.services.dao.analytic.create(
            {
              ...payload.analytic,
              createdById: this.user.id,
              tenantId: tenantContext.tenantId,
            },
            { transaction }
          );
        } else if (payload.component.analyticId) {
          analytic = await this.services.dao.analytic.findOneById(
            userContext,
            payload.component.analyticId
          );
        }

        let componentText: ComponentTextAttr | undefined;
        if (payload.componentText) {
          componentText = await this.services.dao.componentText.create(
            {
              ...payload.componentText,
            },
            { transaction }
          );
        } else if (payload.component.componentTextId) {
          componentText = await this.services.dao.componentText.findOneById(
            userContext,
            payload.component.componentTextId
          );
        }

        return this.services.dao.component.create(
          {
            ...payload.component,
            analyticId: analytic?.id,
            componentTextId: componentText?.id,
            createdById: this.user.id,
            tenantId: tenantContext.tenantId,
          },
          { transaction }
        );
      }
    );
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: ComponentModifyBiz,
    opts: TransactionOptions = {}
  ) {
    const context = await this.userQuery.build(override);

    // ensure component exists
    await this.getOneById(override, id);

    const component = await this.services.dao.component.updateById(
      context,
      id,
      payload,
      opts
    );

    return component!;
  }

  async updateComponentAnalytic(
    override: UserQuery | undefined,
    componentId: string,
    payload: AnalyticModifyBiz
  ) {
    const component = await this.getOneById(override, componentId);
    if (!component.analyticId) {
      throw new this.exception.Conflict('unable to update analytic');
    }

    const analytic = await this.services.biz.analytic.getOneById(
      override,
      component.analyticId
    );
    const isPublic = !analytic.tenantId && !analytic.createdById;

    // not public, custom made, simply update the analytic
    if (!isPublic) {
      return this.services.biz.analytic.updateById(
        override,
        component.analyticId,
        payload
      );
    }

    // component is pointed at public analytic, need to do the following:
    // 1. clone the public analytic with updated fields
    // 2. update the component to point at the new analytic
    return this.services.dao.component.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      },
      async (transaction) => {
        const [userContext, tenantContext] = await Promise.all([
          this.userQuery.build(override),
          this.tenantQuery.build(override),
        ]);

        const { id, createdAt, updatedAt, ...rest } = analytic;
        const analyticClone = {
          ...rest,
          ...payload,
          createdById: this.user.id,
          tenantId: tenantContext.tenantId,
        };

        const newAnalytic = await this.services.dao.analytic.create(
          analyticClone,
          { transaction }
        );
        await this.services.dao.component.updateById(
          userContext,
          componentId,
          {
            analyticId: newAnalytic.id,
          },
          { transaction }
        );

        return newAnalytic;
      }
    );
  }

  async deleteById(
    override: UserQuery | undefined,
    id: string,
    opts: TransactionOptions = {}
  ) {
    // ensure existence
    const component = await this.getOneById(override, id);

    return this.services.dao.component.transaction(
      opts,
      async (transaction) => {
        await this.services.dao.component.deleteById({}, id, {
          transaction,
        });

        if (component.analyticId) {
          await this.services.dao.analytic.deleteById(
            {},
            component.analyticId,
            { transaction }
          );
        }
        if (component.componentTextId) {
          await this.services.dao.componentText.deleteById(
            {},
            component.componentTextId,
            { transaction }
          );
        }
      }
    );
  }

  async deleteByIds(
    override: UserQuery | undefined,
    ids: string[],
    opts: TransactionOptions = {}
  ) {
    if (ids.length === 0) {
      return;
    }
    const context = await this.userQuery.build(override);

    return this.services.dao.component.transaction(
      opts,
      async (transaction) => {
        const components = await this.services.dao.component.findAllById(
          context,
          ids
        );

        const promises = [];

        // TODO determine whether a single component should be assignable to multiple dashboards
        if (components.length > 0) {
          promises.push(
            this.services.dao.component.deleteById(
              context,
              components.map(({ id }) => id),
              {
                transaction,
              }
            )
          );
        }

        const analyticIds = components
          .map(({ analyticId }) => analyticId)
          .filter((analyticId) => !!analyticId) as string[];
        if (analyticIds.length > 0) {
          promises.push(
            this.services.dao.analytic.deleteById({}, analyticIds, {
              transaction,
            })
          );
        }
        const componentTextIds = components
          .map(({ componentTextId }) => componentTextId)
          .filter((componentTextId) => !!componentTextId) as string[];
        if (componentTextIds.length > 0) {
          promises.push(
            this.services.dao.componentText.deleteById({}, componentTextIds, {
              transaction,
            })
          );
        }

        await Promise.all(promises);
      }
    );
  }
}
