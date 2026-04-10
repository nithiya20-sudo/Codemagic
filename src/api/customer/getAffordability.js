import { loanApi5015 } from '../client'; // Your axios wrapper

export async function getAffordability({
  CustomerUserName,
  LoanAmount,
  Tenure,
  LoanTypeId,
  LoanNo,
}) {
  try {
    const payload = {
      body: {
        CustomerUserName,
        LoanAmount,
        Tenure,
        LoanTypeId,
        LoanNumber: String(LoanNo),
      },
    };
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log(
      '🔗 URL:',
      loanApi5015.defaults.baseURL + '/API/GetDetails/Get',
    );
    const res = await loanApi5015.post(
      '/API/GetDetails/GetAffordability', // relative path
      payload,
    );

    console.log(res);

    return res.data;
  } catch (err) {
    console.log('❌ Affordability API Error:', err);
    throw err;
  }
}
