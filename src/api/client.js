// /**
//  * Axios clients used across the app
//  * ---------------------------------
//  * api        → Custom APIs which use dynamic Bearer token received from login
//  * prodApi    → Core iPROOF platform APIs (dynamic Bearer token)
//  * preAuthApi5010 → Public/pre-login APIs (dynamic HMAC slot token)
//  * preAuthApi5012 → Public/pre-login APIs (fixed system token)
//  */

// import axios from 'axios';
// import EncryptedStorage from 'react-native-encrypted-storage';
// import Config from 'react-native-config';
// import {
//   getSlotToken,
//   computeHmacSignature,
//   getUtcTimestamp,
// } from './systemAuth';

// /** ──────────────────────────────
//  *  Base URLs
//  *  ────────────────────────────── */
// const PREAUTH_BASE_5010 = 'http://13.201.159.177:5010';
// const POSTAUTH_BASE_5010 = 'http://13.201.159.177:5010';
// const POSTAUTH_BASE_5011 = 'http://13.201.159.177:5011';
// const PREAUTH_BASE_5012 = 'http://13.201.159.177:5012';
// const LOAN_BASE_5015 = 'http://13.201.159.177:5015';
// const CUSTOMER_BASE_5016 = 'http://13.201.159.177:5016';
// const PROD_BASE_URL = 'http://13.201.159.177:5002/iProofService/api';
// const QUICKLOAN_BASE_URL = 'http://13.201.159.177:5014';
// const NormalLoan_BASE_URL = 'http://13.201.159.177:5013';
// export const MASTERDATA_BASE_URL = 'http://13.201.159.177:5021'; // update after deploy

// /** ──────────────────────────────
//  *  Axios Clients
//  *  ────────────────────────────── */
// export const api = axios.create({
//   baseURL: PREAUTH_BASE_5010,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const prodApi = axios.create({
//   baseURL: PROD_BASE_URL,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const preAuthApi5010 = axios.create({
//   baseURL: PREAUTH_BASE_5010,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const loanApi5014 = axios.create({
//   baseURL: QUICKLOAN_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const normalloanApi5013 = axios.create({
//   baseURL: NormalLoan_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });
// /* ──────────────────────────────────────────────
//    PreAuth Interceptor: auto-fetch slot token + HMAC headers
// ────────────────────────────────────────────── */
// preAuthApi5010.interceptors.request.use(
//   async config => {
//     try {
//       const path = config.url?.toLowerCase() || '';

//       // 🔹 Skip token generation for GetSlotToken itself
//       if (path.includes('getslottoken')) return config;

//       // 🔹 Step 1: fetch slot token
//       const sysToken = await getSlotToken();
//       console.log('📤 Slot Token for request:', sysToken);

//       // 🔹 Step 2: compute fresh HMAC for this request
//       const timestamp = getUtcTimestamp();
//       const bodyStr = JSON.stringify(config.data || {});
//       const signature = computeHmacSignature(
//         Config.HMAC_APP_ID,
//         timestamp,
//         bodyStr,
//       );

//       // 🔹 Step 3: attach headers
//       config.headers = {
//         ...config.headers,
//         Authorization: `Bearer ${sysToken}`,
//         'Content-Type': 'application/json',
//         'X-App-Id': Config.HMAC_APP_ID,
//         'X-Timestamp': timestamp,
//         'X-Signature': signature,
//       };

//       console.log('🔍 Final URL:', config.baseURL + config.url);
//       console.log('🔍 Final Body:', bodyStr);
//       console.log('🔐 Final Headers:', config.headers);

//       return config;
//     } catch (err) {
//       console.error('❌ Error preparing HMAC headers:', err.message);
//       throw err;
//     }
//   },
//   error => Promise.reject(error),
// );

// /** Other API clients **/
// export const preAuthApi5012 = axios.create({
//   baseURL: PREAUTH_BASE_5012,
//   timeout: 25000,
//   headers: { 'Content-Type': 'application/json' },
// });
// /** Other API clients **/
// export const kycApi5012 = axios.create({
//   baseURL: PREAUTH_BASE_5012,
//   timeout: 99000,
//   headers: { 'Content-Type': 'application/json' },
// });

// /** Other API clients **/
// export const OTP5012 = axios.create({
//   baseURL: PREAUTH_BASE_5012,
//   timeout: 25000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const customerApi5016 = axios.create({
//   baseURL: CUSTOMER_BASE_5016,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const loanApi5015 = axios.create({
//   baseURL: LOAN_BASE_5015,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const changePass5010 = axios.create({
//   baseURL: POSTAUTH_BASE_5010,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const GetCustIncome5011 = axios.create({
//   baseURL: POSTAUTH_BASE_5011,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// export const UpdateCustIncome5011 = axios.create({
//   baseURL: POSTAUTH_BASE_5011,
//   timeout: 15000,
//   headers: { 'Content-Type': 'application/json' },
// });

// /** ──────────────────────────────
//  *  Token utilities for post-login
//  *  ────────────────────────────── */
// export function setAuthToken(token) {
//   if (token) {
//     api.defaults.headers.common.Authorization = `Bearer ${token}`;
//     prodApi.defaults.headers.common.Authorization = `Bearer ${token}`;
//     customerApi5016.defaults.headers.common.Authorization = `Bearer ${token}`;
//     changePass5010.defaults.headers.common.Authorization = `Bearer ${token}`;
//     OTP5012.defaults.headers.common.Authorization = `Bearer ${token}`;
//     kycApi5012.defaults.headers.common.Authorization = `Bearer ${token}`;
//     GetCustIncome5011.defaults.headers.common.Authorization = `Bearer ${token}`;
//     UpdateCustIncome5011.defaults.headers.common.Authorization = `Bearer ${token}`;
//     loanApi5014.defaults.headers.common.Authorization = `Bearer ${token}`;
//     normalloanApi5013.defaults.headers.common.Authorization = `Bearer ${token}`;
//   } else {
//     delete api.defaults.headers.common.Authorization;
//     delete prodApi.defaults.headers.common.Authorization;
//     delete customerApi5016.defaults.headers.common.Authorization;
//     delete changePass5010.defaults.headers.common.Authorization;
//     delete OTP5012.defaults.headers.common.Authorization;
//     delete kycApi5012.defaults.headers.common.Authorization;
//     delete GetCustIncome5011.defaults.headers.common.Authorization;
//     delete UpdateCustIncome5011.defaults.headers.common.Authorization;
//     delete loanApi5014.defaults.headers.common.Authorization;
//     delete normalloanApi5013.defaults.headers.common.Authorization;
//   }
// }

// /** ──────────────────────────────
//  *  Auto-inject token + username for logged-in users
//  *  ────────────────────────────── */
// async function getAuthHeaders() {
//   try {
//     const token = await EncryptedStorage.getItem('token');
//     const user = await EncryptedStorage.getItem('user');
//     const parsedUser = user ? JSON.parse(user) : {};
//     return {
//       Authorization: token ? `Bearer ${token}` : undefined,
//       'X-Username': parsedUser?.username || undefined,
//     };
//   } catch {
//     return {};
//   }
// }

// const attachInterceptor = client => {
//   client.interceptors.request.use(async config => {
//     const headers = await getAuthHeaders();
//     config.headers = { ...config.headers, ...headers };
//     return config;
//   });
// };

// // ✅ Attach only to post-login clients
// [
//   api,
//   prodApi,
//   loanApi5015,
//   customerApi5016,
//   changePass5010,
//   OTP5012,
//   kycApi5012,
//   GetCustIncome5011,
//   UpdateCustIncome5011,
// ].forEach(attachInterceptor);

// /** ──────────────────────────────
//  *  Global response handler
//  *  ────────────────────────────── */
// api.interceptors.response.use(
//   response => response,
//   async error => {
//     const status = error?.response?.status;
//     const message =
//       error?.response?.data?.message ||
//       error?.response?.data?.error ||
//       error?.message ||
//       'Network error';

//     if (status === 401 || message.toLowerCase().includes('token')) {
//       console.warn('Session expired or invalid token — clearing credentials.');
//       try {
//         await EncryptedStorage.removeItem('token');
//         await EncryptedStorage.removeItem('user');
//       } catch (e) {
//         console.log('Error clearing storage on token expiry:', e);
//       }
//       return Promise.reject({
//         isAuthError: true,
//         message: 'Session expired. Please log in again.',
//       });
//     }

//     return Promise.reject(new Error(message));
//   },
// );

// export default api;

/**
 * Axios clients used across the app
 * ---------------------------------
 * api        → Custom APIs which use dynamic Bearer token received from login
 * prodApi    → Core iPROOF platform APIs (dynamic Bearer token)
 * preAuthApi5010 → Public/pre-login APIs (dynamic HMAC slot token)
 * preAuthApi5012 → Public/pre-login APIs (fixed system token)
 */

import axios from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage';
import Config from 'react-native-config';
import {
  getSlotToken,
  computeHmacSignature,
  getUtcTimestamp,
} from './systemAuth';

/** ──────────────────────────────
 *  Base URLs
 *  ────────────────────────────── */
const PREAUTH_BASE_5010 = 'https://loans.znbs.co.zm';
const POSTAUTH_BASE_5010 = 'https://loans.znbs.co.zm';
const POSTAUTH_BASE_5011 = 'https://loans.znbs.co.zm';
const PREAUTH_BASE_5012 = 'https://loans.znbs.co.zm';
const LOAN_BASE_5015 = 'https://loans.znbs.co.zm';
const CUSTOMER_BASE_5016 = 'https://loans.znbs.co.zm';
const PROD_BASE_URL = 'https://loans.znbs.co.zm/iProofService/api';
const QUICKLOAN_BASE_URL = 'https://loans.znbs.co.zm';
const NormalLoan_BASE_URL = 'https://loans.znbs.co.zm';
export const MASTERDATA_BASE_URL = 'https://loans.znbs.co.zm'; // update after deploy

/** ──────────────────────────────
 *  Axios Clients
 *  ────────────────────────────── */
export const api = axios.create({
  baseURL: PREAUTH_BASE_5010,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const prodApi = axios.create({
  baseURL: PROD_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const preAuthApi5010 = axios.create({
  baseURL: PREAUTH_BASE_5010,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const loanApi5014 = axios.create({
  baseURL: QUICKLOAN_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const normalloanApi5013 = axios.create({
  baseURL: NormalLoan_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
/* ──────────────────────────────────────────────
   PreAuth Interceptor: auto-fetch slot token + HMAC headers
────────────────────────────────────────────── */
preAuthApi5010.interceptors.request.use(
  async config => {
    try {
      const path = config.url?.toLowerCase() || '';

      // 🔹 Skip token generation for GetSlotToken itself
      if (path.includes('getslottoken')) return config;

      // 🔹 Step 1: fetch slot token
      const sysToken = await getSlotToken();
      console.log('📤 Slot Token for request:', sysToken);

      // 🔹 Step 2: compute fresh HMAC for this request
      const timestamp = getUtcTimestamp();
      const bodyStr = JSON.stringify(config.data || {});
      const signature = computeHmacSignature(
        Config.HMAC_APP_ID,
        timestamp,
        bodyStr,
      );

      // 🔹 Step 3: attach headers
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${sysToken}`,
        'Content-Type': 'application/json',
        'X-App-Id': Config.HMAC_APP_ID,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      };

      console.log('🔍 Final URL:', config.baseURL + config.url);
      console.log('🔍 Final Body:', bodyStr);
      console.log('🔐 Final Headers:', config.headers);

      return config;
    } catch (err) {
      console.error('❌ Error preparing HMAC headers:', err.message);
      throw err;
    }
  },
  error => Promise.reject(error),
);

/** Other API clients **/
export const preAuthApi5012 = axios.create({
  baseURL: PREAUTH_BASE_5012,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
});
/** Other API clients **/
export const kycApi5012 = axios.create({
  baseURL: PREAUTH_BASE_5012,
  timeout: 99000,
  headers: { 'Content-Type': 'application/json' },
});

/** Other API clients **/
export const OTP5012 = axios.create({
  baseURL: PREAUTH_BASE_5012,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' },
});

preAuthApi5012.interceptors.request.use(
  async config => {
    try {
      const path = config.url?.toLowerCase() || '';

      if (path.includes('getslottoken')) return config;

      // 🔹 Step 1: fetch slot token
      const sysToken = await getSlotToken();
      console.log('📤 Slot Token for request:', sysToken);

      // 🔹 Step 2: compute HMAC
      const timestamp = getUtcTimestamp();
      const bodyStr = JSON.stringify(config.data || {});
      const signature = computeHmacSignature(
        Config.HMAC_APP_ID,
        timestamp,
        bodyStr,
      );

      // 🔹 Step 3: attach headers
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${sysToken}`,
        'Content-Type': 'application/json',
        'X-App-Id': Config.HMAC_APP_ID,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      };

      console.log('🔍 Final URL:', config.baseURL + config.url);
      console.log('🔍 Final Body:', bodyStr);
      console.log('🔐 Final Headers:', config.headers);

      return config;
    } catch (err) {
      console.error('❌ Error preparing HMAC headers:', err.message);
      throw err;
    }
  },
  error => Promise.reject(error),
);
export const customerApi5016 = axios.create({
  baseURL: CUSTOMER_BASE_5016,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const loanApi5015 = axios.create({
  baseURL: LOAN_BASE_5015,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const changePass5010 = axios.create({
  baseURL: POSTAUTH_BASE_5010,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const GetCustIncome5011 = axios.create({
  baseURL: POSTAUTH_BASE_5011,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const UpdateCustIncome5011 = axios.create({
  baseURL: POSTAUTH_BASE_5011,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** ──────────────────────────────
 *  Token utilities for post-login
 *  ────────────────────────────── */
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    prodApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    customerApi5016.defaults.headers.common.Authorization = `Bearer ${token}`;
    changePass5010.defaults.headers.common.Authorization = `Bearer ${token}`;
    OTP5012.defaults.headers.common.Authorization = `Bearer ${token}`;
    kycApi5012.defaults.headers.common.Authorization = `Bearer ${token}`;
    GetCustIncome5011.defaults.headers.common.Authorization = `Bearer ${token}`;
    UpdateCustIncome5011.defaults.headers.common.Authorization = `Bearer ${token}`;
    loanApi5014.defaults.headers.common.Authorization = `Bearer ${token}`;
    normalloanApi5013.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
    delete prodApi.defaults.headers.common.Authorization;
    delete customerApi5016.defaults.headers.common.Authorization;
    delete changePass5010.defaults.headers.common.Authorization;
    delete OTP5012.defaults.headers.common.Authorization;
    delete kycApi5012.defaults.headers.common.Authorization;
    delete GetCustIncome5011.defaults.headers.common.Authorization;
    delete UpdateCustIncome5011.defaults.headers.common.Authorization;
    delete loanApi5014.defaults.headers.common.Authorization;
    delete normalloanApi5013.defaults.headers.common.Authorization;
  }
}

/** ──────────────────────────────
 *  Auto-inject token + username for logged-in users
 *  ────────────────────────────── */
async function getAuthHeaders() {
  try {
    const token = await EncryptedStorage.getItem('token');
    const user = await EncryptedStorage.getItem('user');
    const parsedUser = user ? JSON.parse(user) : {};
    return {
      Authorization: token ? `Bearer ${token}` : undefined,
      'X-Username': parsedUser?.username || undefined,
    };
  } catch {
    return {};
  }
}

const attachInterceptor = client => {
  client.interceptors.request.use(async config => {
    const headers = await getAuthHeaders();
    config.headers = { ...config.headers, ...headers };
    return config;
  });
};

// ✅ Attach only to post-login clients
[
  api,
  prodApi,
  loanApi5015,
  customerApi5016,
  changePass5010,
  OTP5012,
  kycApi5012,
  GetCustIncome5011,
  UpdateCustIncome5011,
].forEach(attachInterceptor);

/** ──────────────────────────────
 *  Global response handler
 *  ────────────────────────────── */
[
  api,
  prodApi,
  loanApi5015,
  customerApi5016,
  changePass5010,
  OTP5012,
  kycApi5012,
  GetCustIncome5011,
  UpdateCustIncome5011,
].forEach(client => {
  client.interceptors.response.use(
    response => response,
    async error => {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Network error';

      if (
        status === 401 ||
        (message && message.toLowerCase().includes('token'))
      ) {
        console.warn(
          'Session expired or invalid token — clearing credentials.',
        );

        try {
          await EncryptedStorage.removeItem('token');
          await EncryptedStorage.removeItem('user');
        } catch (e) {
          console.log('Error clearing storage on token expiry:', e);
        }

        return Promise.reject({
          isAuthError: true,
          message: 'Session expired. Please log in again.',
        });
      }

      return Promise.reject(new Error(message));
    },
  );
});

export default api;
