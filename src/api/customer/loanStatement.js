import { loanApi5015 } from '../client';

export async function fetchStatementDownload(loanNumber) {
  try {
    const payload = { body: { LoanNumber: loanNumber } };
    
    console.log(JSON.stringify(payload, null, 2));

    const { data } = await loanApi5015.post(
      '/API/GetDetails/GetStatement',
      payload
    );

    console.log(data);

    if (data?.executionStatus !== 'Success') {
      throw new Error(data?.executionMessage || 'Failed to get statement file');
    }

    const op = data.outParams || {};

    return {
      fileName: op.FileName,
      url: op.FileUrl,
      type: op.FileType,
      size: op.FileSize,
    };

  } catch (err) {
    console.log('❌ Statement Download Error:', err.message);
    throw err;
  }
}
