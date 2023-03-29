view(`Product`, {
  description: 'Training',
  includes: [],
  measures: {
    count: {
      sql: `${DealProducts.count}`,
      type: `number`,
      title: 'Count of products ',
      description: 'Count of- Products',
    },
    sumOfUnitPrice: {
      sql: `${DealProducts.sumOfUnitPrice}`,
      type: 'number',
      description: 'Sum of Unit Price - Products',
    },
    minimumOfUnitPrice: {
      sql: `${DealProducts.minimumOfUnitPrice}`,
      type: 'number',
      description: 'Minimum of Unit Price - Products',
    },
    maximumOfUnitPrice: {
      sql: `${DealProducts.maximumOfUnitPrice}`,
      type: 'number',
      description: 'Maximum of Unit Price - Products',
    },
    averageOfUnitPrice: {
      sql: `${DealProducts.averageOfUnitPrice}`,
      type: 'number',
      description: 'Average of Unit Price - Products',
    },
  },
  dimensions: {
    name: {
      sql: `${Products.name}`,
      type: `string`,
    },
    dealName: {
      sql: `${Deal.name}`,
      type: `string`,
      title: 'Deal Title',
    },
    ProductPrice: {
      sql: `${DealProducts.price * DealProducts.quantity}`,
      type: 'string',
    },
  },
});
