// src/screens/kyc/KycReviewScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, ScrollView } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import { useKyc } from './KycContext';
import { useAuth } from '../../apicontext/AuthContext';

import { formStyles } from '../../styles/formstyles';
import { colors, spacing } from '../../theme';

import AppButton from '../../ui/AppButton';
import { submitKycDetails } from '../../api/customer/submitKycDetails';

const MASTER_DATA_KEY = 'MASTER_DATA';

// Convert local file size to KB (for logging)
const getBase64SizeKB = base64 => {
  return (base64.length * (3 / 4)) / 1024;
};

export default function KycReviewScreen({ navigation }) {
  const { kycData } = useKyc();
  const { user } = useAuth();

  const [provinceName, setProvinceName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [idDocName, setIdDocName] = useState('');
  const [addrDocName, setAddrDocName] = useState('');

  // ---------------------------------------------------------------------
  // LOAD MASTER DATA NAMES (Province + District)
  // ---------------------------------------------------------------------
  // ---------------------------------------------------------------------
  // LOAD MASTER DATA NAMES (Province + District) - FIXED
  // ---------------------------------------------------------------------
  useEffect(() => {
    async function loadMaster() {
      try {
        const raw = await EncryptedStorage.getItem(MASTER_DATA_KEY);
        if (!raw) return;

        const json = JSON.parse(raw);

        const provinces = json.Provinces || json.provinces || [];
        const districts = json.Districts || json.districts || [];

        const idTypes =
          json?.iddoctypes || json?.DocumentTypes?.IDProofDocumentTypes || [];

        const addrTypes =
          json?.addoctypes ||
          json?.DocumentTypes?.AddressProofDocumentTypes ||
          [];

        // Province
        const p = provinces.find(
          x => String(x.Code) === String(kycData.address.provinceCode),
        );

        // District
        const d = districts.find(
          x => String(x.Code) === String(kycData.address.districtCode),
        );

        // ID Document Name
        const idDoc = idTypes.find(
          x =>
            String(x.Code) ===
            String(kycData.documents.identityProof.docTypeCode),
        );

        // Address Document Name
        const addrDoc = addrTypes.find(
          x =>
            String(x.Code) ===
            String(kycData.documents.addressProof.docTypeCode),
        );

        setProvinceName(p?.Name || kycData.address.provinceCode);
        setDistrictName(d?.Name || kycData.address.districtCode);

        setIdDocName(
          idDoc?.Name || kycData.documents.identityProof.docTypeCode,
        );
        setAddrDocName(
          addrDoc?.Name || kycData.documents.addressProof.docTypeCode,
        );
      } catch (err) {
        console.log('Master data load error', err);
      }
    }

    loadMaster();
  }, [kycData]);
  // ---------------------------------------------------------------------
  // DATE FORMATTER  → "MM/DD/YYYY 00:00:00"
  // ---------------------------------------------------------------------
  const formatKycDateTime = value => {
    if (!value) return '';
    if (value.includes('00:00:00')) return value;

    const m1 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (m1) return `${m1[2]}/${m1[3]}/${m1[1]} 00:00:00`;

    const m2 = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (m2) return `${value} 00:00:00`;

    return value;
  };

  // ---------------------------------------------------------------------
  // HANDLE SUBMIT
  // ---------------------------------------------------------------------
  const handleSubmit = () => {
    Alert.alert(
      'Submit KYC?',
      'Are you sure you want to submit your KYC details?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: submitNow,
        },
      ],
    );
  };

  const submitNow = async () => {
    const username = user?.username;

    const personal = kycData.personal || {};
    const addr = kycData.address || {};
    const contact = kycData.contact || {};
    const docs = kycData.documents || {};

    const addrDoc = docs.addressProof || {};
    const idDoc = docs.identityProof || {};

    const payload = {
      Address: addr.residentialAddress || '',
      Province: addr.provinceCode || '',
      District: addr.districtCode || '',
      UserName: username,

      Address_DocName: addrDoc.docTypeCode || '',
      Address_DocNumber: addrDoc.docNo || '',
      Address_DocExpiryDate: formatKycDateTime(addrDoc.expiryDate),

      Id_DocName: idDoc.docTypeCode || '',
      Id_DocNumber: idDoc.docNo || '',
      Id_DocExpiryDate: formatKycDateTime(idDoc.expiryDate),

      Email_Id: contact.email || '',
      MobileNumber: contact.mobile || '',

      AddressProofDoc: {
        documentName: 'AddressProof.jpg',
        documentContent: addrDoc.attachmentBase64 || '',
      },
      IdProofDoc: {
        documentName: 'IdProof.jpg',
        documentContent: idDoc.attachmentBase64 || '',
      },
    };

    //console.log("📤 Final payload:", JSON.stringify(payload, null, 2));

    try {
      setSubmitting(true);
      const res = await submitKycDetails(payload);

      if (res.executionStatus === 'Success') {
        const reqId = res?.outParams?.RequestId || '';
        Alert.alert(
          'Success',
          reqId
            ? `We have successfully received your request.\n\nYour Request ID is ${reqId}.\nUse this Request ID for tracking.`
            : 'We have successfully received your request.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to your main/home screen
                navigation.navigate('MainDrawer');

                // Or if you want to reset the navigation stack completely:
                // navigation.reset({
                //   index: 0,
                //   routes: [{ name: 'MainDrawer' }],
                // });
              },
            },
          ],
        );
        navigation.navigate('MainDrawer');
      } else {
        Alert.alert('Failed', res.executionMessage || 'KYC submit failed.');
      }
    } catch (err) {
      console.log('❌ Submit error:', err);
      Alert.alert('Error', err?.message || 'KYC submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------
  // EDIT LINK
  // ---------------------------------------------------------------------
  const editLink = screenName => (
    <Text
      style={[formStyles.link, { marginBottom: spacing.xs }]}
      onPress={() => navigation.navigate(screenName)}
    >
      Edit
    </Text>
  );

  // ---------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------
  return (
    <ScrollView
      style={formStyles.flexContainer}
      contentContainerStyle={[formStyles.container, { paddingBottom: 40 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={formStyles.container}>
        <Text style={[formStyles.sectionTitle]}>Review Your KYC Details</Text>

        {/* ---------------------------------- */}
        {/* PERSONAL */}
        {/* ---------------------------------- */}
        <View style={formStyles.card}>
          <Text style={formStyles.sectionTitle}>
            Personal Details - {editLink('KYCDetails')}
          </Text>

          <Text style={formStyles.infoLabel}>First Name</Text>
          <Text style={formStyles.infoValue}>
            {kycData.personal.firstName || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Middle Name</Text>
          <Text style={formStyles.infoValue}>
            {kycData.personal.middleName || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Last Name</Text>
          <Text style={formStyles.infoValue}>
            {kycData.personal.lastName || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Gender</Text>
          <Text style={formStyles.infoValue}>
            {kycData.personal.gender || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Date of Birth</Text>
          <Text style={formStyles.infoValue}>
            {kycData.personal.dob || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>NRC</Text>
          <Text style={formStyles.infoValue}>
            {kycData.personal.nrc || '-'}
          </Text>
        </View>

        {/* ---------------------------------- */}
        {/* ADDRESS */}
        {/* ---------------------------------- */}
        <View style={formStyles.card}>
          <Text style={formStyles.sectionTitle}>
            Address Details - {editLink('KycAddressScreen')}
          </Text>

          <Text style={formStyles.infoLabel}>Province</Text>
          <Text style={formStyles.infoValue}>{provinceName || '-'}</Text>

          <Text style={formStyles.infoLabel}>District</Text>
          <Text style={formStyles.infoValue}>{districtName || '-'}</Text>

          <Text style={formStyles.infoLabel}>Residential Address</Text>
          <Text style={formStyles.infoValue}>
            {kycData.address.residentialAddress || '-'}
          </Text>
        </View>

        {/* ---------------------------------- */}
        {/* CONTACT */}
        {/* ---------------------------------- */}
        <View style={formStyles.card}>
          <Text style={formStyles.sectionTitle}>
            Contact Details - {editLink('KycEmailScreen')}
          </Text>

          <Text style={formStyles.infoLabel}>Email</Text>
          <Text style={formStyles.infoValue}>
            {kycData.contact.email || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Mobile</Text>
          <Text style={formStyles.infoValue}>
            {kycData.contact.mobile || '-'}
          </Text>
        </View>

        {/* ---------------------------------- */}
        {/* ADDRESS PROOF */}
        {/* ---------------------------------- */}
        <View style={formStyles.card}>
          <Text style={formStyles.sectionTitle}>
            Address Proof - {editLink('KycDocumentsScreen')}
          </Text>

          <Text style={formStyles.infoLabel}>Document Type</Text>
          <Text style={formStyles.infoValue}>
            {/* {kycData.documents.addressProof.docTypeCode || '-'}
             */}
            {addrDocName || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Document Number</Text>
          <Text style={formStyles.infoValue}>
            {kycData.documents.addressProof.docNo || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Expiry</Text>
          <Text style={formStyles.infoValue}>
            {kycData.documents.addressProof.expiryDate || '-'}
          </Text>

          {kycData.documents.addressProof.attachmentBase64 ? (
            <Image
              source={{
                uri: `data:image/jpeg;base64,${kycData.documents.addressProof.attachmentBase64}`,
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.border,
                marginTop: spacing.sm,
              }}
            />
          ) : null}
        </View>

        {/* ---------------------------------- */}
        {/* ID PROOF */}
        {/* ---------------------------------- */}
        <View style={formStyles.card}>
          <Text style={formStyles.sectionTitle}>
            Identity Proof - {editLink('KycDocumentsScreen')}
          </Text>

          <Text style={formStyles.infoLabel}>Document Type</Text>
          <Text style={formStyles.infoValue}>
            {/* {kycData.documents.identityProof.docTypeCode || '-'} */}
            {idDocName || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Document Number</Text>
          <Text style={formStyles.infoValue}>
            {kycData.documents.identityProof.docNo || '-'}
          </Text>

          <Text style={formStyles.infoLabel}>Expiry</Text>
          <Text style={formStyles.infoValue}>
            {kycData.documents.identityProof.expiryDate || '-'}
          </Text>

          {kycData.documents.identityProof.attachmentBase64 ? (
            <Image
              source={{
                uri: `data:image/jpeg;base64,${kycData.documents.identityProof.attachmentBase64}`,
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: colors.border,
                marginTop: spacing.sm,
              }}
            />
          ) : null}
        </View>

        {/* SUBMIT */}
        <View style={{ marginTop: spacing.xl }}>
          <AppButton
            title={submitting ? 'Submitting...' : 'Submit KYC'}
            onPress={handleSubmit}
            disabled={submitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}
