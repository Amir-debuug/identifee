import { ReportTreasuryService } from 'lib/middlewares/sequelize';

export type MerchantOutput = {
  type: 'MERCHANT';
  name: string;
  requestDate: string;
  totalTransactions: number;
  totalFees: number;
  averageFee: number;
  totalDollarsProcessed: number;
  averageTransaction: number;
  effectiveRate: number;
  authorizationAttempts: number;
  authorizationApprovals: number;
  authorizationToApprovalRate: number;
  refundAmount: number;
  salesAmount: number;
  refundPercentage: number;
  chargeBackCount: number;
  chargeBackPercentage: number;
  interchangeFees: number;
  serviceFees: number;
  processorFees: number;
  feesPercentageNotControlledByBank: number;
  networks: {
    type: 'MASTERCARD' | 'VISA' | 'AMEX' | 'MISCELLANEOUS';
    dollarsProcessed: number;
    interchangeFees: number;
    networkCharges: number;
    feePercentage: number;
  }[];
};

export type TreasuryOutput = {
  type: 'TREASURY';
  client_name: string;
  proposed_bank_name: string;
  annual_services_savings: number; // currency
  annual_estimated_savings: number; // currency
  services: (ReportTreasuryService & {
    annual_savings: number;
  })[];
};

export type ReportOutput = TreasuryOutput | MerchantOutput;
