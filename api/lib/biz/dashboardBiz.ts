import { Pagination } from 'lib/dao';
import {
  AnalyticModifyBiz,
  ComponentQueryBiz,
  ComponentTextQueryBiz,
  DashboardAddComponentBiz,
  DashboardCreateBiz,
  DashboardDefaultBiz,
  DashboardModifyBiz,
  DashboardModifyComponentBiz,
  DashboardQueryBiz,
} from 'lib/middlewares/sequelize';
import { Transaction, TransactionOptions } from 'sequelize';
import { Biz, UserQuery } from './utils';

const defaultDashboardNames = [
  'Overview',
  'Portfolio',
  'Deal',
  'Activities',
  'Training',
];
const defaultInsightComponents = {
  'S&P Breakdown': {
    text: 'Temporary placeholder. WCR: $.sp.working_capital_ratio, DPO: $.sp.days_payable_out, DSO: $.sp.days_sales_out',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
    },
    type: 'bar' as const,
    source: 'spGlobal' as const,
    enabled: true,
  },
  'Days Payable Outstanding (DPO)': {
    text: '$.sp.days_payable_out DAYS. The average Days Payable Outstanding (DPO) of your peer group.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
    },
    type: 'calendar' as const,
    source: 'spGlobal' as const,
    enabled: true,
  },
  'Days Sales Outstanding (DSO)': {
    text: '$.sp.days_sales_out DAYS. The average Days Sales Outstanding (DSO) of your peer group.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
    },
    type: 'calendar' as const,
    source: 'spGlobal' as const,
    enabled: true,
  },
  'Commercial Card': {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].all_card_platforms% of all payables between $.selectedResponseOptionKey by commercial card, providing a substantial increase in Days Payable.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donutSelection' as const,
    source: 'rpmg' as const,
    enabled: false,
  },
  'Commercial Card D': {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].all_card_platforms% of all payables between $.selectedResponseOptionKey by commercial card, providing a substantial increase in Days Payable.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donut' as const,
    source: 'rpmg' as const,
    enabled: true,
  },
  ACH: {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].ach% of all payables between $.selectedResponseOptionKey by ACH.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donutSelection' as const,
    source: 'rpmg' as const,
    enabled: false, // creating donutSelection ones need to be enabled false by default so that user can select from modal when adding a new block by selected range value
  },
  ACH_D: {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].ach% of all payables between $.selectedResponseOptionKey by ACH.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donut' as const,
    source: 'rpmg' as const,
    enabled: true,
  },
  Checks: {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].checks% of all payables between $.selectedResponseOptionKey by Check.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donutSelection' as const,
    source: 'rpmg' as const,
    enabled: false,
  },
  Checks_D: {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].checks% of all payables between $.selectedResponseOptionKey by Check.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donut' as const,
    source: 'rpmg' as const,
    enabled: true,
  },
  Wires: {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].wire_transfer% of all payables between $.selectedResponseOptionKey by Wire.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donutSelection' as const,
    source: 'rpmg' as const,
    enabled: false,
  },
  Wires_D: {
    text: 'On average, your peers pay $.rpmg.transaction_summary[].wire_transfer% of all payables between $.selectedResponseOptionKey by Wire.',
    request: {
      method: 'GET' as const,
      path: '/organizations/:organizationId/insights',
      responseOptionKey: '$.rpmg.transaction_summary[].transaction.range',
    },
    type: 'donut' as const,
    source: 'rpmg' as const,
    enabled: true, // creating donut ones by default for showing in report
  },
  'Faster Payments $2.50': {
    text: '<div class="col"><p class="mb-0"><p class="mb-2 font-size-sm2 font-weight-medium">A savings of $2.50 per item can be realized by moving from checks to digital payments.</p></p></div><div class="text-center col-md-4"><h1 class="text-success mb-0 font-size-3em font-weight-bold">$2.50</h1><p class="font-size-xs mb-0 font-weight-semi-bold">Savings</p></div>',
    request: undefined,
    type: 'iconText' as const,
    source: 'fasterPayments' as const,
    enabled: true,
  },
  'Faster Payments 80% DDAs': {
    text: '<div class="col"><p class="mb-0"><p class="mb-2 font-size-sm2 font-weight-medium">Faster payments networks now enable instant payments to be sent to approximately 80% of the DDAs in the United States.</p></p></div><div class="text-center col-md-4"><h1 class="text-success mb-0 font-size-3em font-weight-bold">80%</h1><p class="font-size-xs mb-0 font-weight-semi-bold">DDAs</p></div></div>',
    request: undefined,
    type: 'iconText' as const,
    source: 'fasterPayments' as const,
    enabled: true,
  },
  'Faster Payments Database Icon': {
    text: '<div class="col"><p class="mb-0"><p class="mb-2 font-size-sm2 font-weight-medium">Structured data contained in faster payments messages enables greater automation of payments approvals and compliance processes.</p></p></div><div class="text-center col-md-4"><p class="mb-0"><i class="material-icons-outlined text-blue font-size-6xl">waves</i></p><p class="font-size-xs mb-0 font-weight-semi-bold">Faster Payments</p></div></div>',
    request: undefined,
    type: 'iconText' as const,
    source: 'fasterPayments' as const,
    enabled: true,
  },
  'Faster Payments Message Icon': {
    text: '<div class="col"><p class="mb-0"><p class="mb-2 font-size-sm2 font-weight-medium">The ability to send a request for payment message, including a link to the relevant invoice contained within a bank-grade security environment, creates efficiencies for the sender and receiver.</p></p></div><div class="text-center col-md-4"><p class="mb-0"><i class="material-icons-outlined text-black font-size-6xl">info</i></p><p class="font-size-xs mb-0 font-weight-semi-bold">Legal</p></div></div>',
    request: undefined,
    type: 'iconText' as const,
    source: 'fasterPayments' as const,
    enabled: true,
  },
  'Faster Payments Automation Icon': {
    text: '<div class="col"><p class="mb-0"><p class="mb-2 font-size-sm2 font-weight-medium">Structured data contained in faster payments messages enables greater automation of reconciliation processes.</p></p></div><div class="text-center col-md-4"><p class="mb-0"><i class="material-icons-outlined text-blue font-size-6xl">dvr</i></p><p class="font-size-xs mb-0 font-weight-semi-bold">Faster Payments</p></div></div>',
    request: undefined,
    type: 'iconText' as const,
    source: 'fasterPayments' as const,
    enabled: true,
  },
};

export class DashboardBiz extends Biz {
  async get(
    override: UserQuery | undefined,
    pagination: Pagination,
    query: DashboardQueryBiz
  ) {
    const context = await this.userQuery.build(override);

    return this.services.dao.dashboard.find(context, pagination, query);
  }

  async getComponentsById(
    override: UserQuery | undefined,
    id: string,
    pagination: Pagination,
    query: ComponentTextQueryBiz & ComponentQueryBiz
  ) {
    const context = await this.userQuery.build(override);

    // ensure dashboard exists
    await this.getOneById(override, id);

    return this.services.dao.dashboardComponent.findOneByDashboardIdWithAssociations(
      context,
      id,
      pagination,
      query
    );
  }

  async getOneById(
    override: UserQuery | undefined,
    id: string,
    opts: TransactionOptions = {}
  ) {
    const context = await this.userQuery.build(override);

    const dashboard = await this.services.dao.dashboard.findOneById(
      context,
      id,
      opts
    );
    if (!dashboard) {
      throw new this.exception.ResourceNotFound('dashboard');
    }
    return dashboard;
  }

  async getOneDashboardComponentByCompositeIds(
    override: UserQuery | undefined,
    id: string,
    componentId: string
  ) {
    const dashboardComponent =
      await this.services.dao.dashboardComponent.findOneByCompositeIds(
        id,
        componentId
      );
    if (!dashboardComponent) {
      throw new this.exception.ResourceNotFound('dashboardComponent');
    }
  }

  async create(
    override: UserQuery | undefined,
    payload: DashboardCreateBiz,
    opts: TransactionOptions = {}
  ) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.dashboard.create(
      {
        ...payload,
        createdById: this.user.id,
        tenantId: context.tenantId,
      },
      opts
    );
  }

  async createDefault(
    override: UserQuery | undefined,
    payload: DashboardDefaultBiz
  ) {
    if (payload.type === 'dashboard') {
      return this.createDefaultDashboards(override);
    } else if (payload.type === 'insight') {
      // TODO
      // if its a guest, this will enforce an organization match, however this should
      // be done in creation context or something... revisit it later
      await this.userQuery.build({
        ...override,
        organizationId: payload.organizationId,
      });
      // todo revisit this! this is a hack to get createdById set.. who should that be?
      if (this.user.jwt.scope === 'guest') {
        this.user.id = this.user.jwt.shared_by_id;
      }

      return this.createDefaultInsights(override, payload.organizationId);
    } else {
      throw new this.exception.InvalidPayload();
    }
  }

  async createDefaultDashboards(override: UserQuery | undefined) {
    const context = await this.tenantQuery.build(override);

    const dashboards = await this.services.dao.dashboard.transaction(
      async (transaction) => {
        const transactionOpts = {
          transaction,
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
        };

        const [publicAnalytics, existingDashboards] = await Promise.all([
          this.services.dao.analytic.findAllPublic({}),
          this.services.dao.dashboard.findAllByName(
            context,
            defaultDashboardNames,
            { type: 'dashboard' }
          ),
        ]);

        const dashboardsToCreate = defaultDashboardNames.filter(
          (name) => !existingDashboards.some((d) => d.name === name)
        );
        const dashboards = await Promise.all(
          dashboardsToCreate.map((name) =>
            this.create(
              override,
              { name, type: 'dashboard', enabled: true },
              transactionOpts
            )
          )
        );

        const defaultMapping: { [K in string]: string[] } = {
          Overview: [
            'Total Revenue',
            'Contacts Created',
            'Deals Won',
            'Deals Lost',
            'Activity Breakdown',
            'Top 5 Organizations',
            'Open Deals',
          ],
          Portfolio: [
            'Total Accounts',
            'Revenue By Product',
            'Top Products',
            'Latest Accounts',
          ],
          Deal: [
            'Open Deals',
            'Deals Won',
            'Deals Lost',
            'Revenue Won',
            'Monthly Revenue By User',
            'Top 5 Users by Deals Won',
            'Top 5 Users by Deals Lost',
            'Top Revenue by User',
          ],
          Activities: [
            'Total Activities',
            'Activity Breakdown',
            'Open Tasks',
            'Closed Tasks',
            'Overdue Tasks',
          ],
          Training: [
            'Top 5 Completed Lessons',
            'Top 5 Completed Courses',
            'Top 5 Users by Lessons Completed',
            'Top 5 Users by Courses Completed',
            'Lessons Open',
            'Lessons Completed',
          ],
        };

        await Promise.all(
          dashboards.map(async (dashboard) => {
            const newComponents = publicAnalytics
              // ensure dashboard exists in mapping
              .filter(() => {
                return !!defaultMapping[dashboard.name];
              })
              .filter((analytic) => {
                return defaultMapping[dashboard.name].includes(analytic.name);
              })
              .map((analytic) => {
                return {
                  component: {
                    name: analytic.name,
                    analyticId: analytic.id,
                  },
                };
              });

            await Promise.all(
              newComponents.map((component) =>
                this.addComponent(
                  override,
                  dashboard.id,
                  component,
                  transactionOpts
                )
              )
            );
          })
        );

        return dashboards;
      }
    );

    return dashboards;
  }

  async createDefaultInsights(
    override: UserQuery | undefined,
    organizationId: string
  ) {
    const context = await this.tenantQuery.build(override);

    const insights = await this.services.dao.dashboard.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      },
      async (transaction) => {
        const existingInsights =
          await this.services.dao.dashboard.findAllByName(
            context,
            ['Custom Report'],
            { type: 'insight', organizationId }
          );

        if (existingInsights.length > 0) {
          return [];
        }

        const insight = await this.create(
          override,
          {
            name: 'Custom Report',
            type: 'insight',
            enabled: true,
            organizationId,
          },
          { transaction }
        );

        await Promise.all(
          Object.entries(defaultInsightComponents).map(
            async ([name, component]) => {
              return this.addComponent(
                override,
                insight.id,
                {
                  component: {
                    name,
                    enabled: component.enabled,
                  },
                  componentText: {
                    text: component.text,
                    request: component.request,
                    type: component.type,
                    source: component.source,
                  },
                },
                { transaction }
              );
            }
          )
        );

        return [insight];
      }
    );

    return insights;
  }

  async addComponent(
    override: UserQuery | undefined,
    id: string,
    payload: DashboardAddComponentBiz,
    opts: TransactionOptions = {}
  ) {
    // ensure dashboard exists
    await this.getOneById(override, id, opts);

    const component = await this.services.dao.dashboardComponent.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
        ...opts,
      },
      async (transaction) => {
        // TODO restrict unique analyticId to 1 per dashboard?

        const component =
          await this.services.biz.component.createComponentWithAssociations(
            override,
            payload,
            { transaction }
          );

        await this.services.dao.dashboardComponent.create(
          {
            dashboardId: id,
            componentId: component.id,
          },
          { transaction }
        );

        return component;
      }
    );

    return component;
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: DashboardModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const dashboard = await this.services.dao.dashboard.updateById(
      context,
      id,
      payload
    );
    if (!dashboard) {
      throw new this.exception.ResourceNotFound('dashboard');
    }
    return dashboard;
  }

  async updateComponent(
    override: UserQuery | undefined,
    id: string,
    componentId: string,
    payload: DashboardModifyComponentBiz
  ) {
    // ensure dashboard exists
    await this.getOneById(override, id);

    const updated = await this.services.dao.dashboardComponent.transaction(
      async (transaction) => {
        if (payload.component) {
          const component = await this.services.biz.component.updateById(
            override,
            componentId,
            payload.component,
            { transaction }
          );

          return { component };
        }

        return {};
      }
    );

    return updated;
  }

  async updateComponentAnalytic(
    override: UserQuery | undefined,
    id: string,
    componentId: string,
    payload: AnalyticModifyBiz
  ) {
    // ensure dashboard exists
    await this.getOneById(override, id);

    await this.getOneDashboardComponentByCompositeIds(
      override,
      id,
      componentId
    );

    return this.services.biz.component.updateComponentAnalytic(
      override,
      componentId,
      payload
    );
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    // ensure dashboard exists
    await this.getOneById(override, id);

    await this.services.dao.dashboard.transaction(async (transaction) => {
      const dashboardComponents =
        await this.services.dao.dashboardComponent.findAllByDashboardId(id);
      await this.services.dao.dashboardComponent.deleteByDashboardId(id, {
        transaction,
      });

      const componentIds = dashboardComponents.map(
        ({ componentId }) => componentId
      );
      await this.services.biz.component.deleteByIds(override, componentIds, {
        transaction,
      });

      await this.services.dao.dashboard.deleteById({}, id, { transaction });
    });

    return;
  }

  async removeComponent(
    override: UserQuery | undefined,
    id: string,
    componentId: string
  ) {
    // ensure dashboard exists
    await this.getOneById(override, id);

    await this.services.dao.dashboardComponent.transaction(
      async (transaction) => {
        // TODO create typed resource errors
        await this.getOneDashboardComponentByCompositeIds(
          override,
          id,
          componentId
        );

        await this.services.dao.dashboardComponent.deleteByCompositeIds(
          id,
          componentId,
          {
            transaction,
          }
        );

        await this.services.biz.component.deleteById(override, componentId, {
          transaction,
        });
      }
    );

    return;
  }
}
