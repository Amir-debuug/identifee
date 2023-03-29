import {
  NaicsAttr,
  RpmgSummaryAttr,
  RpmgTransactionAttr,
} from 'lib/middlewares/sequelize';
import DAO from './utils/DAO';

export class RpmgDAO extends DAO<'RpmgVerticalDB'> {
  async findOneByCode(code: string) {
    const verticalSummary = await this.repo.findOne({
      include: [
        'summary',
        {
          association: 'transaction_summary',
          include: ['transaction'],
        },

        // restrict searching by code
        {
          association: 'naics',
          where: {
            code,
          },
          // remove unnecessary through attrs
          through: {
            attributes: [],
          },
          required: true,

          // BelongsToMany is really 1:M for RPMG Vertical:NAICS
          isSingleAssociation: true,
          isMultiAssociation: false,
        },
      ],
    });

    return this.toJSON<{
      naics: NaicsAttr;
      summary: RpmgSummaryAttr;
      transaction_summary: (RpmgTransactionAttr & {
        transaction: RpmgTransactionAttr;
      })[];
    }>(verticalSummary);
  }

  async findOneByDefault() {
    const verticalSummary = await this.repo.findOne({
      where: {
        industry: 'All Organizations',
      },
      include: [
        'summary',
        {
          association: 'transaction_summary',
          include: ['transaction'],
        },
      ],
    });
    if (!verticalSummary) {
      throw new this.exception.InternalServerError('missing migration');
    }

    const parsedSummary = this.toJSON<{
      naics: null;
      summary: RpmgSummaryAttr;
      transaction_summary: (RpmgTransactionAttr & {
        transaction: RpmgTransactionAttr;
      })[];
    }>(verticalSummary)!;
    parsedSummary.naics = null;

    return parsedSummary;
  }
}
