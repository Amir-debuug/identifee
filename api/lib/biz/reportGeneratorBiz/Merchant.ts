import { ContextMiddleware } from 'lib/middlewares/context';
import { Fiserv } from 'lib/providers';
import { AwaitFn } from 'lib/utils';
import { MerchantOutput } from './utils';

export class Merchant {
  private readonly requestDate: string;
  private readonly site: AwaitFn<Fiserv['getSitesSearch']>['body'][number];
  private readonly fundingSummary: AwaitFn<
    Fiserv['getFundingSummary']
  >['body']['0'];
  private readonly fundingSummaryByNetwork: AwaitFn<
    Fiserv['getFundingSummaryByNetwork']
  >['body'];
  private readonly settlementSummary: AwaitFn<
    Fiserv['getSettlementSummary']
  >['body']['0'];
  private readonly authorizationSummary: AwaitFn<
    Fiserv['getAuthorizationSummary']
  >['body']['0'];

  public output?: MerchantOutput;

  static async init(
    req: ContextMiddleware,
    query: {
      fromDate: string;
      toDate: string;
      siteId: string;
    }
  ) {
    const request = {
      body: {
        fromDate: query.fromDate,
        toDate: query.toDate,
        filters: {
          siteIDs: [query.siteId],
        },
      },
    };

    const [
      { body: fundingSummary },
      { body: fundingSummaryByNetwork },
      { body: settlementSummary },
      { body: authorizationSummary },
      { body: sites },
    ] = await Promise.all([
      req.services.providers.fiserv.getFundingSummary({
        body: { ...request.body },
      }),
      req.services.providers.fiserv.getFundingSummaryByNetwork({
        body: { ...request.body },
      }),
      req.services.providers.fiserv.getSettlementSummary({
        body: { ...request.body },
      }),
      req.services.providers.fiserv.getAuthorizationSummary({
        body: { ...request.body },
      }),
      req.services.providers.fiserv.getSitesSearch(),
    ]);

    const site = sites.find(({ corpID }) => corpID === query.siteId);
    if (!site) {
      throw new Error('site not found');
    }

    const instance = new Merchant({
      requestDate: `${query.fromDate} - ${query.toDate}`,
      site,
      fundingSummary: fundingSummary[0],
      fundingSummaryByNetwork,
      settlementSummary: settlementSummary[0],
      authorizationSummary: authorizationSummary[0],
    });
    await instance.calculate();

    return instance;
  }

  private constructor(opts: {
    requestDate: string;
    site: AwaitFn<Fiserv['getSitesSearch']>['body'][number];
    fundingSummary: AwaitFn<Fiserv['getFundingSummary']>['body']['0'];
    fundingSummaryByNetwork: AwaitFn<
      Fiserv['getFundingSummaryByNetwork']
    >['body'];
    settlementSummary: AwaitFn<Fiserv['getSettlementSummary']>['body']['0'];
    authorizationSummary: AwaitFn<
      Fiserv['getAuthorizationSummary']
    >['body']['0'];
  }) {
    this.requestDate = opts.requestDate;
    this.site = opts.site;
    this.fundingSummary = opts.fundingSummary;
    this.fundingSummaryByNetwork = opts.fundingSummaryByNetwork;
    this.settlementSummary = opts.settlementSummary;
    this.authorizationSummary = opts.authorizationSummary;
  }

  async calculate() {
    const totalTransactions = this.settlementSummary.salesCount;
    const totalFees =
      this.fundingSummary.processedICCharges +
      this.fundingSummary.processedServiceCharges +
      this.fundingSummary.processedFees;
    const averageFee = totalFees / totalTransactions;

    const totalDollarsProcessed = this.settlementSummary.salesAmount;
    const averageTransaction = totalDollarsProcessed / totalTransactions;
    const effectiveRate = totalFees / totalDollarsProcessed;

    const authorizationAttempts = this.authorizationSummary.countTotal;
    const authorizationApprovals = this.authorizationSummary.approvedCount;
    const authorizationToApprovalRate =
      authorizationApprovals / authorizationAttempts;

    const refundAmount = this.settlementSummary.refundAmount;
    const salesAmount = this.settlementSummary.salesAmount;
    const refundPercentage = refundAmount / salesAmount;

    const chargeBackCount = this.settlementSummary.cbaAmount;
    const chargeBackPercentage = chargeBackCount / totalTransactions;

    const interchangeFees = this.fundingSummary.processedICCharges / totalFees;
    const serviceFees = this.fundingSummary.processedServiceCharges / totalFees;
    const processorFees = this.fundingSummary.processedFees / totalFees;
    const feesPercentageNotControlledByBank = interchangeFees + processorFees;

    const networks = this.fundingSummaryByNetwork.map((fundingSummary) => {
      const dollarsProcessed = fundingSummary.processedNetSales;
      const interchangeFees = fundingSummary.processedICCharges;
      const networkCharges = fundingSummary.processedFees;

      return {
        type: fundingSummary.value,
        feePercentage:
          (interchangeFees + networkCharges) /
          (this.fundingSummary.processedICCharges +
            this.fundingSummary.processedFees),
        dollarsProcessed,
        interchangeFees,
        networkCharges,
      };
    });

    this.output = {
      type: 'MERCHANT',
      name: this.site.Name,
      requestDate: this.requestDate,
      totalTransactions,
      totalFees,
      averageFee,
      totalDollarsProcessed,
      averageTransaction,
      effectiveRate,
      authorizationAttempts,
      authorizationApprovals,
      authorizationToApprovalRate,
      refundAmount,
      salesAmount,
      refundPercentage,
      chargeBackCount,
      chargeBackPercentage,
      interchangeFees,
      serviceFees,
      processorFees,
      feesPercentageNotControlledByBank,
      networks,
    };

    return this.output;
  }
}
