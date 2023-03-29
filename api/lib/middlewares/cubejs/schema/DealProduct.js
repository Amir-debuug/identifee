import { globalRefreshEvery, globalRefreshSql } from '../env';

cube('DealProducts', {
  sql: 'SELECT * FROM public.deal_products',
  dataSource: 'default',
  refreshKey: {
    every: `${globalRefreshEvery()}`,
    sql: `${globalRefreshSql('deal_products')}`,
  },

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Deal: {
      relationship: 'belongsTo',
      sql: `${CUBE.dealId} = ${Deal.id}`,
    },
    Products: {
      relationship: 'belongsTo',
      sql: `${CUBE.productId} = ${Products.id}`,
    }
  },
  measures: {
    meta: {
      description: 'Related Types. Informative only, DO NOT USE',
      meta: {
        relatedTypes: ['Deal'],
      },
      sql: '0',
      title: 'meta',
      type: 'number',
    },
    count: {
      drillMembers: [],
      type: 'count',
      description: 'Count of - Deal Products ',
    },
    sumOfUnitPrice: {
      sql: `${CUBE}.price * ${CUBE}.quantity`,
      type: 'sum',
      description: 'Sum of Unit Price - Products',
    },
    minimumOfUnitPrice: {
      sql: `${CUBE}.price * ${CUBE}.quantity`,
      type: 'min',
      description: 'Minimum of Unit Price - Products',
    },
    maximumOfUnitPrice: {
      sql: `${CUBE}.price * ${CUBE}.quantity`,
      type: 'max',
      description: 'Maximum of Unit Price - Products',
    },
    averageOfUnitPrice: {
      sql: `${CUBE}.price * ${CUBE}.quantity`,
      type: 'avg',
      description: 'Average of Unit Price - Products',
    },
  },

  dimensions: {
    id: {
      sql: 'id',
      type: 'string',
      primaryKey: true,
      shown: false,
    },

    price: {
      sql: 'price',
      type: 'number',
    },

    quantity: {
      sql: 'quantity',
      type: 'number',
    },
    dealId: {
      sql: 'deal_id',
      type: 'string',
    },

    productId: {
      sql: 'product_id',
      type: 'string',
    }
  },
});
