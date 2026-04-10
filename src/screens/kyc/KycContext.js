// src/screens/kyc/KycContext.js
import React, { createContext, useState, useContext } from 'react';

export const KycContext = createContext();

const initialKycData = {
  personal: {
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dob: '',
    nrc: '',
  },
  address: {
    provinceCode: '',
    districtCode: '',
    residentialAddress: '',
  },
  contact: {
    mobile: '',
    mobileVerified: false,
    email: '',
    emailVerified: false,
  },
  documents: {
    addressProof: {
      docTypeCode: '',
      docNo: '',
      expiryDate: '',
      attachmentBase64: '',
    },
    identityProof: {
      docTypeCode: '',
      docNo: '',
      expiryDate: '',
      attachmentBase64: '',
    },
  },
};

export function KycProvider({ children }) {
  const [kycData, setKycData] = useState(initialKycData);

  const updateSection = (sectionName, partialData) => {
    setKycData(prev => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        ...partialData,
      },
    }));
  };

  const resetKyc = () => {
    setKycData(initialKycData);
  };

  return (
    <KycContext.Provider
      value={{
        kycData,
        setKycData,
        updateSection,
        resetKyc,
      }}
    >
      {children}
    </KycContext.Provider>
  );
}

// 🔥 THIS is the missing piece
export function useKyc() {
  return useContext(KycContext);
}
