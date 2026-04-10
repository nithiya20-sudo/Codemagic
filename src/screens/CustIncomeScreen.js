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
// import { spacing } from '../theme';
// import { uploadStyles } from '../styles/uploadStyles';
// import { getCustomerDetails } from '../api/customer/getCustomerIncome';
// import { useAuth } from '../apicontext/AuthContext';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import RNFS from 'react-native-fs';
// import { updateCustomerIncome } from '../api/customer/updateCustomerIncome';

// // import DocumentPicker from 'react-native-document-picker';
// // ------------------------------------
// // Helpers
// // ------------------------------------
// const formatCurrency = (raw) => {
//   if (raw === null || raw === undefined) return "";

//   let value = raw.toString().replace(/,/g, "");

//   // Allow typing these cases:
//   // 123
//   // 123.
//   // 123.4
//   // 123.45
//   if (/^\d+(\.\d{0,2})?$/.test(value)) {
//     return value;
//   }

//   // Allow just "." while typing
//   if (value === ".") return "0.";

//   // If invalid → don't update the field
//   return raw;
// };

// const toNumber = (str) => {
//   if (!str) return 0;
//   return Number(str.toString().replace(/,/g, '')) || 0;
// };

// // ------------------------------------
// // Main Component
// // ------------------------------------
// export default function IncomeDetailsScreen({ navigation }) {
//   // Username
//   const { user } = useAuth();
//   const userName = user?.username || user?.userName || '';

//   console.log('🔵 Fetching income details for:', userName);

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

//   const [isLoading, setIsLoading] = useState(false);

//   // ------------------------------------
//   // Auto calculation
//   // ------------------------------------
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
//   // Load existing Income Details from API
//   // ------------------------------------
//   useEffect(() => {
//     if (!userName) return;
//     loadIncomeDetails();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [userName]);

//   const loadIncomeDetails = async () => {
//     try {
//       setIsLoading(true);

//       const res = await getCustomerDetails(userName);
//       const data = res?.data?.executionStatus ? res.data : res;

//       if (!data || data.executionStatus !== 'Success') {
//         console.warn('⚠ Income details load failed:', data?.executionMessage);
//         setIsLoading(false);
//         return;
//       }

//       const incomeMap = data.gridParams?.IncomeDetails || {};
//       const deductionMap = data.gridParams?.DeductionDetails || {};

//       const incomeArr = Object.values(incomeMap);
//       const deductionArr = Object.values(deductionMap);

//       const findIncome = (desc) =>
//         incomeArr.find((x) => x.ID_Description === desc);

//       const findDeduction = (desc) =>
//         deductionArr.find((x) => x.DD_Description === desc);

//       const basicObj = findIncome('Basic Pay');
//       const allowanceObj = findIncome('Monthly Allowance');
//       const otherIncomeObj = findIncome('Other Income');

//       const taxesObj = findDeduction('Taxes');
//       const otherDedObj = findDeduction('Other Deductions');

//       if (basicObj?.ID_Amount) {
//         setBasicPay(formatCurrency(basicObj.ID_Amount));
//       }
//       if (allowanceObj?.ID_Amount) {
//         setAllowance(formatCurrency(allowanceObj.ID_Amount));
//       }
//       if (otherIncomeObj?.ID_Amount) {
//         setOtherIncome(formatCurrency(otherIncomeObj.ID_Amount));
//       }

//       if (taxesObj?.DD_Amount) {
//         setTaxes(formatCurrency(taxesObj.DD_Amount));
//       }
//       if (otherDedObj?.DD_Amount) {
//         setOtherDeductions(formatCurrency(otherDedObj.DD_Amount));
//       }

//       // 🔹 Future: load payslip if backend sends it
//       const payslip = data.outParams?.PayslipDocument;
//       if (payslip) {
//         const base64 = payslip.base64 || payslip.Base64 || '';
//         const fileName = payslip.fileName || payslip.FileName || 'payslip';
//         const fileType = payslip.fileType || payslip.FileType || 'pdf';

//         let sizeBytes = 0;
//         if (base64) {
//           sizeBytes = Math.round((base64.length * 3) / 4);
//         }

//         setFileData({
//           base64,
//           fileName,
//           fileType,
//           uri:
//             fileType === 'image'
//               ? `data:image/jpeg;base64,${base64}`
//               : null,
//           size: sizeBytes,
//         });
//       }

//       setIsLoading(false);
//     } catch (err) {
//       console.error('❌ Error loading income details:', err);
//       setIsLoading(false);
//       Alert.alert('Error', 'Failed to load income details.');
//     }
//   };

//   // ------------------------------------
//   // File Validation
//   // ------------------------------------
//   const validateFile = (file) => {
//     const sizeBytes = file.fileSize || file.size || 0;
//     const sizeMB = sizeBytes / (1024 * 1024);

//     if (sizeMB > 4) {
//       Alert.alert('Error', 'File size exceeds 4MB limit.');
//       return false;
//     }

//     const rawName = file.fileName || file.name || '';
//     const ext = rawName.includes('.') ? rawName.split('.').pop().toLowerCase() : '';

//     if (ext) {
//       const allowed = ['png', 'jpg', 'jpeg', 'pdf'];
//       if (!allowed.includes(ext)) {
//         Alert.alert('Invalid File', 'Only PDF, PNG, JPG, JPEG allowed.');
//         return false;
//       }
//     }

//     return true;
//   };

//   // ------------------------------------
//   // File Upload (Images only) using react-native-image-picker
//   // ------------------------------------
//   const handleFileSelect = async () => {
//     try {
//       const result = await launchImageLibrary({
//         mediaType: 'photo',        // ✅ images only (stable)
//         includeBase64: true,
//         quality: 0.7,
//         maxWidth: 1200,
//         maxHeight: 1600,
//         selectionLimit: 1,
//       });

//       if (result.didCancel) return;

//       const asset = result.assets?.[0];
//       if (!asset) return;

//       const { uri, base64, fileName, fileSize, type } = asset;

//       const fakeAsset = {
//         fileName,
//         fileSize,
//         type,
//         uri,
//       };

//       if (!validateFile(fakeAsset)) return;

//       let finalBase64 = base64;
//       if (!finalBase64 && uri) {
//         const path = uri.replace('file://', '');
//         finalBase64 = await RNFS.readFile(path, 'base64');
//       }

//       if (!finalBase64) {
//         Alert.alert('Error', 'Unable to read selected image.');
//         return;
//       }

//       setFileData({
//         base64: finalBase64,
//         fileName: fileName || 'payslip.jpg',
//         fileType: 'image',
//         size: fileSize || 0,
//         uri,
//       });
//     } catch (err) {
//       console.error('❌ File picker error:', err);
//       Alert.alert('Error', 'Failed to pick file.');
//     }
//   };

//   // ------------------------------------
//   // Capture Using Camera (image only)
//   // ------------------------------------
//   const captureUsingCamera = async () => {
//     try {
//       const res = await launchCamera({
//         mediaType: 'photo',
//         includeBase64: true,
//         maxWidth: 1200,
//         maxHeight: 1600,
//         quality: 0.7,
//       });

//       if (res.didCancel || !res.assets || res.assets.length === 0) return;

//       const asset = res.assets[0];

//       if (!validateFile(asset)) return;

//       let base64 = asset.base64;
//       if (!base64 && asset.uri) {
//         const path = asset.uri?.replace('file://', '') || asset.uri;
//         base64 = await RNFS.readFile(path, 'base64');
//       }

//       if (!base64) {
//         Alert.alert('Error', 'Unable to read captured image.');
//         return;
//       }

//       setFileData({
//         base64,
//         fileName: asset.fileName || 'payslip.jpg',
//         fileType: 'image',
//         size: asset.fileSize || 0,
//         uri: asset.uri,
//       });
//     } catch (err) {
//       console.error('❌ Camera capture error:', err);
//       Alert.alert('Error', 'Camera failed.');
//     }
//   };

//   // ------------------------------------
//   // Submit (Save API pending)
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

//     console.log('📤 SUBMIT PAYLOAD (TODO: call Save API):', payload);

//     Alert.alert(
//       'Info',
//       'Income details prepared. Save API integration pending from backend.'
//     );
//   };

//   // ------------------------------------
//   // Render
//   // ------------------------------------
//   return (
//     <ScrollView contentContainerStyle={formStyles.scrollContainer}>
//       {/* Earnings */}
//       <View style={formStyles.card}>
//         <Text style={formStyles.sectionTitle}>Earnings</Text>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Basic Pay (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput
//               variant="amount"
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
//             variant="amount"
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
//             variant="amount"
//               value={otherIncome}
//               keyboardType="numeric"
//               onChangeText={(t) => setOtherIncome(formatCurrency(t))}
//             />
//           </View>
//         </View>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Gross Income (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput variant="amount" value={grossIncome} editable={false} />
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
//             variant="amount"
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
//             variant="amount"
//               value={otherDeductions}
//               keyboardType="numeric"
//               onChangeText={(t) => setOtherDeductions(formatCurrency(t))}
//             />
//           </View>
//         </View>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Total Deductions (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput variant="amount" value={totalDeductions} editable={false} />
//           </View>
//         </View>
//       </View>

//       {/* Net */}
//       <View style={formStyles.card}>
//         <Text style={formStyles.sectionTitle}>Net Income</Text>

//         <View style={formStyles.fieldRow}>
//           <Text style={formStyles.fieldLabelInline}>Net Income (₹)</Text>
//           <View style={formStyles.fieldControl}>
//             <AppInput variant="amount"value={netIncome} editable={false} />
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
//             onPress={handleFileSelect}
//             style={{ flex: 1, marginRight: spacing.sm }}
//           />

//           <AppButton
//             title="Camera"
//             variant="outline"
//             onPress={captureUsingCamera}
//             style={{ flex: 1, marginLeft: spacing.sm }}
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
//               {fileData.size
//                 ? `${(fileData.size / (1024 * 1024)).toFixed(2)} MB`
//                 : 'Size: N/A'}
//             </Text>
//           </View>
//         )}
//       </View>

//       <AppButton
//         title={isLoading ? 'Loading…' : 'Submit Income Details'}
//         onPress={handleSubmit}
//         disabled={isLoading}
//         style={{ marginTop: spacing.lg }}
//       />
//     </ScrollView>
//   );
// }
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Image } from 'react-native';

import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import { formStyles } from '../styles/formstyles';
import { spacing } from '../theme';
import { uploadStyles } from '../styles/uploadStyles';
import { getCustomerDetails } from '../api/customer/getCustomerIncome';
import { useAuth } from '../apicontext/AuthContext';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { updateCustomerIncome } from '../api/customer/updateCustomerIncome';

// ------------------------------------
// Helpers
// ------------------------------------
const formatCurrency = raw => {
  if (raw === null || raw === undefined) return '';

  let value = raw.toString().replace(/,/g, '');

  // Allow:
  // 123
  // 123.
  // 123.4
  // 123.45
  if (/^\d+(\.\d{0,2})?$/.test(value)) {
    return value;
  }

  // Allow "." while typing
  if (value === '.') return '0.';

  // If invalid → keep previous
  return raw;
};

const toNumber = str => {
  if (!str) return 0;
  return Number(str.toString().replace(/,/g, '')) || 0;
};

// ------------------------------------
// Main Component
// ------------------------------------
export default function IncomeDetailsScreen({ navigation }) {
  const { user } = useAuth();
  const userName = user?.username || user?.userName || '';

  console.log('🔵 Fetching income details for:', userName);

  // Earnings
  const [basicPay, setBasicPay] = useState('');
  const [allowance, setAllowance] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [grossIncome, setGrossIncome] = useState('');

  // Deductions
  const [taxes, setTaxes] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [totalDeductions, setTotalDeductions] = useState('');

  // Net Income
  const [netIncome, setNetIncome] = useState('');

  // Full rows from GET (to preserve all IDs / Category / Component)
  const [incomeRowsOriginal, setIncomeRowsOriginal] = useState([]);
  const [deductionRowsOriginal, setDeductionRowsOriginal] = useState([]);

  // Payslip
  const [fileData, setFileData] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------------------------
  // Auto calculation
  // ------------------------------------
  useEffect(() => {
    const gross =
      toNumber(basicPay) + toNumber(allowance) + toNumber(otherIncome);
    const deductions = toNumber(taxes) + toNumber(otherDeductions);
    const net = gross - deductions;

    setGrossIncome(gross ? gross.toFixed(2) : '');
    setTotalDeductions(deductions ? deductions.toFixed(2) : '');
    setNetIncome(net ? net.toFixed(2) : '');
  }, [basicPay, allowance, otherIncome, taxes, otherDeductions]);

  // ------------------------------------
  // Load existing Income Details from API
  // ------------------------------------
  useEffect(() => {
    if (!userName) return;
    loadIncomeDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  const loadIncomeDetails = async () => {
    try {
      setIsLoading(true);

      const res = await getCustomerDetails(userName);
      const data = res?.data?.executionStatus ? res.data : res;

      if (!data || data.executionStatus !== 'Success') {
        console.warn('⚠ Income details load failed:', data?.executionMessage);
        setIsLoading(false);
        return;
      }

      // Example structure from you:
      // data.gridParams.IncomeDetails = { "0": { ID_Description, ID_Amount, ... }, ... }
      const incomeMap = data.gridParams?.IncomeDetails || {};
      const deductionMap = data.gridParams?.DeductionDetails || {};

      const incomeArr = Object.values(incomeMap);
      const deductionArr = Object.values(deductionMap);

      // 🔹 Store full rows so we can send them back later
      setIncomeRowsOriginal(incomeArr);
      setDeductionRowsOriginal(deductionArr);

      const findIncome = desc => incomeArr.find(x => x.ID_Description === desc);

      const findDeduction = desc =>
        deductionArr.find(x => x.DD_Description === desc);

      const basicObj = findIncome('Basic Pay');
      const allowanceObj = findIncome('Monthly Allowance');
      const otherIncomeObj = findIncome('Other Income');

      const taxesObj = findDeduction('Taxes');
      const otherDedObj = findDeduction('Other Deductions');

      if (basicObj?.ID_Amount) {
        setBasicPay(formatCurrency(basicObj.ID_Amount));
      }
      if (allowanceObj?.ID_Amount) {
        setAllowance(formatCurrency(allowanceObj.ID_Amount));
      }
      if (otherIncomeObj?.ID_Amount) {
        setOtherIncome(formatCurrency(otherIncomeObj.ID_Amount));
      }
      if (taxesObj?.DD_Amount) {
        setTaxes(formatCurrency(taxesObj.DD_Amount));
      }
      if (otherDedObj?.DD_Amount) {
        setOtherDeductions(formatCurrency(otherDedObj.DD_Amount));
      }

      // For now response has PayslipDocument = null
      // If backend later sends it, we can pre-populate preview:
      const payslip = data.outParams?.PayslipDocument;
      if (payslip) {
        const base64 = payslip.base64 || payslip.Base64 || '';
        const fileName = payslip.fileName || payslip.FileName || 'payslip';
        const fileType = payslip.fileType || payslip.FileType || 'image';

        let sizeBytes = 0;
        if (base64) {
          sizeBytes = Math.round((base4.length * 3) / 4);
        }

        setFileData({
          base64,
          fileName,
          fileType,
          uri: fileType === 'image' ? `data:image/jpeg;base64,${base64}` : null,
          size: sizeBytes,
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error('❌ Error loading income details:', err);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load income details.');
    }
  };

  // ------------------------------------
  // File Validation
  // ------------------------------------
  const validateFile = file => {
    const sizeBytes = file.fileSize || file.size || 0;
    const sizeMB = sizeBytes / (1024 * 1024);

    if (sizeMB > 4) {
      Alert.alert('Error', 'File size exceeds 4MB limit.');
      return false;
    }

    const rawName = file.fileName || file.name || '';
    const ext = rawName.includes('.')
      ? rawName.split('.').pop().toLowerCase()
      : '';

    if (ext) {
      const allowed = ['png', 'jpg', 'jpeg', 'pdf'];
      if (!allowed.includes(ext)) {
        Alert.alert('Invalid File', 'Only PDF, PNG, JPG, JPEG allowed.');
        return false;
      }
    }

    return true;
  };

  // ------------------------------------
  // File Upload (Images only) using react-native-image-picker
  // ------------------------------------
  const handleFileSelect = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.7,
        maxWidth: 1200,
        maxHeight: 1600,
        selectionLimit: 1,
      });

      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      const { uri, base64, fileName, fileSize, type } = asset;

      const fakeAsset = {
        fileName,
        fileSize,
        type,
        uri,
      };

      if (!validateFile(fakeAsset)) return;

      let finalBase64 = base64;
      if (!finalBase64 && uri) {
        const path = uri.replace('file://', '');
        finalBase64 = await RNFS.readFile(path, 'base64');
      }

      if (!finalBase64) {
        Alert.alert('Error', 'Unable to read selected image.');
        return;
      }

      setFileData({
        base64: finalBase64,
        fileName: fileName || 'Payslip.jpg',
        fileType: 'image',
        size: fileSize || 0,
        uri,
      });
    } catch (err) {
      console.error('❌ File picker error:', err);
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  // ------------------------------------
  // Capture Using Camera (image only)
  // ------------------------------------
  const captureUsingCamera = async () => {
    try {
      const res = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 0.7,
      });

      if (res.didCancel || !res.assets || res.assets.length === 0) return;

      const asset = res.assets[0];

      if (!validateFile(asset)) return;

      let base64 = asset.base64;
      if (!base64 && asset.uri) {
        const path = asset.uri?.replace('file://', '') || asset.uri;
        base64 = await RNFS.readFile(path, 'base64');
      }

      if (!base64) {
        Alert.alert('Error', 'Unable to read captured image.');
        return;
      }

      setFileData({
        base64,
        fileName: asset.fileName || 'Payslip.jpg',
        fileType: 'image',
        size: asset.fileSize || 0,
        uri: asset.uri,
      });
    } catch (err) {
      console.error('❌ Camera capture error:', err);
      Alert.alert('Error', 'Camera failed.');
    }
  };

  // ------------------------------------
  // Build GridData structures for Update API
  // ------------------------------------
  const buildIncomeGridData = () => {
    // Map descriptions → current amounts from UI
    const incomeAmountByDesc = {
      'Basic Pay': basicPay,
      'Monthly Allowance': allowance,
      'Other Income': otherIncome,
    };

    const gridData = {};

    incomeRowsOriginal.forEach((row, index) => {
      const desc = row.ID_Description;
      const rawAmount =
        incomeAmountByDesc[desc] !== undefined
          ? incomeAmountByDesc[desc]
          : row.ID_Amount;

      const amountNum = toNumber(rawAmount);
      const amountStr = amountNum ? amountNum.toFixed(2) : '0.00';

      gridData[String(index)] = {
        eColl: {
          ID_Description: { Value: row.ID_Description || '' },
          ID_Amount: { Value: amountStr },
          ID_ID: { Value: row.ID_ID || '' },
          ID_CategoryId: { Value: row.ID_CategoryId || '' },
          ID_ComponentId: { Value: row.ID_ComponentId || '' },
          ID_Category: { Value: row.ID_Category || '' },
        },
      };
    });

    return { GridData: gridData };
  };

  const buildDeductionGridData = () => {
    const deductionAmountByDesc = {
      Taxes: taxes,
      'Other Deductions': otherDeductions,
    };

    const gridData = {};

    deductionRowsOriginal.forEach((row, index) => {
      const desc = row.DD_Description;
      const rawAmount =
        deductionAmountByDesc[desc] !== undefined
          ? deductionAmountByDesc[desc]
          : row.DD_Amount;

      const amountNum = toNumber(rawAmount);
      const amountStr = amountNum ? amountNum.toFixed(2) : '0.00';

      gridData[String(index)] = {
        eColl: {
          DD_Description: { Value: row.DD_Description || '' },
          DD_Amount: { Value: amountStr },
          DD_ID: { Value: row.DD_ID || '' },
          DD_CategoryId: { Value: row.DD_CategoryId || '' },
          DD_ComponentId: { Value: row.DD_ComponentId || '' },
          DD_Category: { Value: row.DD_Category || '' },
        },
      };
    });

    return { GridData: gridData };
  };

  // ------------------------------------
  // Submit (Update API)
  // ------------------------------------
  const handleSubmit = async () => {
    if (!basicPay || !allowance || !grossIncome) {
      Alert.alert('Missing Data', 'Please fill all income details.');
      return;
    }

    if (!fileData) {
      Alert.alert('Missing Document', 'Please upload your payslip.');
      return;
    }

    const grossNum = toNumber(grossIncome);
    const totalDedNum = toNumber(totalDeductions);
    const netNum = toNumber(netIncome);

    const incomeGrid = buildIncomeGridData();
    const deductionGrid = buildDeductionGridData();

    const payload = {
      GrossIncome: grossNum ? grossNum.toFixed(2) : '0.00',
      TotalDeductions: totalDedNum ? totalDedNum.toFixed(2) : '0.00',
      NetIncome: netNum ? netNum.toFixed(2) : '0.00',
      UserName: userName,

      Payslip: {
        documentName: fileData.fileName || 'Payslip.jpg',
        documentContent: fileData.base64 || '',
      },

      IncomeDetails: incomeGrid,
      DeductionDetails: deductionGrid,
    };

    console.log('📤 Final Update Payload:', JSON.stringify(payload, null, 2));

    try {
      setIsSubmitting(true);
      const res = await updateCustomerIncome(payload);

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
      } else {
        Alert.alert('Failed', res.executionMessage || 'Update failed.');
      }
    } catch (err) {
      console.log('❌ Update error:', err);
      Alert.alert('Error', err?.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------
  // Render
  // ------------------------------------
  return (
    <ScrollView contentContainerStyle={formStyles.scrollContainer}>
      {/* Earnings */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Earnings</Text>

        <View style={[formStyles.fieldRow, { alignItems: 'center' }]}>
          <Text style={formStyles.fieldLabelInline}>Basic Pay </Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              value={basicPay}
              keyboardType="numeric"
              onChangeText={t => setBasicPay(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Monthly Allowance </Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              value={allowance}
              keyboardType="numeric"
              onChangeText={t => setAllowance(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Other Income </Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              value={otherIncome}
              keyboardType="numeric"
              onChangeText={t => setOtherIncome(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Gross Income </Text>
          <View style={formStyles.fieldControl}>
            <AppInput variant="amount" value={grossIncome} editable={false} />
          </View>
        </View>
      </View>

      {/* Deductions */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Deductions</Text>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Taxes</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              value={taxes}
              keyboardType="numeric"
              onChangeText={t => setTaxes(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Other Deductions </Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              value={otherDeductions}
              keyboardType="numeric"
              onChangeText={t => setOtherDeductions(formatCurrency(t))}
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Total Deductions </Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              value={totalDeductions}
              editable={false}
            />
          </View>
        </View>
      </View>

      {/* Net */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Net Income</Text>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Net Income </Text>
          <View style={formStyles.fieldControl}>
            <AppInput variant="amount" value={netIncome} editable={false} />
          </View>
        </View>
      </View>

      {/* Payslip */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Payslip Upload</Text>
        <View style={formStyles.infoRow}>
          <AppButton
            title="File Upload"
            variant="outline"
            onPress={handleFileSelect}
            style={{ flex: 1, marginRight: spacing.sm }}
          />

          <AppButton
            title="Camera"
            variant="outline"
            onPress={captureUsingCamera}
            style={{ flex: 1, marginLeft: spacing.sm }}
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
              {fileData.size
                ? `${(fileData.size / (1024 * 1024)).toFixed(2)} MB`
                : 'Size: N/A'}
            </Text>
          </View>
        )}
      </View>

      <AppButton
        title={
          isSubmitting
            ? 'Submitting...'
            : isLoading
            ? 'Loading…'
            : 'Submit Income Details'
        }
        onPress={handleSubmit}
        disabled={isLoading || isSubmitting}
        style={{ marginTop: spacing.lg, marginBottom: spacing.xl }}
      />
    </ScrollView>
  );
}
