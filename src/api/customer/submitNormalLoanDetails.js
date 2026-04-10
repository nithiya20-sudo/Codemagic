// src/api/loans/submitNormalLoanDetails.js

import { normalloanApi5013 } from '../client'; // axios instance with baseURL = http://13.201.159.177:5014

/**
 * Submit Quick Loan request
 * @param {*} loanBody (the JSON object under body)
 * @returns API response
 */
export async function submitNormalLoanDetails(loanBody) {
  try {
    const url = '/API/Loans/LoanRequest';

    const payload = {
      body: loanBody,
    };

    console.log(
      ' Submitting Normal Loan Details →',
      JSON.stringify(payload, null, 2),
    );
    console.log(' URL:', normalloanApi5013.defaults.baseURL + url);
    console.log(
      ' Final Headers:',
      JSON.stringify(normalloanApi5013.defaults.headers, null, 2),
    );

    const response = await normalloanApi5013.post(url, payload);

    console.log(
      ' Normal Loan Submit Response:',
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.error(
      ' Normal Loan Submit Failed:',
      error.response?.data || error.message,
    );
    throw error;
  }
}
