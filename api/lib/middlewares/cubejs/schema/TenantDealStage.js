import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('TenantDealStage', {
  sql: 'SELECT * FROM public.tenant_deal_stage',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('tenant_deal_stage', 'created_at')}`,
  },

  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: ['DealStage'],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
      shown: false,
    },
    name: {
      sql: 'name',
      title: 'Stage',
      type: 'string',
    },
    createdAt: {
      sql: 'created_at',
      type: 'time',
    },
  },
});
