// src/api/master/masterDataStore.js

import EncryptedStorage from 'react-native-encrypted-storage';

const KEYS = {
  provinces: 'mlis_master_provinces',
  districts: 'mlis_master_districts',
  iddoctypes:'mlis_master_iddoctypes',
  addoctypes:'mlis_master_addoctypes',
};

// Save
export async function saveMasterData(key, data) {
  try {
    await EncryptedStorage.setItem(KEYS[key], JSON.stringify(data));
  } catch (e) {
    console.log('Failed to save master data:', key, e);
  }
}

// Load
export async function loadMasterData(key) {
  try {
    const stored = await EncryptedStorage.getItem(KEYS[key]);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.log('Failed to load master data:', key, e);
    return [];
  }
}
