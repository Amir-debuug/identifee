import CryptoJS from 'crypto-js';
import { OtelMiddleware } from 'lib/middlewares/opentelemetry';
import { v4 } from 'uuid';
import { Rest } from './Rest';

export type FiservRequest = {
  body: FiservQuery;
};

export type FiservQuery = {
  fromDate: string;
  toDate: string;
  summaryBy?:
    | 'Category'
    | 'WorkType'
    | 'Disposition'
    | 'Status'
    | 'WinLoss'
    | 'TxnDay'
    | 'TxnWeek'
    | 'TxnMonth'
    | 'TxnQuarter'
    | 'TxnYear'

    // funding/summary
    | 'MajorCategory'
    | 'MinorCategory'
    | 'ProductCode'
    | 'DdaLast4'
    | 'BatchDate'
    | 'FundedDate';
  filters?: {
    dateType?:
      | 'AuthDate'
      | 'ChargebackDate'
      | 'StatusDate'
      | 'AdjustmentDate'
      | 'DueDate'
      | 'RecordDate';
    siteIDs?: string[];
    approvalCodes?: ['Declined'] | ['Approved'];
  };
};

let sites: { Name: string; corpID: string }[] = [];

export class Fiserv extends Rest {
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    req: OtelMiddleware,
    opts: { apiKey: string; apiSecret: string },
    restOpts: { host: string }
  ) {
    super(req, restOpts);

    this.apiKey = opts.apiKey;
    this.apiSecret = opts.apiSecret;
  }

  async getChargebackSearch(opts: FiservRequest) {
    return this.request('/reporting/v1/chargeback/search', {
      ...opts,
      method: 'POST',
    });
  }

  async getChargebackSummary(opts: FiservRequest) {
    return this.request('/reporting/v1/chargeback/summary', {
      ...opts,
      method: 'POST',
    });
  }

  async getCommerceHubSearch(opts: FiservRequest) {
    return this.request('/reporting/v1/commercehub/search', {
      ...opts,
      method: 'POST',
    });
  }

  async getCommerceHubSummary(opts: FiservRequest) {
    return this.request('/reporting/v1/commercehub/summary', {
      ...opts,
      method: 'POST',
    });
  }

  async getDisbursementSearch(opts: FiservRequest) {
    return this.request('/reporting/v1/disbursement/search', {
      ...opts,
      method: 'POST',
    });
  }

  async getDisbursementSummary(opts: FiservRequest) {
    return this.request('/reporting/v1/disbursement/summary', {
      ...opts,
      method: 'POST',
    });
  }

  async getFundingSearch(opts: FiservRequest) {
    return this.request('/reporting/v1/funding/search', {
      ...opts,
      method: 'POST',
    });
  }

  async getFundingSummary(opts: FiservRequest) {
    return this.request<
      [
        {
          currency: string; // ex: USD
          processedNetSales: number;
          processedPaidByOthers: number;
          processedAdjustments: number;
          processedICCharges: number;
          processedServiceCharges: number;
          processedFees: number;
          processedChargebacksReversals: number;
          processedDeposit: number;
          processedAmountPaid: number;
        }
      ]
    >('/reporting/v1/funding/summary', {
      ...opts,
      method: 'POST',
    });
  }

  async getFundingSummaryByNetwork(opts: FiservRequest) {
    const filteredOpts = JSON.parse(JSON.stringify(opts));
    filteredOpts.body.filters = { ...filteredOpts.body.filters };
    filteredOpts.body.summaryBy = 'ProductCode';

    return this.request<
      {
        currency: string; // ex: USD
        value: 'MASTERCARD' | 'VISA' | 'AMEX' | 'MISCELLANEOUS';
        processedNetSales: number;
        processedPaidByOthers: number;
        processedAdjustments: number;
        processedICCharges: number;
        processedServiceCharges: number;
        processedFees: number;
        processedChargebacksReversals: number;
        processedDeposit: number;
        processedAmountPaid: number;
      }[]
    >('/reporting/v1/funding/summary', {
      ...filteredOpts,
      method: 'POST',
    });
  }

  // Caching this as there is no way to filter by siteID which is corpID in this case
  async getSitesSearch() {
    if (sites.length > 0) {
      return {
        body: sites,
        statusCode: 200,
      };
    }

    const { body, statusCode } = await this.request<
      {
        Name: string;
        // ex: 123456789
        corpID: string;
      }[]
    >('/reporting/v1/reference/sites/search', {
      method: 'POST',
      body: {
        fields: ['Name', 'CorpID'],
      },
    });

    sites = body;
    return { body, statusCode };
  }

  async getRetrievalSearch(opts: FiservRequest) {
    return this.request('/reporting/v1/retrieval/search', {
      ...opts,
      method: 'POST',
    });
  }

  async getRetrievalSummary(opts: FiservRequest) {
    return this.request('/reporting/v1/retrieval/summary', {
      ...opts,
      method: 'POST',
    });
  }

  async getSettlementSearch(opts: FiservRequest) {
    return this.request('/reporting/v1/settlement/search', {
      ...opts,
      method: 'POST',
    });
  }

  async getSettlementSummary(opts: FiservRequest) {
    return this.request<
      [
        {
          currency: string; // ex: USD
          salesCount: number;
          refundCount: number;
          rejectCount: number;
          salesAmount: number;
          refundAmount: number;
          rejectAmount: number;
          netAmount: number;
          interchangeAmount: number;
          switchAmount: number;
          isaAmount: number;
          adminAmount: number;
          ifAmount: number;
          networkSecurityAmount: number;
          acquirerAmount: number;
          cbaAmount: number;
        }
      ]
    >('/reporting/v1/settlement/summary', {
      ...opts,
      method: 'POST',
    });
  }

  async getAuthorizationSearch(opts: FiservRequest) {
    return this.request('/reporting/v1/authorization/search', {
      ...opts,
      method: 'POST',
    });
  }
  async getAuthorizationSearchByDeclined(opts: FiservRequest) {
    const filteredOpts = JSON.parse(JSON.stringify(opts));
    filteredOpts.body.filters = { ...filteredOpts.body.filters };
    filteredOpts.body.filters.approvalCodes = ['Declined'];
    return this.getAuthorizationSearch(filteredOpts);
  }
  async getAuthorizationSearchByApproved(opts: FiservRequest) {
    const filteredOpts = JSON.parse(JSON.stringify(opts));
    filteredOpts.body.filters = { ...filteredOpts.body.filters };
    filteredOpts.body.filters.approvalCodes = ['Approved'];
    return this.getAuthorizationSearch(filteredOpts);
  }

  async getAuthorizationSummary(opts: FiservRequest) {
    return this.request<
      [
        {
          currency: string; // ex: USD
          countTotal: number;
          amountTotal: number;
          approvedCount: number;
        }
      ]
    >('/reporting/v1/authorization/summary', {
      ...opts,
      method: 'POST',
    });
  }
  async getAuthorizationSummaryByApproved(opts: FiservRequest) {
    const filteredOpts = JSON.parse(JSON.stringify(opts));
    filteredOpts.body.filters = { ...filteredOpts.body.filters };
    filteredOpts.body.filters.approvalCodes = ['Approved'];
    return this.getAuthorizationSummary(filteredOpts);
  }
  async getAuthorizationSummaryByDeclined(opts: FiservRequest) {
    const filteredOpts = JSON.parse(JSON.stringify(opts));
    filteredOpts.body.filters = { ...filteredOpts.body.filters };
    filteredOpts.body.filters.approvalCodes = ['Declined'];
    return this.getAuthorizationSummary(filteredOpts);
  }

  protected async request<T extends {} = {}>(
    path: string,
    opts: {
      method: 'POST' | 'GET' | 'PUT' | 'DELETE';
      body: { [key: string]: any };
      query?: { [key: string]: any };
      headers?: { [key: string]: any };
    }
  ) {
    return super.request<T>(path, {
      ...opts,
      headers: this.getAuthorizationHeaders(opts),
    });
  }

  protected getAuthorizationHeaders(opts: { body: { [key: string]: any } }) {
    const ClientRequestId = v4();
    const time = new Date().getTime();
    const rawSignature =
      this.apiKey + ClientRequestId + time + JSON.stringify(opts.body);

    const newHMAC = CryptoJS.algo.HMAC.create(
      CryptoJS.algo.SHA256,
      this.apiSecret
    );
    newHMAC.update(rawSignature);
    const finalizedHMAC = newHMAC.finalize();
    const computedHMAC = CryptoJS.enc.Base64.stringify(finalizedHMAC);

    return {
      'Client-Request-Id': ClientRequestId,
      'Api-Key': this.apiKey,
      Timestamp: time.toString(),
      Authorization: computedHMAC,
      'Auth-Token-Type': 'HMAC',
    };
  }
}
