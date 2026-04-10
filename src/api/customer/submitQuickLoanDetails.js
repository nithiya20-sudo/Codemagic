// src/api/loans/submitQuickLoanDetails.js

import { loanApi5014 } from '../client'; // axios instance with baseURL = http://13.201.159.177:5014

/**
 * Submit Quick Loan request
 * @param {*} loanBody (the JSON object under body)
 * @returns API response
 */
export async function submitQuickLoanDetails(loanBody) {
  try {
    const url = '/API/Loans/QuickLoanRequest';

    const payload = {
      body: loanBody,
    };

    console.log(
      ' Submitting Quick Loan Details →',
      JSON.stringify(payload, null, 2),
    );
    console.log(' URL:', loanApi5014.defaults.baseURL + url);
    console.log(
      ' Final Headers:',
      JSON.stringify(loanApi5014.defaults.headers, null, 2),
    );

    const response = await loanApi5014.post(url, payload);

    console.log(
      ' Quick Loan Submit Response:',
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.error(
      ' Quick Loan Submit Failed:',
      error.response?.data || error.message,
    );
    throw error;
  }
}
