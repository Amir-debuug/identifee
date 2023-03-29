'use strict';

const table = 'lessons';

const defaultPublicLessons = [
  'Business Cards 101',
  'Interchange Fees',
  'Understanding Card Payments - Introduction',
  'What Are the Differences Between ACH and Wire Fraud?',
  '3 Phases of Rolling Out ISO 20022',
  'The Benefits of ISO 20022',
  'Lockbox 101',
  'What is Working Capital and Why is it Important?',
  'Market Insights - Healthcare Industry',
  'What is ACH Fraud?',
  'How Does Virtual Card Payment Reduce Fraud?',
  'How Do Companies Mitigate Wire Fraud?',
  'What Is Imposter Fraud? ',
  'What Industries Does Ransomware Impact Most? ',
  'What is the RTP® Network?',
  'Empathy',
  'What Is An Independent Sales Organization (ISO)?',
  'How To Guide: Contacting Support',
  'Merchant Acquiring Funds Flow',
  'How to Guide: Adding A Profile Picture',
  'What Are Some Instruments for Managing Liquidity Shortages?',
  'How to Guide: Resource Center',
  'FX Wires',
  'ACH NOC & Returns',
  'What Is Ransomware?',
  'SEC Codes Explained',
  'What Can Banks Do to Help Their Clients Reduce Fraud?',
  'How Do Real Time Payments (RTP) Reduce Fraud?',
  'What Is SWIFT (the Society for Worldwide Inter-Bank Financial Telecommunications)?',
  'Market Insights - Software Industry',
  'Market Insights - Nonprofit Industry',
  'The Benefits Of Interchange Plus Pricing',
  'The Parties Involved During A Card Transaction',
  'Brain Bits - Working From Home',
  'Brain Bits - Hope',
  'Brain Bits-CHANGE is a 4 Letter Word',
  'Presentation Skills',
  'The Science Of Creativity - Submerge',
  'Influence',
  'The MicroTry',
  'What Are Expense Management Systems?',
  'Why Is Merchant Services a Credit Product That Requires Underwriting Approval?',
  'Agile Mindset',
  'Attributes of Faster Payments Solutions',
  'Critical Thinking',
  'What Is The Card Payment Processing Cycle?',
  '"What Is Buy Now, Pay Later (BNPL)?"',
  'Benefits Of Level 2 And Level 3 Processing',
  'Connectivity and Personal Brand',
  'Tips For Conducting Professional Zoom Meetings',
  'Benefits Of Account Updater',
  'What is a Chargeback and why is it important to a business?',
  'What Is Same Day ACH?',
  'Welcome to Faster Payments 101',
  'Faster Payments Use Cases - G2C (Government to Consumer) and B2C (Business to Consumer) – Disbursements',
  '"Terminology: Same-Day Payment, Immediate, Instant"',
  'What Is A Card Acquirer?',
  'Using Data Effectively',
  'What Is A Payment Facilitator?',
  'Set The Agenda',
  'Welcome To The Treasury Sales Strategy Course!',
  'The Introduction',
  'No More Feature Dumping',
  'Ask The Right Questions',
  'Welcome To The Understanding Card Payments Course!',
  'Terminology: Information Formatting & ISO 20022 Payment Message Formats',
  'Payment Flow Terminology',
  'Growth Mindset',
  'Emotional Resilience',
  'Physical Resilience',
  'Social Support',
  'Cognitive Overload',
  'How Purpose Affects Resilience',
  'What Is A Card Issuer?',
  'The Science Of Creativity - Diverge',
  'Brain Bits - Your Sanity',
  'Prerequisites for ISO 20022',
  'What Is Enterprise Risk Management and Why Is It Important?',
  'What is Check Fraud?',
  'Payment Technology - Nonprofit Use Case',
  'How To Read A Balance Sheet',
  'Market Insights - Finance Industry',
  'What Are the Impacts and Implications of ISO 20022?',
  'Faster Payments Strategy',
  'Value Added Services – Confirmation of Payee',
  'Value Added Services – Request for Payment',
  'What is The Clearing House?',
  'Value Added Services - Overview',
  'What Are the Key Treasury Functions Related to Financial Risk?',
  'What Are the Differences Between Personal and Business Check Fraud?',
  'How Do Companies Mitigate Check Fraud?',
  'Faster Payments Use Cases - P2P (Peer to Peer)',
  'How Do Companies Mitigate ACH Fraud?',
  'Industry Issues: Interoperability',
  'What Are the Risks and Benefits of Sending Cryptocurrency? ',
  'What Is Email Business Compromise (EBC)?',
  'Industry Issues: Directory Services Overview',
  'Industry Issues: Directory Services Characteristics',
  'Faster Payments Use Cases - B2B (Business to Business)',
  'What are Faster Payments?',
  'What Are Internal Controls for a Treasury Department?',
  'How Do Treasurers Manage Cash Surpluses?',
  'What Is Liquidity Management?',
  'What Is Cryptocurrency?',
  'What Industries Are Early Adopters of Crypto Currency?',
  'Market Insights - Agriculture Industry',
  'What Is Cash Pooling and Cash Concentration?',
  'Best Practices for ISO 20022',
  'What Are Interest Rate Swaps',
  'What Are Long-Term Cross-Currency Swaps?',
  'Why Manage Financial Risk?',
  'How Do Treasurers Effectively Use Derivatives to Manage Risk?',
  ' What Is Automated Clearinghouse (ACH) Fraud?',
  'What Is Commercial Card Fraud?',
  'How Does A Merchant Category Code (MCC) Impact Card Processing Fees?',
  'What is a Virtual Card Payment?',
  'How to Optimize Interchange',
  'What Is Correspondent Banking?',
  'How To Quantify Days Sales Outstanding',
  'Market Insights - Tourism Industry',
  'ISO 20022 Opportunities',
  'What Is Customer Relationship Management (CRM)?',
  'How To Quantify Days Payable Outstanding',
  'Strategy for Rolling Out ISO 20022',
  'Who Is Part Of The Card Payment Processing Ecosystem?',
  'Payment Technology - Property Management Use Case',
  'Why Are Cash Transfer Procedures and Controls Important',
  'What Is EMV?',
  'Days Payable Outstanding',
  'Days Sales Outstanding',
  'What Is Wire Fraud?',
  'Market Insights - Construction Industry',
  'Market Insights - Education Industry',
  'Market Insights - Freight and Transportation Industry',
  'Market Insights - Government Industry',
  'Market Insights - Manufacturing Industry',
  'Market Insights - Senior Care Industry',
  'Market Insights - Utilities Industry',
  'Introduction to Treasury Policies for Foreign Exchange Management',
  'Introduction to Treasury Policies for Debt Management',
  'Introduction to Treasury Policies for Interest Rate Exposure Management',
  'What Are the Types of Bank Financing Available to Businesses?',
  'What Are the Aspects of Syndicated Revolving Facilities?',
  'What Is the Bond Market and How Does It Work?',
  'What Is Asset Securitization?',
  'How Are Corporate Bonds Priced?',
  'What Are the Principles of Asset Securitization?',
  'What Are the Pros and Cons of Asset Securitization?',
  'What Is a Foreign Currency Account?',
  'What Is Netting?',
  'What Is Cash Forecasting? ',
  'What Are the Three Liquidity Ratios?',
  'What Is the Position of Treasury Within the Corporate Structure?',
  'What Are Business Intelligence (BI) Tools?',
  'What Is Enterprise Resource Planning (ERP)?',
  'How Do CFOs Strategically Plan And Budget?',
  'How Does the RTP Network Work?',
  'What is Interchange?',
  'How Are Interchange Fees Assessed?',
  'Cash Conversion Cycle',
  'ACH 101',
  'Payment Gateways',
  'What are Invoicing Solutions?',
  'How to Sell Payment Technology',
  'What Types of Payments Will ISO 20022 Apply To?',
  'What is ISO 20022?',
  'How Does ISO 20022 Compare to Other File Format Types?',
  'Faster Payments Use Cases - C2B (Consumer to Business) – Bill Pay',
  'What is Healthcare Receivables Management?',
  'Selling To The CFO',
  'Selling To The CMO',
  'Do Your Homework',
  'The Science Of Creativity - Emerge',
  'Selling To The Controller',
  'Selling To The CEO',
  'Selling To The CIO',
  'Merchant 101',
  'NACHA',
  'How Do Payment Terms With Customers and Vendors Affect Working Capital?',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const [lessons] = await queryInterface.sequelize.query(`
      SELECT l.id, l.title
      FROM ${table} l
      WHERE l.title IN (
        ${defaultPublicLessons.map((lesson) => `'${lesson}'`).join(',')}
      );
    `);

    await Promise.all(
      lessons.map(async (lesson) => {
        await queryInterface.sequelize.query(`
          UPDATE ${table}
          SET "isPublic" = true
          WHERE id = '${lesson.id}';
        `);
      })
    );
  },

  async down(queryInterface, Sequelize) {},
};