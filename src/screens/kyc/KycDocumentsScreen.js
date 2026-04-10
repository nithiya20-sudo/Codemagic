// // src/screens/kyc/KycDocumentsScreen.js
// import React, { useEffect, useState } from 'react';
// import { View, Text, Image, Alert, ScrollView } from 'react-native';
// import AppInput from '../../ui/AppInput';
// import AppButton from '../../ui/AppButton';
// import AppPicker from '../../ui/AppPicker';
// import AppDatePicker from '../../ui/AppDatePicker';
// import formatDateFromServer from'../../utils/dateUtils';

// import { formStyles } from '../../styles/formstyles';
// import { colors, spacing } from '../../theme';

// import EncryptedStorage from 'react-native-encrypted-storage';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// import { useKyc } from './KycContext';

// const MASTER_DATA_KEY = 'MASTER_DATA';

// export default function KycDocumentsScreen({ navigation }) {
//   const { kycData, updateSection } = useKyc();

//   const [idDocTypes, setIdDocTypes] = useState([]);
//   const [addrDocTypes, setAddrDocTypes] = useState([]);

//   // -------------------------
//   // LOCAL STATES
//   // -------------------------
//   const [idType, setIdType] = useState(kycData.documents.identityProof.docTypeCode || '');
//   const [idNumber, setIdNumber] = useState(kycData.documents.identityProof.docNo || '');
//   const [idExpiry, setIdExpiry] = useState(kycData.documents.identityProof.expiryDate || '');
//   const [idImage, setIdImage] = useState(kycData.documents.identityProof.attachmentBase64 || '');

//   const [addrType, setAddrType] = useState(kycData.documents.addressProof.docTypeCode || '');
//   const [addrNumber, setAddrNumber] = useState(kycData.documents.addressProof.docNo || '');
//   const [addrExpiry, setAddrExpiry] = useState(kycData.documents.addressProof.expiryDate || '');
//   const [addrImage, setAddrImage] = useState(kycData.documents.addressProof.attachmentBase64 || '');

//   // -------------------------
//   // LOAD MASTER DATA
//   // -------------------------
//   useEffect(() => {
//     async function loadMaster() {
//       try {
//         const raw = await EncryptedStorage.getItem(MASTER_DATA_KEY);
//         if (!raw) throw new Error('MasterData missing');
//         const json = JSON.parse(raw);
//         console.log(json);
//         const idTypes =
//           json?.iddoctypes ||
//           json?.DocumentTypes?.IDProofDocumentTypes ||
//           [];

//         const addrTypes =
//           json?.addoctypes ||
//           json?.DocumentTypes?.AddressProofDocumentTypes ||
//           [];

//         setIdDocTypes(idTypes);
//         setAddrDocTypes(addrTypes);

//       } catch (err) {
//         console.log('Error loading master data:', err);
//         Alert.alert('Error', 'Unable to load document master data.');
//       }
//     }
//     loadMaster();
//   }, []);

//   // -------------------------
//   // IMAGE PICKER HANDLER
//   // -------------------------
//   const pickImage = () =>
//     new Promise((resolve, reject) => {
//       Alert.alert(
//         'Upload Document',
//         'Choose an option',
//         [
//           { text: 'Camera', onPress: () => launchCamera({ mediaType: 'photo', includeBase64: true }, resolve) },
//           { text: 'Gallery', onPress: () => launchImageLibrary({ mediaType: 'photo', includeBase64: true }, resolve) },
//           { text: 'Cancel', style: 'cancel', onPress: () => reject('cancel') },
//         ],
//         { cancelable: true }
//       );
//     });

//   const handleUpload = async (which) => {
//     try {
//       const res = await pickImage();
//       if (!res || !res.assets || !res.assets[0]) return;

//       const base64 = res.assets[0].base64;
//       const uri = res.assets[0].uri;

//       if (which === 'id') {
//         setIdImage(base64);
//       } else {
//         setAddrImage(base64);
//       }
//     } catch (e) {
//       console.log('Upload cancelled:', e);
//     }
//   };

//   // -------------------------
//   // VALIDATION + NEXT
//   // -------------------------
//   const handleNext = () => {
//     if (!idType || !idNumber || !idExpiry || !idImage) {
//       Alert.alert('Validation', 'Please complete Identity Proof details.');
//       return;
//     }
//     if (!addrType || !addrNumber || !addrExpiry || !addrImage) {
//       Alert.alert('Validation', 'Please complete Address Proof details.');
//       return;
//     }

//     updateSection('documents', {
//       addressProof: {
//         docTypeCode: addrType,
//         docNo: addrNumber,
//         expiryDate: addrExpiry,
//         attachmentBase64: addrImage,
//       },
//       identityProof: {
//         docTypeCode: idType,
//         docNo: idNumber,
//         expiryDate: idExpiry,
//         attachmentBase64: idImage,
//       },
//     });

//     navigation.navigate('KycReviewScreen'); // Next step
//   };

//   // -------------------------
//   // UI
//   // -------------------------
//   return (
//     <ScrollView contentContainerStyle={formStyles.container}>
//       <View style={formStyles.card}>

//         {/* ======================= */}
//         {/*  ADDRESS PROOF SECTION  */}
//         {/* ======================= */}
//         <Text style={formStyles.sectionTitle}>Address Proof</Text>

//         <AppPicker
//           label="Address Proof Type"
//           placeholder="Select document type"
//           items={addrDocTypes.map(d => ({ label: d.Name, value: d.Code }))}
//           selectedValue={addrType}
//           onValueChange={setAddrType}
//         />

//         <AppInput
//           label="Document Number"
//           value={addrNumber}
//           onChangeText={setAddrNumber}
//           placeholder="Enter document number"
//         />
//         <AppDatePicker
//           value={addrExpiry}
//           onChange={setAddrExpiry}
//           placeholder="YYYY-MM-DD"
//         />

//         <AppButton
//           title="Upload Address Proof"
//           onPress={() => handleUpload('addr')}
//           style={{ marginTop: spacing.md }}
//         />

//         {addrImage ? (
//           <View style={{ marginTop: spacing.sm, alignItems: 'center' }}>
//             <Image
//               source={{ uri: `data:image/jpeg;base64,${addrImage}` }}
//               style={{
//                 width: 80,
//                 height: 80,
//                 borderRadius: 6,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//               }}
//             />
//             <Text
//               onPress={() => setAddrImage('')}
//               style={[formStyles.link, { marginTop: spacing.xs }]}
//             >
//               Remove Document
//             </Text>
//           </View>
//         ) : null}

//         {/* ======================= */}
//         {/*  ID PROOF SECTION       */}
//         {/* ======================= */}
//         <Text style={[formStyles.sectionTitle, { marginTop: spacing.lg }]}>Identity Proof</Text>

//         <AppPicker
//           label="Identity Proof Type"
//           placeholder="Select document type"
//           items={idDocTypes.map(d => ({ label: d.Name, value: d.Code }))}
//           selectedValue={idType}
//           onValueChange={setIdType}
//         />

//         <AppInput
//           label="Document Number"
//           value={idNumber}
//           onChangeText={setIdNumber}
//           placeholder="Enter document number"
//         />

//         <AppDatePicker
//           value={idExpiry}
//           onChange={setIdExpiry}
//           placeholder="YYYY-MM-DD"
//         />

//         <AppButton
//           title="Upload Identity Proof"
//           onPress={() => handleUpload('id')}
//           style={{ marginTop: spacing.md }}
//         />

//         {idImage ? (
//           <View style={{ marginTop: spacing.sm, alignItems: 'center' }}>
//             <Image
//               source={{ uri: `data:image/jpeg;base64,${idImage}` }}
//               style={{
//                 width: 80,
//                 height: 80,
//                 borderRadius: 6,
//                 borderWidth: 1,
//                 borderColor: colors.border,
//               }}
//             />
//             <Text
//               onPress={() => setIdImage('')}
//               style={[formStyles.link, { marginTop: spacing.xs }]}
//             >
//               Remove Document
//             </Text>
//           </View>
//         ) : null}

//         {/* ======================= */}
//         {/*  BUTTONS                */}
//         {/* ======================= */}
//         <View
//           style={{ flexDirection: 'row', marginTop: spacing.lg, justifyContent: 'space-between' }}
//         >

//         </View>

//       </View>
//       <View style={formStyles.container}>
//         <View style={[formStyles.infoRow]}>

//           <AppButton title="Back" variant="secondary" style={{ flex: 1 }} onPress={() => navigation.goBack()} />

//           <AppButton title="Next" style={{ flex: 1 }} onPress={handleNext} />

//         </View></View>
//     </ScrollView >
//   );
// }
// src/screens/kyc/KycDocumentsScreen.js
// src/screens/kyc/KycDocumentsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, ScrollView } from 'react-native';

import AppInput from '../../ui/AppInput';
import AppButton from '../../ui/AppButton';
import AppPicker from '../../ui/AppPicker';
import AppDatePicker from '../../ui/AppDatePicker';

import { formStyles } from '../../styles/formstyles';
import { colors, spacing } from '../../theme';

import EncryptedStorage from 'react-native-encrypted-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { useKyc } from './KycContext';

const MASTER_DATA_KEY = 'MASTER_DATA';

export default function KycDocumentsScreen({ navigation }) {
  const { kycData, updateSection } = useKyc();

  // -------------------------
  // MASTER DATA
  // -------------------------
  const [idDocTypes, setIdDocTypes] = useState([]);
  const [addrDocTypes, setAddrDocTypes] = useState([]);

  useEffect(() => {
    async function loadMaster() {
      try {
        const raw = await EncryptedStorage.getItem(MASTER_DATA_KEY);
        if (!raw) throw new Error('MasterData missing');

        const json = JSON.parse(raw);

        const idTypes =
          json?.iddoctypes || json?.DocumentTypes?.IDProofDocumentTypes || [];

        const addrTypes =
          json?.addoctypes ||
          json?.DocumentTypes?.AddressProofDocumentTypes ||
          [];

        setIdDocTypes(idTypes);
        setAddrDocTypes(addrTypes);
      } catch (err) {
        console.log('Error loading master data:', err);
        Alert.alert('Error', 'Unable to load document master data.');
      }
    }
    loadMaster();
  }, []);

  // -------------------------
  // LOCAL STATES
  // -------------------------
  const [idType, setIdType] = useState(
    kycData.documents.identityProof.docTypeCode || '',
  );
  const [idNumber, setIdNumber] = useState(
    kycData.documents.identityProof.docNo || '',
  );
  const [idExpiry, setIdExpiry] = useState(
    kycData.documents.identityProof.expiryDate || '',
  );
  const [idImage, setIdImage] = useState(
    kycData.documents.identityProof.attachmentBase64 || '',
  );
  const [idImageError, setIdImageError] = useState('');
  const [idImageSize, setIdImageSize] = useState(null);

  const [addrType, setAddrType] = useState(
    kycData.documents.addressProof.docTypeCode || '',
  );
  const [addrNumber, setAddrNumber] = useState(
    kycData.documents.addressProof.docNo || '',
  );
  const [addrExpiry, setAddrExpiry] = useState(
    kycData.documents.addressProof.expiryDate || '',
  );
  const [addrImage, setAddrImage] = useState(
    kycData.documents.addressProof.attachmentBase64 || '',
  );
  const [addrImageError, setAddrImageError] = useState('');
  const [addrImageSize, setAddrImageSize] = useState(null);

  // -------------------------
  // IMAGE HANDLER (4MB limit + compression)handleNext
  // -------------------------
  const pickImage = () =>
    new Promise((resolve, reject) => {
      Alert.alert(
        'Upload Document',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: () =>
              launchCamera(
                { mediaType: 'photo', includeBase64: true, quality: 0.6 },
                resolve,
              ),
          },
          {
            text: 'Gallery',
            onPress: () =>
              launchImageLibrary(
                { mediaType: 'photo', includeBase64: true, quality: 0.6 },
                resolve,
              ),
          },
          { text: 'Cancel', style: 'cancel', onPress: () => reject('cancel') },
        ],
        { cancelable: true },
      );
    });

  const handleUpload = async which => {
    try {
      const res = await pickImage();
      if (!res || !res.assets || !res.assets[0]) return;

      const base64 = res.assets[0].base64;

      // CALCULATE SIZE
      const bytes = (base64.length * 3) / 4;
      const mb = bytes / (1024 * 1024);

      if (mb > 4) {
        Alert.alert(
          'File too large',
          `Selected image is ${mb.toFixed(2)} MB.\nLimit is 4 MB.`,
        );
        return;
      }

      // UPDATE STATE
      if (which === 'id') {
        setIdImage(base64);
        setIdImageError('');
        setIdImageSize(mb.toFixed(2));
      } else {
        setAddrImage(base64);
        setAddrImageError('');
        setAddrImageSize(mb.toFixed(2));
      }
    } catch (e) {
      console.log('Upload cancelled:', e);
    }
  };

  // -------------------------
  // NEXT
  // -------------------------
  const handleNext = () => {
    if (!addrType || !addrImage) {
      Alert.alert('Validation', 'Please complete Address Proof details.');
      return;
    }

    if (!idType || !idImage) {
      Alert.alert('Validation', 'Please complete Identity Proof details.');
      return;
    }

    // if (new Date(addrExpiry) <= new Date()) {
    //   Alert.alert('Validation', 'Address Proof expiry must be in the future.');
    //   return;
    // }

    // if (new Date(idExpiry) <= new Date()) {
    //   Alert.alert('Validation', 'Identity Proof expiry must be in the future.');
    //   return;
    // }
    updateSection('documents', {
      addressProof: {
        docTypeCode: addrType,
        docNo: addrNumber || '',
        expiryDate: addrExpiry || '',
        attachmentBase64: addrImage,
      },
      identityProof: {
        docTypeCode: idType,
        docNo: idNumber || '', // optional
        expiryDate: idExpiry || '',
        attachmentBase64: idImage,
      },
    });

    navigation.navigate('KycReviewScreen');
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7fa' }}>
      {/* ------------------------- */}
      {/* Top Buttons */}
      {/* ------------------------- */}

      {/* ------------------------- */}
      {/* Scrollable Form */}
      {/* ------------------------- */}
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={formStyles.card}>
          {/* ======================= */}
          {/* ADDRESS PROOF */}
          {/* ======================= */}
          <Text style={formStyles.sectionTitle}>Address Proof</Text>

          <AppPicker
            label="Address Proof Type"
            placeholder="Select document type"
            items={addrDocTypes.map(d => ({ label: d.Name, value: d.Code }))}
            selectedValue={addrType}
            onValueChange={setAddrType}
          />

          <AppInput
            label="Document Number"
            value={addrNumber}
            onChangeText={setAddrNumber}
            placeholder="Enter document number"
          />

          <AppDatePicker
            value={addrExpiry}
            onChange={setAddrExpiry}
            placeholder="Select Expiry Date"
            minimumDate={new Date()}
          />

          <AppButton
            title="Upload Address Proof"
            onPress={() => handleUpload('addr')}
            style={{ marginTop: spacing.md }}
          />

          {addrImageError && (
            <Text style={{ color: colors.failure, marginTop: spacing.xs }}>
              {addrImageError}
            </Text>
          )}

          {addrImage && (
            <View style={{ marginTop: spacing.sm, alignItems: 'center' }}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${addrImage}` }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />

              {addrImageSize && (
                <Text style={{ color: colors.mutedText, marginTop: 4 }}>
                  Size: {addrImageSize} MB
                </Text>
              )}

              <Text
                onPress={() => {
                  setAddrImage('');
                  setAddrImageError('');
                  setAddrImageSize(null);
                }}
                style={[formStyles.link, { marginTop: spacing.xs }]}
              >
                Remove Document
              </Text>
            </View>
          )}

          {/* ======================= */}
          {/* ID PROOF */}
          {/* ======================= */}
          <Text style={[formStyles.sectionTitle, { marginTop: spacing.lg }]}>
            Identity Proof
          </Text>

          <AppPicker
            label="Identity Proof Type"
            placeholder="Select document type"
            items={idDocTypes.map(d => ({ label: d.Name, value: d.Code }))}
            selectedValue={idType}
            onValueChange={setIdType}
          />

          <AppInput
            label="Document Number"
            value={idNumber}
            onChangeText={setIdNumber}
            placeholder="Enter document number"
          />

          <AppDatePicker
            value={idExpiry}
            onChange={setIdExpiry}
            placeholder="Select Expiry Date"
            minimumDate={new Date()}
          />

          <AppButton
            title="Upload Identity Proof"
            onPress={() => handleUpload('id')}
            style={{ marginTop: spacing.md }}
          />

          {idImageError && (
            <Text style={{ color: colors.failure, marginTop: spacing.xs }}>
              {idImageError}
            </Text>
          )}

          {idImage && (
            <View style={{ marginTop: spacing.sm, alignItems: 'center' }}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${idImage}` }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              />

              {idImageSize && (
                <Text style={{ color: colors.mutedText, marginTop: 4 }}>
                  Size: {idImageSize} MB
                </Text>
              )}

              <Text
                onPress={() => {
                  setIdImage('');
                  setIdImageError('');
                  setIdImageSize(null);
                }}
                style={[formStyles.link, { marginTop: spacing.xs }]}
              >
                Remove Document
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            padding: spacing.md,
            borderBottomWidth: 1,
            borderColor: '#ccc',
            // backgroundColor: '#fff',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            <AppButton
              title="Back"
              variant="secondary"
              onPress={() => navigation.goBack()}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <AppButton title="Next" onPress={handleNext} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
