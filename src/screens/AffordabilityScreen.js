import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  FlatList,
  Keyboard,
} from 'react-native';

import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import { formStyles } from '../styles/formstyles';
import { spacing, colors } from '../theme';
import { useAuth } from '../apicontext/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getAffordability } from '../api/customer/getAffordability';

export default function AffordabilityScreen({ navigation }) {
  const { user } = useAuth();
  const userName = user?.username || user?.userName || '';

  // Section A
  const [tenure, setTenure] = useState('');
  const [loanAmount, setLoanAmount] = useState('');

  // Section B – salary summary
  const [grossIncome, setGrossIncome] = useState('');
  const [totalDeductions, setTotalDeductions] = useState('');
  const [netIncome, setNetIncome] = useState('');

  // Section C – products
  const [products, setProducts] = useState([]);

  const [isChecking, setIsChecking] = useState(false);

  // Simple amount formatter (reuse pattern if you want)
  const toNumber = val => {
    if (!val) return 0;
    return Number(val.toString().replace(/,/g, '')) || 0;
  };

  const formatAmount = raw => {
    if (raw === null || raw === undefined) return '';
    let v = raw.toString().replace(/,/g, '');
    if (/^\d+(\.\d{0,2})?$/.test(v)) return v;
    if (v === '.') return '0.';
    return raw;
  };

  const handleCheckAffordability = async () => {
    Keyboard.dismiss();
    if (!tenure || !loanAmount) {
      Alert.alert('Missing Data', 'Please enter Tenure and Loan Amount.');
      return;
    }

    try {
      setIsChecking(true);

      const apiRes = await getAffordability({
        CustomerUserName: userName,
        LoanAmount: Number(loanAmount.replace(/,/g, '')),
        Tenure: Number(tenure),
        LoanTypeId: 0,
        LoanNo: 0,
      });

      console.log(apiRes);
      if (apiRes.executionStatus !== 'Success') {
        Alert.alert('Error', apiRes.executionMessage || 'API failed');
        return;
      }

      const raw = apiRes.gridParams?.Affordability || {};
      const list = Object.values(raw);

      if (list.length === 0) {
        Alert.alert('Info', 'No products available.');
        return;
      }

      // Extract Gross, Deduction, Net (same for all records)
      const gross = apiRes.outParams.GrossIncome;
      const dedamt = apiRes.outParams.Deductions;
      const netamt = apiRes.outParams.NetIncome;

      setGrossIncome(formatAmount(gross));
      setTotalDeductions(formatAmount(dedamt));
      setNetIncome(formatAmount(netamt));

      // Convert products to UI-friendly format
      const mapped = list.map((p, index) => ({
        productId: index.toString(),
        productName: p.Product,
        roi: p.InterestRate + '%',
        emi: formatAmount(p.EMIAmount),
        maxAmount: formatAmount(p.MaxAffordableAmount),
        affordable: p.IsAffordable === '1',
      }));

      setProducts(mapped);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch affordability data.');
    } finally {
      setIsChecking(false);
    }
  };

  const renderProductCard = ({ item }) => {
    const affordable = !!item.affordable;

    return (
      <View style={[formStyles.card, formStyles.productCard]}>
        {/* Product Name */}
        <Text style={formStyles.infoValue} numberOfLines={2}>
          {item.productName}
        </Text>

        {/* ROI */}
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>ROI:</Text>
          <Text style={formStyles.productCardValueStrong}>{item.roi}</Text>
        </View>

        {/* ROI */}
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>EMI:</Text>
          <Text style={formStyles.productCardValueStrong}>{item.emi}</Text>
        </View>

        {/* Max Amount */}
        <View style={formStyles.productCardRow}>
          <Text style={formStyles.productCardLabel}>Max Amount:</Text>
          <Text style={formStyles.productCardValueStrong}>
            {item.maxAmount}
          </Text>
        </View>

        {/* Affordable Badge */}
        <View style={formStyles.productCardBadgeRow}>
          <Text
            style={[
              formStyles.productCardBadge,
              affordable
                ? formStyles.productCardBadgeYes
                : formStyles.productCardBadgeNo,
            ]}
          >
            {affordable ? 'AFFORDABLE' : 'NOT AFFORDABLE'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={formStyles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* SECTION A – Input */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Enter Tenure & Loan Amount</Text>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Tenure (Months)</Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              keyboardType="numeric"
              value={tenure}
              onChangeText={setTenure}
              placeholder="e.g., 12"
            />
          </View>
        </View>

        <View style={formStyles.fieldRow}>
          <Text style={formStyles.fieldLabelInline}>Loan Amount </Text>
          <View style={formStyles.fieldControl}>
            <AppInput
              variant="amount"
              keyboardType="numeric"
              value={loanAmount}
              onChangeText={t => setLoanAmount(formatAmount(t))}
              placeholder="e.g., 50000.00"
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

      {/* Section B – Salary Summary */}
      <View style={formStyles.container}>
        <Text style={formStyles.sectionTitle}>Income Summary</Text>

        <View style={formStyles.summaryRow}>
          {/* Gross Income */}
          <View style={[formStyles.summaryCard, formStyles.cardBlue]}>
            <View style={formStyles.cardHeader} />
            <MaterialIcons name="payments" size={28} color="#1A73E8" />
            <Text style={formStyles.summaryLabel}>Gross Income</Text>
            <Text style={formStyles.summaryValue}>{grossIncome || '-'}</Text>
          </View>

          {/* Total Deductions */}
          <View style={[formStyles.summaryCard, formStyles.cardRed]}>
            <View style={formStyles.cardHeader} />
            <MaterialIcons
              name="remove-circle-outline"
              size={28}
              color="#D93025"
            />
            <Text style={formStyles.summaryLabel}> Deductions</Text>
            <Text style={formStyles.summaryValue}>
              {totalDeductions || '-'}
            </Text>
          </View>

          {/* Net Income */}
          <View style={[formStyles.summaryCard, formStyles.cardGreen]}>
            <View style={formStyles.cardHeader} />
            <MaterialIcons
              name="account-balance-wallet"
              size={28}
              color="#188038"
            />
            <Text style={formStyles.summaryLabel}>Net Income</Text>
            <Text style={formStyles.summaryValue}>{netIncome || '-'}</Text>
          </View>
        </View>
      </View>

      {/* SECTION C – Horizontal Product Cards */}
      {products.length > 0 && (
        <View style={formStyles.container}>
          <Text style={formStyles.sectionTitle}>Eligible Products</Text>

          <FlatList
            data={products}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.productId.toString()}
            renderItem={renderProductCard}
            contentContainerStyle={{ paddingVertical: spacing.sm }}
          />
        </View>
      )}
    </ScrollView>
  );
}
