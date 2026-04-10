// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   Alert,
//   Image,
// } from 'react-native';

// import AppInput from '../ui/AppInput';
// import AppButton from '../ui/AppButton';
// import { formStyles } from '../styles/formstyles';
// import { layoutStyles } from '../styles/layoutStyles';
// import { spacing, colors } from '../theme';
// import EncryptedStorage from 'react-native-encrypted-storage';
// import { uploadStyles } from '../styles/uploadStyles';

// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import ImagePickerCrop from 'react-native-image-crop-picker';
// import RNFS from 'react-native-fs';

// // ------------------------------------
// // Helpers
// // ------------------------------------
// const formatCurrency = (num) => {
//   if (!num) return '';
//   const cleaned = num.toString().replace(/,/g, '');
//   const number = Number(cleaned);
//   if (isNaN(number)) return '';
//   return new Intl.NumberFormat('en-IN').format(number);
// };

// const toNumber = (str) => {
//   if (!str) return 0;
//   return Number(str.replace(/,/g, '')) || 0;
// };

// export default function IncomeDetailsScreen({ navigation }) {
//   // Earnings
//   const [basicPay, setBasicPay] = useState('');
//   const [allowance, setAllowance] = useState('');
//   const [otherIncome, setOtherIncome] = useState('');
//   const [grossIncome, setGrossIncome] = useState('');

//   // Deductions
//   const [taxes, setTaxes] = useState('');
//   const [otherDeductions, setOtherDeductions] = useState('');
//   const [totalDeductions, setTotalDeductions] = useState('');

//   // Net Income
//   const [netIncome, setNetIncome] = useState('');

//   // Payslip
//   const [fileData, setFileData] = useState(null);

//   // Username
//   const [userName, setUserName] = useState('');

//   useEffect(() => {
//     (async () => {
//       const u = await EncryptedStorage.getItem('userName');
//       if (u) setUserName(u);
//     })();
//   }, []);

//   // Auto calculation
//   useEffect(() => {
//     const gross =
//       toNumber(basicPay) + toNumber(allowance) + toNumber(otherIncome);
//     setGrossIncome(formatCurrency(gross));

//     const deductions = toNumber(taxes) + toNumber(otherDeductions);
//     setTotalDeductions(formatCurrency(deductions));

//     const net = gross - deductions;
//     setNetIncome(formatCurrency(net));
//   }, [basicPay, allowance, otherIncome, taxes, otherDeductions]);

//   // ------------------------------------
//   // File Validation
//   // ------------------------------------
//   const validateFile = (file) => {
//     const sizeMB = file.size / (1024 * 1024);
//     if (sizeMB > 4) {
//       Alert.alert('Error', 'File size exceeds 4MB limit.');
//       return false;
//     }

//     const ext = file.fileName?.split('.').pop().toLowerCase();
//     const allowed = ['png', 'jpg', 'jpeg', 'pdf'];
//     if (!allowed.includes(ext)) {
//       Alert.alert('Invalid File', 'Only PDF, PNG, JPG, JPEG allowed.');
//       return false;
//     }
//     return true;
//   };

//   // ------------------------------------
//   // Upload From Gallery
//   // ------------------------------------
//   const pickFromGallery = async () => {
//     try {
//       const res = await launchImageLibrary({
//         mediaType: 'mixed',
//       });

//       if (!res.assets || res.didCancel) return;
//       const asset = res.assets[0];

//       if (!validateFile(asset)) return;

//       // PDF
//       if (asset.type === 'application/pdf') {
//         const base64 = await RNFS.readFile(asset.uri, 'base64');
//         setFileData({
//           base64,
//           fileName: asset.fileName,
//           fileType: 'pdf',
//           size: asset.fileSize,
//         });
//         return;
//       }

//       // Image → compress
//       const compressed = await ImagePickerCrop.openCropper({
//         path: asset.uri,
//         width: 1200,
//         height: 1500,
//         compressImageQuality: 0.5,
//         cropping: false,
//       });

//       const base64 = await RNFS.readFile(compressed.path, 'base64');
//       setFileData({
//         base64,
//         fileName: asset.fileName,
//         fileType: 'image',
//         size: compressed.size,
//         uri: compressed.path,
//       });
//     } catch (err) {
//       Alert.alert('Error', 'Failed to upload file.');
//     }
//   };

//   // ------------------------------------
//   // Capture Using Camera
//   // ------------------------------------
//   const captureUsingCamera = async () => {
//     try {
//       const res = await launchCamera({
//         mediaType: 'photo',
//       });
//       if (!res.assets || res.didCancel) return;

//       const asset = res.assets[0];
//       if (!validateFile(asset)) return;

//       const compressed = await ImagePickerCrop.openCropper({
//         path: asset.uri,
//         width: 1200,
//         height: 1500,
//         compressImageQuality: 0.5,
//         cropping: false,
//       });

//       const base64 = await RNFS.readFile(compressed.path, 'base64');

//       setFileData({
//         base64,
//         fileName: asset.fileName || 'payslip.jpg',
//         fileType: 'image',
//         size: compressed.size,
//         uri: compressed.path,
//       });
//     } catch (err) {
//       Alert.alert('Error', 'Camera failed.');
//     }
//   };

//   // ------------------------------------
//   // Submit
//   // ------------------------------------
//   const handleSubmit = () => {
//     if (!basicPay || !allowance || !grossIncome) {
//       Alert.alert('Missing Data', 'Please fill all income details.');
//       return;
//     }
//     if (!fileData) {
//       Alert.alert('Missing Document', 'Please upload your payslip.');
//       return;
//     }

//     const payload = {
//       userName,
//       basicPay: toNumber(basicPay),
//       allowance: toNumber(allowance),
//       otherIncome: toNumber(otherIncome),
//       grossIncome: toNumber(grossIncome),
//       taxes: toNumber(taxes),
//       otherDeductions: toNumber(otherDeductions),
//       totalDeductions: toNumber(totalDeductions),
//       netIncome: toNumber(netIncome),
//       payslipFileName: fileData.fileName,
//       payslipBase64: fileData.base64,
//       payslipType: fileData.fileType,
//     };

//     console.log('📤 SUBMIT PAYLOAD:', payload);

//     Alert.alert('Success', 'Income details captured.');
//   };

//   return (
//     <ScrollView contentContainerStyle={formStyles.scrollContainer}>

//       {/* Earnings */}
//       <View style={formStyles.card}>
//         <Text style={formStyles.sectionTitle}>Earnings</Text>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Basic Pay (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={basicPay}
//               keyboardType="numeric"
//               onChangeText={(t) => setBasicPay(formatCurrency(t))}
//             />
//           </View>
//         </View>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Monthly Allowance (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={allowance}
//               keyboardType="numeric"
//               onChangeText={(t) => setAllowance(formatCurrency(t))}
//             />
//           </View>
//         </View>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Other Income (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={otherIncome}
//               keyboardType="numeric"
//               onChangeText={(t) => setOtherIncome(formatCurrency(t))}
//             />
//           </View>
//         </View>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Gross Income (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={grossIncome}
//               editable={false}
//             />
//           </View>
//         </View>
//       </View>


//       {/* Deductions */}
//       <View style={formStyles.card}>
//         <Text style={formStyles.sectionTitle}>Deductions</Text>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Taxes (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={taxes}
//               keyboardType="numeric"
//               onChangeText={(t) => setTaxes(formatCurrency(t))}
//             />
//           </View>
//         </View>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Other Deductions (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={otherDeductions}
//               keyboardType="numeric"
//               onChangeText={(t) => setOtherDeductions(formatCurrency(t))}
//             />
//           </View>
//         </View>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Total Deductions (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={totalDeductions}
//               editable={false}
//             />
//           </View>
//         </View>
//       </View>


//       {/* Net */}
//       <View style={formStyles.card}>
//         <Text style={formStyles.sectionTitle}>Net Income</Text>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Net Income (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               value={netIncome}
//               editable={false}
//             />
//           </View>
//         </View>
//       </View>


//       {/* Payslip */}
//       <View style={formStyles.card}>
//         <Text style={formStyles.sectionTitle}>Payslip Upload</Text>
//         <View style={formStyles.infoRow}>

//           <AppButton
//             title="File Upload"
//             variant="outline"
//             onPress={pickFromGallery}
//             style={{ flex: 1, marginRight: spacing.sm }}
//           />

//           <AppButton
//             title="Camera"
//             variant="outline"
//             onPress={captureUsingCamera}
//             style={{ flex: 1, marginRight: spacing.sm }}
//           />

//         </View>

//         {fileData && (
//           <View style={uploadStyles.container}>

//             {fileData.fileType === 'pdf' ? (
//               <Text style={uploadStyles.pdfText}>📄 {fileData.fileName}</Text>
//             ) : (
//               <Image
//                 source={{ uri: fileData.uri }}
//                 style={uploadStyles.imagePreview}
//               />
//             )}

//             <Text style={uploadStyles.fileSize}>
//               {(fileData.size / (1024 * 1024)).toFixed(2)} MB
//             </Text>
//           </View>
//         )}
//       </View>

//       <AppButton
//         title="Submit Income Details"
//         onPress={handleSubmit}
//         style={{ marginTop: spacing.lg }}
//       />
//     </ScrollView>
//   );
// }
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Image,
} from 'react-native';

import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';

import { formStyles } from '../styles/formstyles';
import { layoutStyles } from '../styles/layoutStyles';
import { spacing, colors } from '../theme/spacing';
import { uploadStyles } from '../styles/uploadStyles';
import { useAuth } from '../apicontext/AuthContext';
import EncryptedStorage from 'react-native-encrypted-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
//import ImagePickerCrop from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';

// ✅ NEW IMPORT (your API)
import { getCustomerDetails } from '../api/customer/GetCustomerIncom';
// console.log('LayoutStyles >>', layoutStyles);
// console.log('FormStyles >>', formStyles);
// console.log('uploadStyles >>', uploadStyles);
// console.log('Spacing >>', spacing);
// console.log('user >>', EncryptedStorage.user);
// ------------------------------------
// Helpers
// ------------------------------------
const formatCurrency = (num) => {
  if (!num) return '';
  const cleaned = num.toString().replace(/,/g, '');
  const number = Number(cleaned);
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('en-IN').format(number);
};

const toNumber = (str) => {
  if (!str) return 0;
  return Number(str.replace(/,/g, '')) || 0;
};

export default function IncomeDetailsScreen({ navigation }) {
  // Earnings
  const [basicPay, setBasicPay] = useState('');
  const [allowance, setAllowance] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [grossIncome, setGrossIncome] = useState('');

  // Deduction
  const [taxes, setTaxes] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [totalDeductions, setTotalDeductions] = useState('');

  // Net
  const [netIncome, setNetIncome] = useState('');

  // Payslip
  const [fileData, setFileData] = useState(null);

  // Username
  const { user } = useAuth();
  const userName = user?.userName;
  console.log("🔵 Fetching income details for:", EncryptedStorage.userName);

  // Store IDs For Future Update API
  const [incomeCodes, setIncomeCodes] = useState({
    basic: null,
    allowance: null,
    other: null,
  });

  const [deductionCodes, setDeductionCodes] = useState({
    taxes: null,
    others: null,
  });


  // --------------------------------------------------
  // Fetch Existing Income Details
  // --------------------------------------------------
  useEffect(() => {
    if (!userName) return;

    (async () => {
      try {
        
        const response = await getCustomerDetails(userName);

        if (!response || response.executionStatus !== 'Success') return;

        const incomeList = Object.values(response.gridParams?.IncomeDetails || {});
        const deductionList = Object.values(response.gridParams?.DeductionDetails || {});

        // Map Income
        incomeList.forEach(item => {
          switch (item.ID_ComponentId) {
            case "1":   // Basic Pay
              setBasicPay(formatCurrency(item.ID_Amount));
              setIncomeCodes(prev => ({
                ...prev,
                basic: {
                  id: item.ID_ID,
                  componentId: item.ID_ComponentId
                }
              }));
              break;

            case "2":   // Allowance
              setAllowance(formatCurrency(item.ID_Amount));
              setIncomeCodes(prev => ({
                ...prev,
                allowance: {
                  id: item.ID_ID,
                  componentId: item.ID_ComponentId
                }
              }));
              break;

            case "3":   // Other Income
              setOtherIncome(formatCurrency(item.ID_Amount));
              setIncomeCodes(prev => ({
                ...prev,
                other: {
                  id: item.ID_ID,
                  componentId: item.ID_ComponentId
                }
              }));
              break;
          }
        });

        // Map Deductions
        deductionList.forEach(item => {
          switch (item.DD_ComponentId) {
            case "4":   // Taxes
              setTaxes(formatCurrency(item.DD_Amount));
              setDeductionCodes(prev => ({
                ...prev,
                taxes: {
                  id: item.DD_ID,
                  componentId: item.DD_ComponentId
                }
              }));
              break;

            case "5":   // Other Deduction
              setOtherDeductions(formatCurrency(item.DD_Amount));
              setDeductionCodes(prev => ({
                ...prev,
                others: {
                  id: item.DD_ID,
                  componentId: item.DD_ComponentId
                }
              }));
              break;
          }
        });

      } catch (err) {
        console.log("❌ GetCustomerIncome Error:", err);
      }
    })();

  }, [userName]);

  // --------------------------------------------------
  // Auto-calculation
  // --------------------------------------------------
  useEffect(() => {
    const gross =
      toNumber(basicPay) + toNumber(allowance) + toNumber(otherIncome);
    setGrossIncome(formatCurrency(gross));

    const deductions = toNumber(taxes) + toNumber(otherDeductions);
    setTotalDeductions(formatCurrency(deductions));

    const net = gross - deductions;
    setNetIncome(formatCurrency(net));
  }, [basicPay, allowance, otherIncome, taxes, otherDeductions]);

  // ------------------------------------
  // File Validation
  // ------------------------------------
  const validateFile = (file) => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 4) {
      Alert.alert('Error', 'File size exceeds 4MB limit.');
      return false;
    }

    const ext = file.fileName?.split('.').pop().toLowerCase();
    const allowed = ['png', 'jpg', 'jpeg', 'pdf'];
    if (!allowed.includes(ext)) {
      Alert.alert('Invalid File', 'Only PDF, PNG, JPG, JPEG allowed.');
      return false;
    }
    return true;
  };

  // ------------------------------------
  // Gallery Upload
  // ------------------------------------
  const pickFromGallery = async () => {
    try {
      const res = await launchImageLibrary({ mediaType: 'mixed' });
      if (!res.assets || res.didCancel) return;

      const asset = res.assets[0];
      if (!validateFile(asset)) return;

      // PDF
      if (asset.type === 'application/pdf') {
        const base64 = await RNFS.readFile(asset.uri, 'base64');
        setFileData({
          base64,
          fileName: asset.fileName,
          fileType: 'pdf',
          size: asset.fileSize,
        });
        return;
      }

      // Image compress
      // const compressed = await ImagePickerCrop.openCropper({
      //   path: asset.uri,
      //   width: 1200,
      //   height: 1500,
      //   compressImageQuality: 0.5,
      //   cropping: false,
      // });

      const base64 = await RNFS.readFile(compressed.path, 'base64');

      setFileData({
        base64,
        fileName: asset.fileName,
        fileType: 'image',
        size: compressed.size,
        uri: compressed.path,
      });

    } catch (err) {
      Alert.alert('Error', 'Failed to upload.');
    }
  };

  // ------------------------------------
  // Camera Upload
  // ------------------------------------
  const captureUsingCamera = async () => {
    try {
      const res = await launchCamera({ mediaType: 'photo' });
      if (!res.assets || res.didCancel) return;

      const asset = res.assets[0];
      if (!validateFile(asset)) return;

      // const compressed = await ImagePickerCrop.openCropper({
      //   path: asset.uri,
      //   width: 1200,
      //   height: 1500,
      //   compressImageQuality: 0.5,
      //   cropping: false,
      // });

      const base64 = await RNFS.readFile(compressed.path, 'base64');

      setFileData({
        base64,
        fileName: asset.fileName || 'payslip.jpg',
        fileType: 'image',
        size: compressed.size,
        uri: compressed.path,
      });

    } catch (err) {
      Alert.alert('Error', 'Camera failed.');
    }
  };

  // ------------------------------------
  // Submit
  // ------------------------------------
  const handleSubmit = () => {
    if (!basicPay || !allowance) {
      Alert.alert('Missing Data', 'Please fill all income details.');
      return;
    }

    if (!fileData) {
      Alert.alert('Missing Document', 'Please upload your payslip.');
      return;
    }

    // NEW — Include codes for backend update API
    const payload = {
      userName,

      // Income
      basic: {
        amount: toNumber(basicPay),
        ...incomeCodes.basic
      },
      allowance: {
        amount: toNumber(allowance),
        ...incomeCodes.allowance
      },
      otherIncome: {
        amount: toNumber(otherIncome),
        ...incomeCodes.other
      },

      // Deductions
      taxes: {
        amount: toNumber(taxes),
        ...deductionCodes.taxes
      },
      otherDeductions: {
        amount: toNumber(otherDeductions),
        ...deductionCodes.others
      },

      // Summaries
      grossIncome: toNumber(grossIncome),
      totalDeductions: toNumber(totalDeductions),
      netIncome: toNumber(netIncome),

      // Payslip
      payslip: fileData
    };

    console.log("📤 FINAL PAYLOAD TO SUBMIT:", payload);
    Alert.alert("Success", "Income details captured.");
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <ScrollView contentContainerStyle={formStyles.container}>

      {/* Earnings */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Earnings</Text>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Basic Pay (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              value={basicPay}
              keyboardType="numeric"
              onChangeText={(t) => setBasicPay(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Monthly Allowance (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              value={allowance}
              keyboardType="numeric"
              onChangeText={(t) => setAllowance(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Other Income (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              value={otherIncome}
              keyboardType="numeric"
              onChangeText={(t) => setOtherIncome(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Gross Income (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput value={grossIncome} editable={false} />
          </View>
        </View>
      </View>

      {/* Deductions */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Deductions</Text>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Taxes (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              value={taxes}
              keyboardType="numeric"
              onChangeText={(t) => setTaxes(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Other Deductions (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              value={otherDeductions}
              keyboardType="numeric"
              onChangeText={(t) => setOtherDeductions(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Total Deductions (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput value={totalDeductions} editable={false} />
          </View>
        </View>
      </View>

      {/* Net */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Net Income</Text>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Net Income (₹)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput value={netIncome} editable={false} />
          </View>
        </View>
      </View>

      {/* Payslip */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Payslip Upload</Text>

        <View style={layoutStyles.row}>
          <AppButton
            title="File Upload"
            variant="outline"
            onPress={pickFromGallery}
            style={{ flex: 1, marginRight: spacing.sm }}
          />

          <AppButton
            title="Camera"
            variant="outline"
            onPress={captureUsingCamera}
            style={{ flex: 1 }}
          />
        </View>

        {fileData && (
          <View style={uploadStyles.container}>
            {fileData.fileType === 'pdf' ? (
              <Text style={uploadStyles.pdfText}>📄 {fileData.fileName}</Text>
            ) : (
              <Image
                source={{ uri: fileData.uri }}
                style={uploadStyles.imagePreview}
              />
            )}

            <Text style={uploadStyles.fileSize}>
              {(fileData.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          </View>
        )}
      </View>

      <AppButton
        title="Submit Income Details"
        onPress={handleSubmit}
        style={{ marginTop: spacing.lg }}
      />

    </ScrollView>
  );
}
