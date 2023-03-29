'use strict';

const { Op } = require('sequelize');

const TABLE = 'rpmg_transaction';

const seeds = [
  {
    id: '62861b34-d50b-442f-ad4a-79ae47bf91ec',
    name: 'Percentage of Transactions $2,500 or Less Paid by...',
    range: '<2500',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2b4ac706-e424-467a-be27-001bdfb4eb27',
    name: 'Percentage of Transactions $2,500 to $10,000 Paid by...',
    range: '2500-10000',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'c47b1804-99a2-44f6-a0f5-553bd6ad4957',
    name: 'Percentage of Transactions $10,000 to $100,000 Paid by...',
    range: '10000-100000',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'b3ecff57-6bd8-47df-859e-f6977ad1c2ad',
    name: 'Percentage of Transactions Above $100,000 Paid by...',
    range: '>100000',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      return Promise.all(
        seeds.map(async (seed) => {
          const entryId = await queryInterface.rawSelect(
            TABLE,
            { where: { id: seed.id } },
            ['id']
          );

          if (entryId) {
            delete seed.id;
            delete seed.created_at;
            await queryInterface.bulkUpdate(TABLE, seed, { id: entryId });
          } else {
            return queryInterface.bulkInsert(TABLE, [seed], {});
          }
        })
      );
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete(TABLE, {
      [Op.or]: seeds.map(({ name, range }) => ({
        name,
        range,
      })),
    });
  },
};
