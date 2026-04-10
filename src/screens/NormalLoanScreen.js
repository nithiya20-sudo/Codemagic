// ===============================
// NormalLoanScreen.js — CHUNK 1
// ===============================

import React, { useState, useEffect, useMemo } from 'react';
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
import { getCreditScore } from '../api/customer/getCreditScore';
import RNFS from 'react-native-fs';

import {
  stripToNumber,
  stripToInteger,
  displayAmount,
} from '../utils/formatters';
import { pickImageWithPrompt } from '../utils/imagePicker';
import SignatureBox from '../ui/SignatureBox';

// 🔹 Existing Loan APIs reused from HomeScreen.js
import { fetchCustomerLoanAccounts } from '../api/customer/loan';
import { fetchLoanDetails } from '../api/customer/loanDetails';
import { submitNormalLoanDetails } from '../api/customer/submitNormalLoanDetails';

export default function NormalLoanScreen({ navigation }) {
  const { user } = useAuth();
  const userName = user?.username || user?.userName || '';

  const [step, setStep] = useState(1);

  // --------------------------
  // Step 1 — New Fields
  // --------------------------
  const [loanType, setLoanType] = useState('Normal'); // Default
  const [existingLoans, setExistingLoans] = useState([]);
  const [existingLoanId, setExistingLoanId] = useState(null);
  const [existingLoanDetails, setExistingLoanDetails] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const [tenure, setTenure] = useState('');
  const [loanAmount, setLoanAmount] = useState('');

  // Income summary — same as Quick Loan
  const [grossIncome, setGrossIncome] = useState('');
  const [totalDeductions, setTotalDeductions] = useState('');
  const [netIncome, setNetIncome] = useState('');

  // Products from affordability
  const [products, setProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // PRODUCT SELECTION (Step 2)
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const sourceInstanceRef = React.useRef(null);
  useEffect(() => {
    if (!sourceInstanceRef.current) {
      sourceInstanceRef.current = generateSourceInstanceId();
      console.log('🆕 Generated SourceInstanceId:', sourceInstanceRef.current);
    }
  }, []);

  const toBase64 = async file => {
    if (!file?.uri) return '';
    return await RNFS.readFile(file.uri, 'base64');
  };

  const generateSourceInstanceId = () => {
    return (
      'SRC-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  };

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
  const [OtherDocuments, setOtherDocuments] = useState(null);

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
  const removeOtherDocuments = () => setOtherDocuments(null);

  const hasAllMandatoryDocs = !!(idProof && addressProof && incomeProof);

  // ------------------------
  // LOAD EXISTING LOANS (Only for TopUp/ReFinance)
  // ------------------------
  useEffect(() => {
    const loadLoans = async () => {
      if (loanType === 'Normal') return; // No need to load

      if (!userName) return;

      try {
        const list = await fetchCustomerLoanAccounts(userName);
        console.log('✅ Account Details API Response:', list);

        const mapped = list.map((a, index) => ({
          id: a.accountNumber,
          accountNumber: a.accountNumber,
          accountDescription: a.accountDescription,
          key: `${a.accountNumber}-${index}`,
        }));

        setExistingLoans(mapped);

        if (mapped.length > 0) {
          setExistingLoanId(mapped[0].id);
        }
      } catch (err) {
        console.log('❌ load existing loans error:', err);
      }
    };

    loadLoans();
  }, [loanType, userName]);

  // ------------------------
  // GET EXISTING LOAN DETAILS
  // ------------------------
  useEffect(() => {
    const loadDetails = async () => {
      if (!existingLoanId || loanType === 'Normal') return;

      setLoadingExisting(true);

      try {
        const details = await fetchLoanDetails(existingLoanId);

        console.log('✅ Loan Details API Response:', details);
        setExistingLoanDetails(details);
      } catch (err) {
        console.log('❌ load loan details error:', err);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadDetails();
  }, [existingLoanId, loanType]);
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
  // ---------------------------------------------
  // Step 1 → Check Affordability (Modified Payload)
  // ---------------------------------------------
  const handleCheckAffordability = async () => {
    Keyboard.dismiss();

    // Validate inputs
    if (!tenure || !loanAmount) {
      Alert.alert('Missing Data', 'Please enter Tenure and Loan Amount.');
      return;
    }

    if (loanType !== 'Normal' && !existingLoanId) {
      Alert.alert('Loan Required', 'Please select an existing loan.');
      return;
    }

    try {
      setIsChecking(true);

      // Map loan type to correct backend values
      const LoanTypeId =
        loanType === 'Normal'
          ? 4
          : loanType === 'TopUp'
          ? 5
          : loanType === 'ReFinance'
          ? 6
          : 0; // fallback if undefined

      // Determine LoanNo based on loan type
      const loanNoToSend = loanType === 'Normal' ? 0 : existingLoanId;

      // Prepare payload (optional: for logging/debug)
      const payload = {
        CustomerUserName: userName,
        LoanAmount: Number(loanAmount.replace(/,/g, '')),
        Tenure: Number(tenure),
        LoanTypeId,
        LoanNo: loanNoToSend,
      };
      console.log('Affordability payload:', payload);

      // API call
      const apiRes = await getAffordability(payload);

      if (apiRes.executionStatus !== 'Success') {
        Alert.alert('Error', apiRes.executionMessage || 'API failed');
        return;
      }

      // Extract products
      const raw = apiRes.gridParams?.Affordability || {};
      const list = Object.values(raw);

      if (list.length === 0) {
        setProducts([]);
        setProductsCount(0);
        Alert.alert('Info', 'No products available.');
        return;
      }

      // Income summary
      setGrossIncome(apiRes.outParams.GrossIncome || '');
      setTotalDeductions(apiRes.outParams.Deductions || '');
      setNetIncome(apiRes.outParams.NetIncome || '');

      // Map product list
      const mapped = list.map((p, index) => ({
        productId: p.ProductId || index.toString(),
        productUniqueId: p.EmployerProductMapID || p.UniqueId || null,
        productName: p.Product,
        // roi: (p.ROI || p.Interest || '-') + '%',
        // roi: (p.InterestRate || '-') + '%',
        roi: stripToNumber(p.InterestRate),

        emi: stripToNumber(p.EMIAmount),
        sourceInstanceId: p.SourceInstanceId || p.UniqueId || p.InstanceId,
        maxAmount: stripToNumber(p.MaxAffordableAmount),
        disbursementAmount: stripToNumber(p.EstimatedDisbursementAmount || 0),
        upfrontCharges: stripToNumber(p.UpfrontCharges || 0),
        affordable: p.IsAffordable === '1',
      }));

      setProducts(mapped);
      setProductsCount(mapped.length);
      setSelectedProductIndex(null);
    } catch (err) {
      console.log('❌ getAffordability error:', err);
      Alert.alert('Error', 'Unable to fetch affordability data.');
    } finally {
      setIsChecking(false);
    }
  };

  // ---------- Document Picker ----------
  const pickDocument = async type => {
    let prefix = 'DOC';

    if (type === 'id') prefix = 'IDPROOF';
    else if (type === 'address') prefix = 'ADDRPROOF';
    else if (type === 'income') prefix = 'INCPROOF';
    else if (type === 'other') prefix = 'OTHERDOCUMENTS';

    const doc = await pickImageWithPrompt('Attach Document', {
      filePrefix: prefix,
    });

    if (!doc) return;

    if (type === 'id') setIdProof(doc);
    else if (type === 'address') setAddressProof(doc);
    else if (type === 'income') setIncomeProof(doc);
    else if (type === 'other') setOtherDocuments(doc);
  };

  // ---------------------------------------------
  // Step Navigation
  // ---------------------------------------------
  const goToStep2 = () => {
    if (!products.length) {
      Alert.alert('No Products', 'Please check affordability first.');
      return;
    }
    setStep(2);
  };
  const TimelineHeader = ({ step }) => {
    const steps = [
      'Initiation',
      'Product',
      'Details',
      'Docs',
      'Consent',
      'Result',
    ];

    return (
      <View style={{ paddingVertical: spacing.md }}>
        {/* Circles + Lines */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.md,
          }}
        >
          {steps.map((_, index) => {
            const isActive = step >= index + 1;
            const isCurrent = step === index + 1;

            return (
              <React.Fragment key={index}>
                {/* Circle */}
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: isCurrent
                      ? colors.primary
                      : isActive
                      ? colors.primary
                      : '#fff',
                    borderWidth: 2,
                    borderColor: isActive ? colors.primary : '#CFCFCF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isCurrent
                        ? '#fff'
                        : isActive
                        ? colors.primary
                        : '#999',
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>

                {/* Line (except for last step) */}
                {index < steps.length - 1 && (
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor:
                        step > index + 1 ? colors.primary : '#CFCFCF',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>

        {/* Labels Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.xs,
            paddingHorizontal: spacing.md,
          }}
        >
          {steps.map((label, index) => (
            <Text
              key={index}
              style={[
                formStyles.infoValue,
                {
                  fontSize: 10,
                  width: 55,
                  textAlign: 'center',
                  color: step === index + 1 ? colors.primary : '#666',
                },
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  // -------------------------------------------------
  // RENDER: STEP 1 (NEW LOGIC)
  // -------------------------------------------------
  const renderStep1 = () => (
    <View>
      {/* Title */}
      <Text style={formStyles.sectionTitle}>Loan Initiation</Text>

      {/* Loan Type Selector */}
      {/* 🔹 Loan Type Selector */}
      <View style={[formStyles.card, { marginTop: spacing.sm }]}>
        <Text style={formStyles.infoLabel}>Select Loan Type</Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.sm,
          }}
        >
          {['Normal', 'TopUp', 'ReFinance'].map(type => {
            const selected = loanType === type;

            return (
              <TouchableOpacity
                key={type}
                onPress={() => setLoanType(type)}
                style={[
                  formStyles.loanTypeBtn,
                  selected && formStyles.loanTypeSelected,
                ]}
              >
                <Text
                  style={[
                    formStyles.loanTypeText,
                    selected && formStyles.loanTypeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Existing Loan Picker (TopUp / ReFinance Only) */}
      {loanType !== 'Normal' && (
        <View style={[formStyles.card, { marginTop: spacing.md }]}>
          <Text style={formStyles.infoLabel}>Select Existing Loan</Text>

          <AppPicker
            selectedValue={existingLoanId}
            onValueChange={setExistingLoanId}
            items={existingLoans.map(loan => ({
              label: loan.accountDescription || loan.accountNumber,
              value: loan.id,
            }))}
            placeholder="Choose Loan"
          />

          {existingLoanDetails && (
            <View
              style={{
                marginTop: spacing.md,
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 8,
                borderColor: '#ddd',
                borderWidth: 1,
              }}
            >
              <Text style={formStyles.infoLabel}>Product</Text>
              <Text style={formStyles.infoValue}>
                {existingLoanDetails.product || '-'}
              </Text>

              <Text style={[formStyles.infoLabel, { marginTop: spacing.sm }]}>
                Loan Amount
              </Text>
              <Text style={formStyles.infoValue}>
                {displayAmount(existingLoanDetails.amount)}
              </Text>

              <Text style={[formStyles.infoLabel, { marginTop: spacing.sm }]}>
                Loan Balance
              </Text>
              <Text style={formStyles.infoValue}>
                {displayAmount(existingLoanDetails.balprincipal)}
              </Text>

              <Text style={[formStyles.infoLabel, { marginTop: spacing.sm }]}>
                ROI
              </Text>

              <Text style={formStyles.infoValue}>
                {(existingLoanDetails.interest || '-') + '%'}
              </Text>

              <Text style={[formStyles.infoLabel, { marginTop: spacing.sm }]}>
                Remaining Tenure
              </Text>
              <Text style={formStyles.infoValue}>
                {existingLoanDetails?.tenure
                  ? `${existingLoanDetails.tenure} Months`
                  : '-'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tenure */}
      {/* 🔹 Tenure & Loan Amount (2-column layout) */}
      <View style={[formStyles.card, { marginTop: spacing.md }]}>
        {/* Captions Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: spacing.xs,
          }}
        >
          <Text style={[formStyles.fieldLabelInline, { flex: 1 }]}>
            Tenure (Months)
          </Text>

          <Text
            style={[
              formStyles.fieldLabelInline,
              { flex: 1, marginLeft: spacing.md },
            ]}
          >
            Loan Amount
          </Text>
        </View>

        {/* Fields Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {/* Tenure Input */}
          <View
            style={[
              formStyles.fieldControl,
              { flex: 1, marginRight: spacing.sm },
            ]}
          >
            <AppInput
              keyboardType="numeric"
              value={tenure}
              onChangeText={t => setTenure(stripToInteger(t))}
              placeholder="e.g., 12"
            />
          </View>

          {/* Loan Amount Input */}
          <View
            style={[
              formStyles.fieldControl,
              { flex: 1, marginLeft: spacing.sm },
            ]}
          >
            <AppInput
              variant="amount"
              keyboardType="numeric"
              value={loanAmount}
              onChangeText={t => setLoanAmount(stripToNumber(t))}
              placeholder="e.g., 200000.00"
            />
          </View>
        </View>

        {/* Check Affordability Button */}
        <View style={{ marginTop: spacing.md }}>
          <AppButton
            title={isChecking ? 'Checking…' : 'Check Affordability'}
            onPress={handleCheckAffordability}
            disabled={isChecking}
          />
        </View>
      </View>

      {/* Income Summary — SAME AS QUICK LOAN */}
      <View style={formStyles.container}>
        <Text style={formStyles.sectionTitle}>Income Summary</Text>

        {/* Gross & Net */}
        <View style={formStyles.summaryRow}>
          <View style={[formStyles.summaryCard, formStyles.cardBlue]}>
            <MaterialIcons name="payments" size={28} color="#1A73E8" />
            <Text style={formStyles.summaryLabel}>Gross Income</Text>
            <Text style={formStyles.summaryValue}>{grossIncome || '-'}</Text>
          </View>
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

        <View style={{ marginTop: spacing.sm }}>
          <Text style={formStyles.sectionTitle}>
            Total Products Found: {productsCount}
          </Text>
        </View>
      </View>

      {/* Next Button */}
      <View style={{ marginTop: spacing.md }}>
        <AppButton
          title="Next"
          onPress={goToStep2}
          disabled={!products.length}
        />
      </View>
    </View>
  );

  // STOP HERE — next chunk continues from Step 2 →
  // ===============================
  // NormalLoanScreen.js — CHUNK 2
  // ===============================
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
          <AppButton
            title="Back"
            variant="secondary"
            onPress={() => setStep(1)}
          />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppButton
            title="Next"
            onPress={() => {
              if (selectedProductIndex === null) {
                Alert.alert('Select Product', 'Please select a product.');
                return;
              }
              setStep(3);
            }}
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
    console.log('Selected Product →', selectedProduct);

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
                onPress={() => setStep(2)}
              />
            </View>

            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <AppButton
                title="Next"
                onPress={() => {
                  if (!noOfDependants || !modeOfRepayment) {
                    Alert.alert(
                      'Missing Data',
                      'Please enter number of dependants and mode of repayment.',
                    );
                    return;
                  }
                  setStep(4);
                }}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };
  // ---------- Document Card Renderer ----------
  const renderDocumentCard = (
    title,
    doc,
    onPressPick,
    onRemove,
    mandatory = true,
  ) => {
    return (
      <View style={formStyles.docCard}>
        {/* Title + Optional */}
        <View style={formStyles.docHeaderRow}>
          <Text style={formStyles.docTitle}>{title}</Text>
          {!mandatory && <Text style={formStyles.docOptional}>(Optional)</Text>}
        </View>

        {/* Preview or Placeholder */}
        {doc?.uri ? (
          <View style={formStyles.docPreviewRow}>
            <Image
              source={{ uri: doc.uri }}
              style={formStyles.docPreviewImage}
            />
            <TouchableOpacity
              onPress={onRemove}
              style={formStyles.docRemoveBtn}
            >
              <MaterialIcons name="delete" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={formStyles.docPlaceholder}>
            <MaterialIcons name="insert-drive-file" size={32} color="#999" />
            <Text style={formStyles.docPlaceholderText}>No file</Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity onPress={onPressPick} style={formStyles.docUploadBtn}>
          <MaterialIcons name="upload-file" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };
  // ---------- Step 4: Documents + Consent ----------
  const renderStep4 = () => (
    <View>
      <Text style={formStyles.sectionTitle}>Upload Documents</Text>

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
          OtherDocuments,
          () => pickDocument('other'),
          removeOtherDocuments,
          false,
        )}
      </View>

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
          <AppButton
            title="Back"
            variant="secondary"
            onPress={() => setStep(3)}
          />
        </View>

        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppButton
            title="Next"
            onPress={() => {
              if (!idProof || !addressProof || !incomeProof) {
                Alert.alert(
                  'Missing Documents',
                  'Please attach ID, Address and Income Proof.',
                );
                return;
              }
              if (!scoreConsentAccepted) {
                Alert.alert(
                  'Consent Required',
                  'Please confirm credit score consent.',
                );
                return;
              }
              setStep(5);
            }}
          />
        </View>
      </View>
    </View>
  );
  // ===============================
  // NormalLoanScreen.js — CHUNK 3
  // ===============================
  // ---------- Final Submit ----------
  const handleSubmitNormalLoan = async () => {
    try {
      if (!tcAccepted) {
        Alert.alert('Accept Terms', 'Please accept the Terms & Conditions.');
        return;
      }

      if (!signatureImage) {
        Alert.alert('Signature Required', 'Please provide your signature.');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const selectedProduct =
        selectedProductIndex !== null ? products[selectedProductIndex] : null;
      const LoanTypeId =
        loanType === 'Normal'
          ? 4
          : loanType === 'TopUp'
          ? 5
          : loanType === 'ReFinance'
          ? 6
          : 0;
      const LoanType =
        loanType === 'Normal'
          ? 4
          : loanType === 'TopUp'
          ? 5
          : loanType === 'ReFinance'
          ? 6
          : 0;
      // const payload = {
      //   userName,
      //   LoanTypeId,
      //   ROI: selectedProduct?.roi,
      //   LoanTenure: String(tenure),
      //   LoanType: String(LoanType),
      //   loanAmount: Number(loanAmount.replace(/,/g, '')),
      //   product: selectedProduct?.productUniqueId,
      //   noOfDependants,
      //   modeOfRepayment,
      //   otherIncome,
      //   documents: {
      //     idProof,
      //     addressProof,
      //     incomeProof,
      //     OtherDocuments,
      //   },
      //   creditScore,
      //   creditScoreGrade,
      //   tcAccepted,
      //   scoreConsentAccepted,
      //   SourceInstanceId: sourceInstanceRef.current,
      //   signatureImage,
      // };
      const loanNumberToSend =
        loanType === 'Normal' ? '0' : String(existingLoanId ?? '');

      const payload = {
        EmployerProductMapId: selectedProduct?.productUniqueId,
        LoanAmount: Number(loanAmount.replace(/,/g, '')),
        LoanTenure: String(tenure),
        LoanType: String(LoanType),
        ROI: selectedProduct?.roi,
        DisbursementAmount: Number(
          String(selectedProduct.disbursementAmount).replace(/,/g, ''),
        ),
        EMI: Number(String(selectedProduct.emi).replace(/,/g, '')),
        MaxAffordability: Number(
          String(selectedProduct.maxAmount).replace(/,/g, ''),
        ),
        UpfrontCharges: Number(
          String(selectedProduct.upfrontCharges).replace(/,/g, ''),
        ),
        Dependants: noOfDependants,
        OtherIncome: otherIncome,
        ModeofRepayment: modeOfRepayment,
        UserName: userName,
        SourceInstanceId: sourceInstanceRef.current,
        LoanNumber: loanNumberToSend,
        BalanceAmount:
          loanType === 'Normal' ? 0 : existingLoanDetails?.balprincipal || 0,

        BalanceTenure:
          loanType === 'Normal' ? 0 : existingLoanDetails?.tenure || 0,

        tcAccepted,
        scoreConsentAccepted,
        creditScore,
        creditScoreGrade,

        AddressProof: {
          documentName: addressProof?.fileName,
          documentContent: await toBase64(addressProof),
        },
        IdProof: {
          documentName: idProof?.fileName,
          documentContent: await toBase64(idProof),
        },
        IncomeProof: {
          documentName: incomeProof?.fileName,
          documentContent: await toBase64(incomeProof),
        },
        OtherDocments: {
          documentName: OtherDocuments?.fileName,
          documentContent: await toBase64(OtherDocuments),
        },

        signatureImage,
      };

      console.log('📦 NormalLoan final payload:', payload);

      const response = await submitNormalLoanDetails(payload);

      if (response?.executionStatus === 'Success') {
        const reqId = response?.outParams?.RequestId;

        if (!reqId) {
          throw new Error('Request ID not returned from server');
        }

        setRequestId(reqId);
        setSubmitError(null);
        setStep(6);
      } else {
        throw new Error(response?.executionMessage || 'Loan submission failed');
      }
    } catch (err) {
      console.log('NormalLoan submit error:', err);
      setSubmitError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to submit loan request.',
      );
      setStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- Step 5: Credit Score + T&C + Signature ----------
  const renderStep5 = () => (
    <View>
      {/* Credit Score */}
      <View style={formStyles.card}>
        <Text style={[formStyles.sectionTitle, { marginBottom: 0 }]}>
          Credit Score
        </Text>

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

      {/* Terms & Conditions */}
      <View
        style={[
          formStyles.card,
          { marginTop: spacing.sm, alignItems: 'center' },
        ]}
      >
        <Text style={[formStyles.sectionTitle, { marginBottom: 0 }]}>
          Terms & Conditions
        </Text>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.sm,
          }}
          onPress={() => setTcAccepted(!tcAccepted)}
        >
          <MaterialIcons
            name={tcAccepted ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={colors.primary}
          />
          <Text style={{ marginLeft: spacing.xs }}>
            I agree to the Terms & Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTcModalVisible(true)}>
          <Text style={{ color: colors.primary, marginTop: spacing.xs }}>
            View Terms & Conditions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Signature */}
      <View style={[formStyles.card, { marginTop: spacing.md }]}>
        <Text style={[formStyles.sectionTitle, { marginBottom: 0 }]}>
          Signature
        </Text>

        <SignatureBox
          onOK={img => setSignatureImage(img)}
          onClear={() => setSignatureImage(null)}
        />

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

      {/* Buttons */}
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
            onPress={() => setStep(4)}
          />
        </View>

        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <AppButton
            title={isSubmitting ? 'Submitting…' : 'Submit'}
            onPress={handleSubmitNormalLoan}
          />
        </View>
      </View>

      {/* T&C Popup Modal */}
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

            {/* Modal Buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}
            >
              <View style={{ flex: 1, marginRight: 5 }}>
                <AppButton
                  title="Close"
                  variant="secondary"
                  onPress={() => {
                    setTcModalVisible(false);
                    setTcAccepted(false);
                  }}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 5 }}>
                <AppButton
                  title="Accept"
                  onPress={() => {
                    setTcAccepted(true);
                    setTcModalVisible(false);
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
          {isSuccess ? 'Loan Request Submitted' : 'Loan Submission Failed'}
        </Text>

        {isSuccess && (
          <>
            <Text style={formStyles.resultInfoText}>
              Request ID:{' '}
              <Text style={formStyles.resultInfoValue}>{requestId}</Text>
            </Text>

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
          <AppButton
            title="Close"
            onPress={() => navigation.navigate('MainDrawer')}
          />
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
      {step === 1 && (
        <>
          <TimelineHeader step={1} />
          {renderStep1()}
        </>
      )}
      {step === 2 && (
        <>
          <TimelineHeader step={2} />
          {renderStep2()}
        </>
      )}

      {step === 3 && (
        <>
          <TimelineHeader step={3} />
          {renderStep3()}
        </>
      )}

      {step === 4 && (
        <>
          <TimelineHeader step={4} />
          {renderStep4()}
        </>
      )}

      {step === 5 && (
        <>
          <TimelineHeader step={5} />
          {renderStep5()}
        </>
      )}

      {step === 6 && (
        <>
          <TimelineHeader step={6} />
          {renderStep6()}
        </>
      )}
    </ScrollView>
  );
}

// END OF FILE
