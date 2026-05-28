// src/api/master/masterDataService.js

import axios from 'axios';
import CryptoJS from 'crypto-js';
import DeviceInfo from 'react-native-device-info';
import { saveMasterData } from './masterDataStore';
import { MASTERDATA_BASE_URL } from '../client';
import Config from 'react-native-config';
import { Alert } from 'react-native';

// ------------------------------------------------
//  CONFIG
// ------------------------------------------------
const BASE_URL = MASTERDATA_BASE_URL;
// const APP_ID = 'mlis-master';
// const SECRET = 'A7F!nQ9$@vD2#pX6*LmT8eR4$cW1ZbP0';
// const APP_ID = Config.HMAC_APP_ID_MASTER;
// const SECRET = Config.HMAC_SECRET_MASTER;

// console.log('======== ENV DEBUG START ========');
// console.log('APP_ID_MASTER =', APP_ID);
// console.log('SECRET_MASTER =', SECRET);
// console.log("SECRET_MASTER LENGTH =", SECRET ? SECRET.length : "undefined");
// console.log("======== ENV DEBUG END ========");
// ------------------------------------------------
//  BUILD HMAC HEADERS (APP_ID | TIMESTAMP | BODY)
// // ------------------------------------------------
// function buildHmacHeaders(bodyObj = {}) {
//   const bodyStr = JSON.stringify(bodyObj); // "{}" for GET
//   // const timestamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
//   const timestamp = new Date().toISOString().replace('Z', '');
//   console.log(' Generated UTC Timestamp:', timestamp);

//   const dataToSign = `${APP_ID}|${timestamp}|${bodyStr}`;
//   const hash = CryptoJS.HmacSHA256(dataToSign, SECRET);
//   const signature = CryptoJS.enc.Base64.stringify(hash);

//   return {
//     'X-App-Id': APP_ID,
//     'X-Timestamp': timestamp,
//     'X-Signature': signature,
//     'Content-Type': 'application/json',
//   };
// }

// ------------------------------------------------
//  FETCH ALL MASTER DATA FROM API
// ------------------------------------------------
export async function fetchMasterDataFromApi() {
  const deviceId = await DeviceInfo.getUniqueId();

  const headers = {
    'Content-Type': 'application/json',
    'device-id': deviceId,
  };

  const url = `${BASE_URL}/api/masterdata`;

  // ✅ PRINT REQUEST DETAILS
  console.log('📤 MASTER DATA REQUEST');
  console.log('🔗 URL:', url);
  console.log('📦 Headers:', headers);

  const response = await axios.get(url, {
    headers,
    timeout: 15000,
  });

  // ✅ PRINT RESPONSE
  console.log('✅ MASTER DATA RESPONSE:', response.data);

  return response.data;
}

// ------------------------------------------------
//  MAIN ENTRY → Splash Screen will call this
// ------------------------------------------------
export async function getMasterData() {
  try {
    console.log('Calling MasterData API...');

    const apiResponse = await fetchMasterDataFromApi();

    console.log(apiResponse);

    if (apiResponse.Provinces)
      await saveMasterData('provinces', apiResponse.Provinces);

    if (apiResponse.Districts)
      await saveMasterData('districts', apiResponse.Districts);

    if (apiResponse.IDProofDocumentTypes)
      await saveMasterData('iddoctypes', apiResponse.IDProofDocumentTypes);

    if (apiResponse.AddressProofDocumentTypes)
      await saveMasterData('addoctypes', apiResponse.AddressProofDocumentTypes);

    return {
      provinces: apiResponse.Provinces,
      districts: apiResponse.Districts,
      iddoctypes: apiResponse.IDProofDocumentTypes,
      addoctypes: apiResponse.AddressProofDocumentTypes,
    };
  } catch (err) {
    console.log('❌ Status:', err?.response?.status);
    console.log('❌ Response:', err?.response?.data);

    // ✅ 429 ERROR ALERT
    if (err?.response?.status === 429) {
      Alert.alert(
        'Too Many Attempts',
        'Too many attempts. Please try again in a few minutes.',
      );

      return;
    }

    console.log('MasterData API failed:', err.message);
    throw err;
  }
}
