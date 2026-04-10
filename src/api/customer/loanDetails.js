// src/api/customer/loanDetails.js
import { loanApi5015 } from '../client';

/**
 * Get detailed loan info by LoanNumber.
 * Requires Bearer token (auto injected by interceptor).
 */
export async function fetchLoanDetails(loanNumber) {
  try {
    const payload = { body: { LoanNumber: loanNumber } };
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log(
      '🔗 URL:',
      loanApi5015.defaults.baseURL + '/API/GetDetails/GetLoanDetails',
    );

    const { data } = await loanApi5015.post(
      '/API/GetDetails/GetLoanDetails',
      payload,
    );

    if (data?.executionStatus !== 'Success') {
      throw new Error(data?.executionMessage || 'Failed to fetch loan details');
    }

    // ============================
    // Extract OUTPARAMS (Summary)
    // ============================
    const d = data?.outParams || {};

    const summary = {
      product: d.ProductDescription || '-',
      loanDate: d.LoanDate || '-',
      amount: d.LoanAmount || '0',
      interest: d.ROI || '-',
      tenure: d.LoanTenure || '-',
      emi: d.EMI || '0',
      nduedate: d.NextDueDate || '-',
      balprincipal: d.BalancePrincipal || '0',
      installment: d.Installment || '0',
      lpaydate: d.LastPaymentDate || '-',
      lpayamount: d.LastPaymentAmount || '0',
      disbursementAmount: d.EstimatedDisbursementAmount || '0',
      upfrontCharges: d.UpfrontCharges || '0',
      darrear: d.ArrearDays || '0',
      aarrear: d.ArrearAmount || '0',
      employerProductMapID: d.EmployerProductMapID || '-',
    };

    // ============================
    // Extract GRIDPARAMS (Statement)
    // ============================
    const statement = data?.gridParams?.Statement
      ? Object.values(data.gridParams.Statement)
      : [];

    // ============================
    // Return unified object
    // ============================
    return {
      ...summary,
      transactions: statement, // FULL list
    };
  } catch (err) {
    console.error('❌ Loan details fetch error:', err.message);
    throw err;
  }
}
