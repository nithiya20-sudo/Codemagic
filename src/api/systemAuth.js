// // src/api/systemAuth.js
// import axios from 'axios';
// import CryptoJS from 'crypto-js';
// import Config from 'react-native-config';

// // ---------------------------------------------------------------------
// //  Configuration constants
// // ---------------------------------------------------------------------
// const BASE_URL = 'http://13.201.159.177:5010';
// const GET_TOKEN_ENDPOINT = '/API/MobileAccessRequest/GetSlotToken';

// const APP_ID = Config.HMAC_APP_ID;
// const SECRET_KEY = Config.HMAC_SECRET_KEY;
// console.log('App ID:', Config.HMAC_APP_ID);
// console.log('HMAC_SECRET_KEY:', Config.HMAC_SECRET_KEY);
// // ---------------------------------------------------------------------
// //  Local cache (token valid only for one call, but kept briefly)
// // ---------------------------------------------------------------------
// let cachedToken = null;
// let lastFetch = 0;

// // ---------------------------------------------------------------------
// //  Helper: generate UTC ISO timestamp without milliseconds
// // ---------------------------------------------------------------------
// function getUtcTimestamp() {
//   return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
// }

// // ---------------------------------------------------------------------
// //  Helper: compute HMAC-SHA256 → Base64
// // ---------------------------------------------------------------------
// function computeHmacSignature(appId, timestamp, body) {
//   const dataToSign = `${appId}|${timestamp}|${body}`;
//   const hash = CryptoJS.HmacSHA256(dataToSign, SECRET_KEY);
//   return CryptoJS.enc.Base64.stringify(hash);
// }

// // ---------------------------------------------------------------------
// //  Main function: fetch slot token (HMAC-secured)
// // ---------------------------------------------------------------------
// export async function getSlotToken() {
//   try {
//     // If cached within 30s, reuse (optional)
//     // const now = Date.now();
//     // if (cachedToken && now - lastFetch < 30000) return cachedToken;

//     // Prepare body and timestamp
//     const bodyObj = {

//     };
//     const bodyStr = JSON.stringify(bodyObj);
//     const timestamp = getUtcTimestamp();
//     const signature = computeHmacSignature(APP_ID, timestamp, bodyStr);

//     // Send signed request
//     const res = await axios.post(`${BASE_URL}${GET_TOKEN_ENDPOINT}`, bodyObj, {
//       headers: {
//         'Content-Type': 'application/json',
//         'X-App-Id': APP_ID,
//         'X-Timestamp': timestamp,
//         'X-Signature': signature,
//       },
//       timeout: 15000,
//     });

//     // Extract token
//     const token = res?.data;
//     if (!token || typeof token !== 'string') {
//       throw new Error('Invalid token response');
//     }

//     // Cache briefly
//     cachedToken = token;
//    // lastFetch = now;

//     console.log('✅ Slot token fetched via HMAC');
//     return token;
//   } catch (err) {
//     console.error('❌ Failed to fetch slot token:', err.message);
//     throw err;
//   }
// }
// src/api/systemAuth.js
import axios from 'axios';
import CryptoJS from 'crypto-js';
import Config from 'react-native-config';

// ---------------------------------------------------------------------
//  Configuration constants
// ---------------------------------------------------------------------
const BASE_URL = 'https://loans.znbs.co.zm';
const GET_TOKEN_ENDPOINT = '/API/MobileAccessRequest/GetSlotToken';

const APP_ID = Config.HMAC_APP_ID;
const SECRET_KEY = Config.HMAC_SECRET_KEY;

console.log('App ID:', APP_ID);
console.log('HMAC_SECRET_KEY:', SECRET_KEY);

// ---------------------------------------------------------------------
//  Local cache (slot token may be reused briefly if valid)
// ---------------------------------------------------------------------
let cachedToken = null;
let lastFetch = 0;

// ---------------------------------------------------------------------
//  Helper: generate UTC ISO timestamp without milliseconds
// ---------------------------------------------------------------------
export function getUtcTimestamp() {
  return new Date().toISOString().replace(/\.\d+Z$/, 'Z');
}

// ---------------------------------------------------------------------
//  Helper: compute HMAC-SHA256 → Base64
// ---------------------------------------------------------------------
export function computeHmacSignature(appId, timestamp, body) {
  try {
    const dataToSign = `${appId}|${timestamp}|${body}`;
    const hash = CryptoJS.HmacSHA256(dataToSign, SECRET_KEY);
    const signature = CryptoJS.enc.Base64.stringify(hash);
    return signature;
  } catch (err) {
    console.error('❌ Error computing HMAC signature:', err.message);
    throw err;
  }
}

// ---------------------------------------------------------------------
//  Main function: fetch slot token (HMAC-secured)
// ---------------------------------------------------------------------
export async function getSlotToken() {
  try {
    // Optionally reuse cached token (disabled for now)
    // const now = Date.now();
    // if (cachedToken && now - lastFetch < 30000) return cachedToken;

    // Step 1: prepare empty body and timestamp
    const bodyObj = {};
    const bodyStr = JSON.stringify(bodyObj);
    const timestamp = getUtcTimestamp();
    const signature = computeHmacSignature(APP_ID, timestamp, bodyStr);

    // Step 2: send signed request
    const res = await axios.post(`${BASE_URL}${GET_TOKEN_ENDPOINT}`, bodyObj, {
      headers: {
        'Content-Type': 'application/json',
        'X-App-Id': APP_ID,
        'X-Timestamp': timestamp,
        'X-Signature': signature,
      },
      timeout: 15000,
    });

    // Step 3: extract token
    const token = res?.data;
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token response');
    }

    // Cache briefly
    cachedToken = token;
    // lastFetch = now;

    console.log('✅ Slot token fetched via HMAC');
    return token;
  } catch (err) {
    console.error('❌ Failed to fetch slot token:', err.message);
    throw err;
  }
}
