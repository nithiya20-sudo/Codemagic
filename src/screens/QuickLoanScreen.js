import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';

import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import AppPicker from '../ui/AppPicker';

import { formStyles } from '../styles/formstyles';
import { spacing, colors } from '../theme';
import { useAuth } from '../apicontext/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { getAffordability } from '../api/customer/getAffordability';
import { getCreditScore } from '../api/customer/getCreditScore'; // 🔹 You will implement this wrapper

import {
  stripToNumber,
  stripToInteger,
  displayAmount,
} from '../utils/formatters';
import { pickImageWithPrompt } from '../utils/imagePicker';
import SignatureBox from '../ui/SignatureBox';
import { submitQuickLoanDetails } from '../api/customer/submitQuickLoanDetails';

export default function QuickLoanScreen({ navigation, route }) {
  const { user } = useAuth();
  const userName = user?.username || user?.userName || '';
  const { autoAffordability } = route.params || {};

  const [autoCalled, setAutoCalled] = useState(false);

  // 🔹 Internal Steps:
  // 1 → Amount/Tenure + Affordability
  // 2 → Product select
  // 3 → Product summary + additional fields
  // 4 → Documents + TransUnion consent checkbox
  // 5 → Credit Score + T&C + Signature
  // 6 → Result
  const [step, setStep] = useState(1);

  // -------- Step 1 – Inputs & Affordability --------
  const [tenure, setTenure] = useState('');
  const [loanAmount, setLoanAmount] = useState('');

  // Income summary
  const [grossIncome, setGrossIncome] = useState('');
  const [totalDeductions, setTotalDeductions] = useState('');
  const [netIncome, setNetIncome] = useState('');

  // Products (from affordability)
  const [products, setProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // -------- Step 2 – Product selection --------
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);

  // -------- Step 3 – Additional Details --------
  const [noOfDependants, setNoOfDependants] = useState('');
  const [modeOfRepayment, setModeOfRepayment] = useState('');
  const [otherIncome, setOtherIncome] = useState('');

  // 🔹 T&C Popup Modal
  const [tcModalVisible, setTcModalVisible] = useState(false);
  // Checkbox state (read-only toggle)

  // Sample dropdown options – adjust as per real values from DB / API if needed
  const modeOfRepaymentOptions = [
    { label: 'Salary Deduction', value: '1' },
    { label: 'Standing Order', value: '3' },
    { label: 'Cash Deposit', value: '6' },
    { label: 'Deduction at Source', value: '2' },
    { label: 'Others', value: '5' },
    { label: 'Rentals', value: '4' },
  ];

  const otherIncomeOptions = [
    { label: 'None', value: 'NONE' },
    { label: 'Rental Income', value: 'RENTAL' },
    { label: 'Business Income', value: 'BUSINESS' },
    { label: 'Other', value: 'OTHER' },
  ];

  // -------- Step 4 – Documents + Consent --------
  const [idProof, setIdProof] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [incomeProof, setIncomeProof] = useState(null);
  const [otherDoc, setOtherDoc] = useState(null);

  const [scoreConsentAccepted, setScoreConsentAccepted] = useState(false);

  // -------- Step 5 – Credit Score + T&C + Signature --------
  const [tcAccepted, setTcAccepted] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);

  const [creditScoreLoading, setCreditScoreLoading] = useState(false);
  const [creditScore, setCreditScore] = useState(null);
  const [creditScoreGrade, setCreditScoreGrade] = useState(null);
  const [creditScoreError, setCreditScoreError] = useState(null);
  const [creditScoreFetched, setCreditScoreFetched] = useState(false);

  // -------- Step 6 – Result --------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  //-----step 7 -- retain-----
  const [retainedRequestId, setRetainedRequestId] = useState(null);
  const [retainedInstanceId, setRetainedInstanceId] = useState(null);
  // 🔹 Persistent ID for this screen session
  const sourceInstanceRef = React.useRef(null);

  useEffect(() => {
    if (!sourceInstanceRef.current) {
      sourceInstanceRef.current = generateSourceInstanceId();
      console.log('🆕 Generated SourceInstanceId:', sourceInstanceRef.current);
    }
  }, []);

  const generateSourceInstanceId = () => {
    return (
      'SRC-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  };

  // ---------- Helpers ----------
  const formatAmount = raw => {
    if (raw === null || raw === undefined) return '';
    let v = raw.toString().replace(/,/g, '');
    if (/^\d+(\.\d{0,2})?$/.test(v)) return v;
    if (v === '.') return '0.';
    return raw;
  };

  const removeIdProof = () => setIdProof(null);
  const removeAddressProof = () => setAddressProof(null);
  const removeIncomeProof = () => setIncomeProof(null);
  const removeOtherDoc = () => setOtherDoc(null);

  const hasAllMandatoryDocs = !!(idProof && addressProof && incomeProof);

  useEffect(() => {
    if (autoAffordability && !autoCalled && tenure && loanAmount) {
      handleCheckAffordability();
      setAutoCalled(true);
    }
  }, [autoAffordability, autoCalled, tenure, loanAmount]);

  // ---------- Product Card Renderer ----------
  const renderProductCardForSelection = (item, index) => {
    const isSelected = selectedProductIndex === index;

    return (
      <TouchableOpacity
        key={item.productUniqueId || item.productId || index.toString()}
        style={[
          formStyles.card,
          {
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: isSelected ? colors.primary : '#E0E0E0',
          },
        ]}
        activeOpacity={0.9}
        onPress={() => setSelectedProductIndex(index)}
      >
        {/* Radio + Product Name */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xs,
          }}
        >
          <MaterialIcons
            name={
              isSelected ? 'radio-button-checked' : 'radio-button-unchecked'
            }
            size={22}
            color={isSelected ? colors.primary : '#666'}
          />
          <Text
            style={[formStyles.infoValue, { marginLeft: spacing.xs }]}
            numberOfLines={2}
          >
            {item.productName}
          </Text>
        </View>

        {/* ROI */}
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>ROI:</Text>
          <Text style={formStyles.productCardValueStrong}>{item.roi}</Text>
        </View>

        {/* EMI */}
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>EMI:</Text>
          <Text style={formStyles.productCardValueStrong}>
            {displayAmount(item.emi)}
          </Text>
        </View>

        {/* Max Amount */}
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>Max Amount:</Text>
          <Text style={formStyles.productCardValueStrong}>
            {displayAmount(item.maxAmount)}
          </Text>
        </View>

        {/* Disbursement & Upfront – small row */}
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>Disbursement:</Text>
          <Text style={formStyles.productCardValue}>
            {displayAmount(item.disbursementAmount)}
          </Text>
        </View>
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>Upfront Charges:</Text>
          <Text style={formStyles.productCardValue}>
            {displayAmount(item.upfrontCharges)}
          </Text>
        </View>

        {/* Affordable Badge */}
        <View style={formStyles.productCardBadgeRow}>
          <Text
            style={[
              formStyles.productCardBadge,
              item.affordable
                ? formStyles.productCardBadgeYes
                : formStyles.productCardBadgeNo,
            ]}
          >
            {item.affordable ? 'AFFORDABLE' : 'NOT AFFORDABLE'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ---------- Document Card Renderer ----------
  // const renderDocumentCard = (
  //   title,
  //   doc,
  //   onPressPick,
  //   onRemove,
  //   mandatory = true,
  // ) => {
  //   return (
  //     <View style={formStyles.docCard}>
  //       {/* Title + Optional */}
  //       <View style={formStyles.docHeaderRow}>
  //         <Text style={formStyles.docTitle}>{title}</Text>
  //         {!mandatory && <Text style={formStyles.docOptional}>(Optional)</Text>}
  //       </View>

  //       {/* Preview or Placeholder */}
  //       {doc?.uri ? (
  //         <View style={formStyles.docPreviewRow}>
  //           <Image
  //             source={{ uri: doc.uri }}
  //             style={formStyles.docPreviewImage}
  //           />
  //           <TouchableOpacity
  //             onPress={onRemove}
  //             style={formStyles.docRemoveBtn}
  //           >
  //             <MaterialIcons name="delete" size={24} color={colors.error} />
  //           </TouchableOpacity>
  //         </View>
  //       ) : (
  //         <View style={formStyles.docPlaceholder}>
  //           <MaterialIcons name="insert-drive-file" size={32} color="#999" />
  //           <Text style={formStyles.docPlaceholderText}>No file</Text>
  //         </View>
  //       )}

  //       {/* Upload Button */}
  //       <TouchableOpacity onPress={onPressPick} style={formStyles.docUploadBtn}>
  //         <MaterialIcons name="upload-file" size={26} color={colors.primary} />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  // ---------- Step 1 – Check Affordability ----------
  const handleCheckAffordability = async () => {
    Keyboard.dismiss();
    if (!tenure || !loanAmount) {
      Alert.alert('Missing Data', 'Please enter Tenure and Loan Amount.');
      return;
    }

    if (!userName) {
      Alert.alert('Error', 'User not found in context.');
      return;
    }

    try {
      setIsChecking(true);

      const apiRes = await getAffordability({
        CustomerUserName: userName,
        LoanAmount: Number(loanAmount.replace(/,/g, '')),
        Tenure: Number(tenure),
        LoanTypeId: 3,
        LoanNo: 0,
      });
      console.log(apiRes);

      if (apiRes.executionStatus !== 'Success') {
        Alert.alert('Error', apiRes.executionMessage || 'API failed');
        return;
      }

      const raw = apiRes.gridParams?.Affordability || {};
      const list = Object.values(raw);
      console.log(JSON.stringify(list, null, 2));
      if (list.length === 0) {
        setProducts([]);
        setProductsCount(0);
        Alert.alert('Info', 'No products available.');
        return;
      }

      // Income summary
      const gross = apiRes.outParams.GrossIncome;
      const dedamt = apiRes.outParams.Deductions;
      const netamt = apiRes.outParams.NetIncome;

      setGrossIncome(formatAmount(gross));
      setTotalDeductions(formatAmount(dedamt));
      setNetIncome(formatAmount(netamt));

      // 🔹 Map products including Disbursement, Upfront, and Unique ID
      const mapped = list.map((p, index) => ({
        productId: p.ProductId || index.toString(),

        // ✅ Mapping ID (used for loan creation)
        employerProductMapId: p.EmployerProductMapID,

        // ✅ REAL unique/source instance id (used for integration)
        sourceInstanceId: p.SourceInstanceId || p.UniqueId || p.InstanceId,

        productName: p.Product,
        roi: p.InterestRate + '%',
        emi: formatAmount(p.EMIAmount),
        maxAmount: formatAmount(p.MaxAffordableAmount),
        disbursementAmount: formatAmount(p.EstimatedDisbursementAmount || 0),
        upfrontCharges: formatAmount(p.UpfrontCharges || 0),
        affordable: p.IsAffordable === '1',
      }));

      setProducts(mapped);
      setProductsCount(mapped.length);
      setSelectedProductIndex(null);
    } catch (err) {
      console.log('❌ QuickLoan getAffordability error:', err);
      Alert.alert('Error', 'Unable to fetch affordability data.');
    } finally {
      setIsChecking(false);
    }
  };

  // ---------- Document Picker ----------
  // const pickDocument = async type => {
  //   let prefix = 'DOC';

  //   if (type === 'id') prefix = 'IDPROOF';
  //   else if (type === 'address') prefix = 'ADDRPROOF';
  //   else if (type === 'income') prefix = 'INCPROOF';
  //   else if (type === 'other') prefix = 'OTHERDOC';

  //   const doc = await pickImageWithPrompt('Attach Document', {
  //     filePrefix: prefix,
  //   });

  //   if (!doc) return;

  //   if (type === 'id') setIdProof(doc);
  //   else if (type === 'address') setAddressProof(doc);
  //   else if (type === 'income') setIncomeProof(doc);
  //   else if (type === 'other') setOtherDoc(doc);
  // };

  // ---------- Navigation helpers ----------
  const goToStep1 = () => setStep(1);

  const goToStep2 = () => {
    if (!products.length) {
      Alert.alert(
        'No Products',
        'Please check affordability and ensure products are available.',
      );
      return;
    }
    setStep(2);
  };

  const goToStep3 = () => {
    if (selectedProductIndex === null) {
      Alert.alert('Select Product', 'Please select a product to proceed.');
      return;
    }
    setStep(3);
  };

  const goToStep4 = () => {
    // Additional details validation if needed (dependants, mode, otherIncome)
    if (!noOfDependants || !modeOfRepayment) {
      Alert.alert(
        'Missing Data',
        'Please enter number of dependants and mode of repayment.',
      );
      return;
    }
    setStep(4);
  };

  const goToStep5 = () => {
    // if (!hasAllMandatoryDocs) {
    //   Alert.alert(
    //     'Missing Documents',
    //     'Please attach ID, Address and Income Proof to proceed.',
    //   );
    //   return;
    // }
    if (!scoreConsentAccepted) {
      Alert.alert(
        'Consent Required',
        'Please confirm credit score consent before proceeding.',
      );
      return;
    }
    setStep(5);
  };

  const goBackToStep2 = () => setStep(2);
  const goBackToStep3 = () => setStep(3);
  const goBackToStep4 = () => setStep(4);

  const goToHomeAfterResult = () => {
    navigation.navigate('Home');
  };

  // ---------- Credit Score Fetch (Step 5) ----------
  useEffect(() => {
    const fetchScore = async () => {
      if (!userName) {
        setCreditScoreError('User not found for credit score check.');
        return;
      }
      try {
        setCreditScoreLoading(true);
        setCreditScoreError(null);

        // TODO: implement getCreditScore wrapper to match your API
        const res = await getCreditScore(userName);

        if (res?.executionStatus !== 'Success') {
          throw new Error(
            res?.executionMessage || 'Failed to fetch credit score',
          );
        }

        const d = res.outParams || {};
        setCreditScore(d.positiveScore || null);
        setCreditScoreGrade(d.grade || d.Grade || null);
      } catch (err) {
        console.log('❌ Credit score error:', err);
        setCreditScoreError(err.message || 'Unable to fetch credit score');
      } finally {
        setCreditScoreLoading(false);
        setCreditScoreFetched(true);
      }
    };

    if (step === 5 && !creditScoreFetched) {
      fetchScore();
    }
  }, [step, creditScoreFetched, userName]);

  // ---------- Final Submit ----------
  const handleSubmitQuickLoan = async () => {
    try {
      if (!tcAccepted) {
        Alert.alert('Accept Terms', 'Please accept the Terms & Conditions.');
        return;
      }

      if (!signatureImage) {
        Alert.alert('Signature Required', 'Please provide your signature.');
        return;
      }

      const selectedProduct =
        selectedProductIndex !== null ? products[selectedProductIndex] : null;

      if (!selectedProduct) {
        Alert.alert('Error', 'No product selected.');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      // ✅ Build loan BODY (no nested body here)
      const loanBody = {
        EmployerProductMapId: selectedProduct.employerProductMapId,

        ROI: Number(String(selectedProduct.roi).replace('%', '')),
        MaxAffordability: Number(
          String(selectedProduct.maxAmount).replace(/,/g, ''),
        ),
        LoanAmount: Number(loanAmount.replace(/,/g, '')),
        LoanTenure: String(tenure),
        DisbursementAmount: Number(
          String(selectedProduct.disbursementAmount).replace(/,/g, ''),
        ),
        UpfrontCharges: Number(
          String(selectedProduct.upfrontCharges).replace(/,/g, ''),
        ),
        EMI: Number(String(selectedProduct.emi).replace(/,/g, '')),
        SourceInstanceId: sourceInstanceRef.current,

        UserName: userName,
        Dependants: Number(noOfDependants),
        OtherIncome: otherIncome,
        ModeofRepayment: String(modeOfRepayment),
      };

      console.log(
        '📤 Submitting Quick Loan →',
        JSON.stringify(loanBody, null, 2),
      );

      // ✅ REAL API CALL
      const apiRes = await submitQuickLoanDetails(loanBody);

      if (apiRes?.executionStatus !== 'Success') {
        throw new Error(apiRes?.executionMessage || 'Submission failed');
      }

      // 🔴 HANDLE BACKEND INTEGRATION FAILURE
      const isIntegrated = apiRes?.outParams?.IsIntegrated;
      const errorMessage =
        apiRes?.outParams?.ErrorMessage || apiRes?.outParams?.IntegrationStatus;

      if (isIntegrated === '0') {
        const reqId = apiRes?.outParams?.RequestId || null;
        const instanceId = apiRes?.instanceId || null;

        // retain IDs for retry
        setRetainedRequestId(reqId);
        setRetainedInstanceId(instanceId);

        Alert.alert(
          'Quick Loan Creation Failed',
          errorMessage || 'Loan integration failed',
        );

        setStep(4);
        return; // ⛔ STOP SUCCESS FLOW
      }

      // ✅ Get Request ID from backend
      const reqId =
        apiRes?.outParams?.RequestId ||
        apiRes?.outParams?.LoanRequestId ||
        apiRes?.requestId ||
        'N/A';

      setRequestId(reqId);
      setStep(6);
    } catch (err) {
      console.log('❌ QuickLoan submit error:', err);
      setSubmitError(err.message || 'Failed to submit quick loan request.');
      setStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Step 1: Inputs + Summary + Count ----------
  const renderStep1 = () => (
    <View>
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Quick Loan – Enter Details</Text>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Tenure (Months)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              keyboardType="numeric"
              value={tenure}
              onChangeText={t => setTenure(stripToInteger(t))}
              placeholder="e.g., 12"
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Expected Loan Amount</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              keyboardType="numeric"
              value={loanAmount}
              onChangeText={t => setLoanAmount(stripToNumber(t))}
              placeholder="e.g., 200000.00"
            />
          </View>
        </View>

        <View style={{ marginTop: spacing.md }}>
          <AppButton
            title={isChecking ? 'Checking…' : 'Check Affordability'}
            onPress={handleCheckAffordability}
            disabled={isChecking}
          />
        </View>
      </View>

      {/* Income Summary */}
      <View style={formStyles.container}>
        <Text style={formStyles.sectionTitle}>Income Summary</Text>

        <View style={formStyles.summaryRow}>
          {/* Gross */}
          <View style={[formStyles.summaryCard, formStyles.cardBlue]}>
            <MaterialIcons name="payments" size={28} color="#1A73E8" />
            <Text style={formStyles.summaryLabel}>Gross Income</Text>
            <Text style={formStyles.summaryValue}>
              {formatAmount(grossIncome) || '-'}
            </Text>
          </View>

          {/* Net */}
          <View style={[formStyles.summaryCard, formStyles.cardGreen]}>
            <MaterialIcons
              name="account-balance-wallet"
              size={28}
              color="#188038"
            />
            <Text style={formStyles.summaryLabel}>Net Income</Text>
            <Text style={formStyles.summaryValue}>{netIncome || '-'}</Text>
          </View>
        </View>

        {/* Deductions */}
        <View style={[formStyles.summaryRow, { marginTop: spacing.sm }]}>
          <View style={[formStyles.summaryCard, formStyles.cardRed]}>
            <MaterialIcons
              name="remove-circle-outline"
              size={28}
              color="#D93025"
            />
            <Text style={formStyles.summaryLabel}>Deductions</Text>
            <Text style={formStyles.summaryValue}>
              {totalDeductions || '-'}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: spacing.sm }}>
          <Text style={formStyles.sectionTitle}>
            Total Products Found: {productsCount}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <AppButton
          title="Next"
          onPress={goToStep2}
          disabled={!products.length}
        />
      </View>
    </View>
  );

  // ---------- Step 2: Product Selection ----------
  const renderStep2 = () => (
    <View>
      <Text style={formStyles.sectionTitle}>Select a Product</Text>

      {products.length === 0 ? (
        <Text style={{ color: '#777', marginTop: spacing.sm }}>
          No products available. Please go back and check affordability again.
        </Text>
      ) : (
        <View style={{ marginTop: spacing.sm }}>
          {products.map((p, index) => renderProductCardForSelection(p, index))}
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: spacing.lg,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <AppButton title="Back" variant="secondary" onPress={goToStep1} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppButton
            title="Next"
            onPress={goToStep3}
            disabled={selectedProductIndex === null}
          />
        </View>
      </View>
    </View>
  );

  // ---------- Step 3: Product Summary + Additional Details ----------
  const renderStep3 = () => {
    const selectedProduct =
      selectedProductIndex !== null ? products[selectedProductIndex] : null;

    return (
      <View>
        <View style={formStyles.card}>
          <Text style={[formStyles.sectionTitle, { color: colors.success }]}>
            Selected Product
          </Text>

          {selectedProduct ? (
            <>
              <Text style={formStyles.infoValue} numberOfLines={2}>
                {selectedProduct.productName}
              </Text>

              <View style={formStyles.productCardRow}>
                <Text style={formStyles.infoLabel}>Tenure</Text>
                <Text style={formStyles.infoValue}>
                  {tenure ? `${tenure} Months` : '-'}
                </Text>
              </View>

              <View style={formStyles.productCardRow}>
                <Text style={formStyles.infoLabel}>Loan Amount</Text>
                <Text style={formStyles.infoValue}>
                  {displayAmount(loanAmount) || '-'}
                </Text>
              </View>
              <View style={formStyles.productCardRow}>
                <Text style={formStyles.infoLabel}>Upfront Charges</Text>
                <Text style={formStyles.infoValue}>
                  {displayAmount(selectedProduct.upfrontCharges)}
                </Text>
              </View>
              <View style={formStyles.productCardRow}>
                <Text style={formStyles.infoLabel}>Disbursement Amount</Text>
                <Text style={formStyles.infoValue}>
                  {displayAmount(selectedProduct.disbursementAmount)}
                </Text>
              </View>
              <View style={formStyles.productCardRow}>
                <Text style={formStyles.infoLabel}>ROI</Text>
                <Text style={formStyles.infoValue}>{selectedProduct.roi}</Text>
              </View>

              <View style={formStyles.productCardRow}>
                <Text style={formStyles.infoLabel}>EMI</Text>
                <Text style={formStyles.infoValue}>
                  {displayAmount(selectedProduct.emi)}
                </Text>
              </View>

              <View style={formStyles.card}>
                <View style={formStyles.productCardRow}>
                  <Text style={formStyles.infoLabel}>Max Loan Amount</Text>
                  <Text style={formStyles.infoValue}>
                    {displayAmount(selectedProduct.maxAmount)}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={formStyles.cardRed}>No product selected.</Text>
          )}
        </View>

        {/* Additional Details */}
        <View
          style={[
            formStyles.card,
            { marginTop: spacing.md, zIndex: 2000, elevation: 2000 },
          ]}
        >
          <Text style={formStyles.sectionTitle}>Additional Details</Text>

          <View style={[formStyles.fieldRow]}>
            <Text style={formStyles.fieldLabelInline}>No. of Dependants</Text>
            <View style={formStyles.fieldControl}>
              <AppInput
                keyboardType="numeric"
                value={noOfDependants}
                onChangeText={t => setNoOfDependants(stripToInteger(t))}
                placeholder="e.g., 2"
              />
            </View>
          </View>

          <View
            style={[formStyles.fieldRow, { zIndex: 2000, elevation: 2000 }]}
          >
            <Text style={formStyles.fieldLabelInline}>Mode of Repayment</Text>
            <View
              style={[
                formStyles.fieldControl,
                { zIndex: 2000, elevation: 2000 },
              ]}
            >
              <AppPicker
                selectedValue={modeOfRepayment}
                onValueChange={setModeOfRepayment}
                items={modeOfRepaymentOptions}
                placeholder="Select Mode"
              />
            </View>
          </View>

          <View
            style={[formStyles.fieldRow, { zIndex: 1500, elevation: 1500 }]}
          >
            <Text style={formStyles.fieldLabelInline}>Other Income</Text>
            <View
              style={[
                formStyles.fieldControl,
                { zIndex: 1500, elevation: 1500 },
              ]}
            >
              <AppPicker
                selectedValue={otherIncome}
                onValueChange={setOtherIncome}
                items={otherIncomeOptions}
                placeholder="Select Other Income"
              />
            </View>
          </View>
        </View>
        <View style={formStyles.container}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: spacing.lg,
            }}
          >
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <AppButton
                title="Back"
                variant="secondary"
                onPress={goBackToStep2}
              />
            </View>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppButton title="Next" onPress={goToStep4} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  // ---------- Step 4: Documents + Consent ----------
  const renderStep4 = () => (
    <View>
      {/* <Text style={formStyles.sectionTitle}>Upload Documents</Text>

      <View style={formStyles.docGrid}>
        {renderDocumentCard(
          'ID Proof',
          idProof,
          () => pickDocument('id'),
          removeIdProof,
          true,
        )}
        {renderDocumentCard(
          'Address Proof',
          addressProof,
          () => pickDocument('address'),
          removeAddressProof,
          true,
        )}
        {renderDocumentCard(
          'Income Proof',
          incomeProof,
          () => pickDocument('income'),
          removeIncomeProof,
          true,
        )}
        {renderDocumentCard(
          'Other Document',
          otherDoc,
          () => pickDocument('other'),
          removeOtherDoc,
          false,
        )}
      </View> */}

      {/* TransUnion Consent */}
      <View style={[formStyles.card, { marginTop: spacing.md }]}>
        <Text style={formStyles.sectionTitle}>Credit Score Consent</Text>

        <Text style={formStyles.infoValue}>
          When you click NEXT, your credit score will be requested from
          TransUnion and charges may apply. Please ensure all documents are
          uploaded and you are ready to apply for the loan before proceeding.
        </Text>

        <TouchableOpacity
          onPress={() => setScoreConsentAccepted(!scoreConsentAccepted)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.sm,
          }}
        >
          <MaterialIcons
            name={
              scoreConsentAccepted ? 'check-box' : 'check-box-outline-blank'
            }
            size={24}
            color={colors.primary}
          />
          <Text style={{ marginLeft: spacing.xs }}>
            I understand and agree to proceed with credit score request.
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: spacing.lg,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <AppButton title="Back" variant="secondary" onPress={goBackToStep3} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppButton
            title="Next"
            onPress={goToStep5}
            disabled={!scoreConsentAccepted}
          />
        </View>
      </View>
    </View>
  );

  // ---------- Step 5: Credit Score + T&C + Signature ----------
  const renderStep5 = () => (
    <View>
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Credit Score</Text>

        {creditScoreLoading && (
          <Text style={formStyles.infoValue}>Fetching credit score…</Text>
        )}

        {!creditScoreLoading && creditScoreError && (
          <Text style={[formStyles.infoValue, { color: colors.error }]}>
            {creditScoreError}
          </Text>
        )}

        {!creditScoreLoading && !creditScoreError && (
          <>
            <View style={formStyles.productCardRow}>
              <Text style={formStyles.infoLabel}>Score</Text>
              <Text style={formStyles.infoValue}>
                {creditScore != null ? creditScore : '-'}
              </Text>
            </View>
            <View style={formStyles.productCardRow}>
              <Text style={formStyles.infoLabel}>Grade</Text>
              <Text style={formStyles.infoValue}>
                {creditScoreGrade || '-'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View
        style={[
          formStyles.card,
          { marginTop: spacing.md, alignItems: 'center' },
        ]}
      >
        <Text style={formStyles.sectionTitle}>Terms & Conditions</Text>

        {/* <ScrollView style={{ maxHeight: 130 }}>
          <Text style={formStyles.infoValue}>
            By submitting this loan request, I confirm that the information
            provided is accurate and authorize ZNBS to process this application,
            verify my credit and employment details, and share necessary
            information with relevant authorities and credit bureaus as per the
            institution&apos;s policy.
          </Text>
        </ScrollView> */}
        <TouchableOpacity
          // onPress={() => setTcModalVisible(true)}   // open popup instead of toggle
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.sm,
            marginBottom: spacing.xs,
          }}
        >
          <MaterialIcons
            name={tcAccepted ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={{ marginLeft: spacing.xs, marginBottom: spacing.xs }}>
            I agree to the Terms & Conditions
          </Text>
        </TouchableOpacity>

        {/* View full T&C link */}
        <TouchableOpacity onPress={() => setTcModalVisible(true)}>
          <Text style={{ color: colors.primary, marginTop: spacing.xs }}>
            View Terms & Conditions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Signature */}
      <View style={[formStyles.card, { marginTop: spacing.md }]}>
        <Text style={formStyles.sectionTitle}>Signature</Text>

        <SignatureBox onOK={img => setSignatureImage(img)} />

        {signatureImage ? (
          <Text style={{ color: colors.success, marginTop: spacing.xs }}>
            Signature captured ✔
          </Text>
        ) : (
          <Text style={{ color: '#888', marginTop: spacing.xs }}>
            Please sign above
          </Text>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: spacing.lg,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <AppButton title="Back" variant="secondary" onPress={goBackToStep4} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppButton
            title={isSubmitting ? 'Submitting…' : 'Submit'}
            onPress={handleSubmitQuickLoan}
          />
        </View>
      </View>
      {/* 🔹 T&C Popup Modal */}
      {tcModalVisible && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            zIndex: 999,
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 10,
              padding: 20,
              maxHeight: '80%',
            }}
          >
            {/* Title */}
            <Text style={[formStyles.sectionTitle, { marginBottom: 10 }]}>
              Terms & Conditions
            </Text>

            {/* Scroll T&C */}
            <ScrollView style={{ maxHeight: '70%' }}>
              <Text style={formStyles.infoValue}>
                By submitting this loan request, I confirm that the information
                provided is accurate and authorize ZNBS to process this
                application, verify my credit and employment details, and share
                necessary information with relevant authorities and credit
                bureaus as per the institution's policy.
              </Text>
            </ScrollView>

            {/* Footer Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}
            >
              {/* Close button */}
              <View style={{ flex: 1, marginRight: 5 }}>
                <AppButton
                  title="Close"
                  variant="secondary"
                  onPress={() => {
                    setTcModalVisible(false), setTcAccepted(false);
                  }}
                />
              </View>

              {/* Accept button */}
              <View style={{ flex: 1, marginLeft: 5 }}>
                <AppButton
                  title="Accept"
                  onPress={() => {
                    setTcAccepted(true); // mark checkbox as accepted
                    setTcModalVisible(false); // close popup
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // ---------- Step 6: Result ----------
  const renderStep6 = () => {
    const isSuccess = !!requestId && !submitError;

    return (
      <View style={[formStyles.card, formStyles.resultCard]}>
        <MaterialIcons
          name={isSuccess ? 'check-circle' : 'error-outline'}
          size={56}
          color={isSuccess ? colors.success : colors.error}
        />

        <Text style={[formStyles.sectionTitle, formStyles.resultTitle]}>
          {isSuccess
            ? 'Quick Loan Request Submitted'
            : 'Quick Loan Submission Failed'}
        </Text>

        {isSuccess && (
          <>
            {/* Request ID */}
            <Text style={formStyles.resultInfoText}>
              Request ID:{' '}
              <Text style={formStyles.resultInfoValue}>{requestId}</Text>
            </Text>

            {/* Loan Amount & Tenure Summary */}
            <View style={formStyles.resultSummaryBox}>
              <View style={formStyles.resultSummaryRow}>
                <Text style={formStyles.resultSummaryLabel}>Loan Amount</Text>
                <Text style={formStyles.resultSummaryValue}>
                  {loanAmount || '-'}
                </Text>
              </View>

              <View style={formStyles.resultSummaryRow}>
                <Text style={formStyles.resultSummaryLabel}>Tenure</Text>
                <Text style={formStyles.resultSummaryValue}>
                  {tenure ? `${tenure} Months` : '-'}
                </Text>
              </View>
            </View>
          </>
        )}

        {!isSuccess && submitError ? (
          <Text style={formStyles.resultErrorText}>{submitError}</Text>
        ) : null}

        <View style={formStyles.resultButtonContainer}>
          <AppButton title="Close" onPress={goToHomeAfterResult} />
        </View>
      </View>
    );
  };

  // ---------- Root Render ----------
  return (
    <ScrollView
      contentContainerStyle={formStyles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
      {step === 6 && renderStep6()}
    </ScrollView>
  );
}
