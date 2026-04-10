import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AppPicker from '../ui/AppPicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TransactionCard from '../ui/TransactionCard';

import { formStyles } from '../styles/formstyles';
import { spacing, colors } from '../theme';

import { fetchCustomerLoanAccounts } from '../api/customer/loan';
import { fetchLoanDetails } from '../api/customer/loanDetails';
import { useAuth } from '../apicontext/AuthContext';
import { formatDateFromServer } from '../utils/dateUtils';
import { Linking } from 'react-native';
import { fetchStatementDownload } from '../api/customer/loanStatement';

// Amount formatter
const formatAmount = val => {
  if (!val) return '-';
  const num = Number(val);
  if (isNaN(num)) return val;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function LoanStatementScreen({ navigation }) {
  const [loanList, setLoanList] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const [loanSummary, setLoanSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const { user } = useAuth();
  const userName =
    user?.UserName ||
    user?.userName ||
    user?.username ||
    user?.CustomerUserName ||
    '';

  // 🔹 Load Customer Loan List on Page Load
  useEffect(() => {
    loadLoanList();
  }, []);

  const loadLoanList = async () => {
    try {
      setLoadingLoans(true);

      const list = await fetchCustomerLoanAccounts(userName);

      const mapped = list.map((a, index) => ({
        id: a.accountNumber,
        accountNumber: a.accountNumber,
        accountDescription: a.accountDescription,
        key: `${a.accountNumber}-${index}`,
      }));

      setLoanList(mapped);
    } catch (err) {
      console.log('❌ Loan List Error:', err);
      Alert.alert('Error', 'Unable to load loan accounts.');
    } finally {
      setLoadingLoans(false);
    }
  };

  // 🔹 Load Loan Summary + Last 3 Transactions
  const handleLoadStatement = async () => {
    if (!selectedLoan) {
      Alert.alert('Error', 'Please select a loan.');
      return;
    }

    try {
      setLoadingDetails(true);

      const res = await fetchLoanDetails(selectedLoan);

      const summary = {
        loanId: selectedLoan,
        loanDate: formatDateFromServer(res.loanDate),
        loanAmount: res.amount,
        roi: res.interest + '%',
        tenure: res.tenure || '-',
        balance: res.balprincipal,
        product: res.ProductDescription,
        nextDueDate: res.nduedate,
      };
      console.log(summary);

      setLoanSummary(summary);

      // 🔹 Extract last transactions (gridParams.Statement)
      const stm = res.transactions;
      console.log('Transaction', stm);

      setTransactions(stm);
    } catch (err) {
      console.log('❌ Loan Details Error:', err);
      Alert.alert('Error', 'Unable to load loan details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownloadStatement = async () => {
    if (!selectedLoan) {
      Alert.alert('Select Loan', 'Please select a loan before downloading.');
      return;
    }

    try {
      setLoadingDetails(true);

      const file = await fetchStatementDownload(selectedLoan);

      if (!file?.url) {
        Alert.alert('Error', 'No file URL received.');
        return;
      }

      // // 🔥 Open PDF in external browser or PDF viewer app
      // const supported = await Linking.canOpenURL(file.url);
      // if (supported) {
      //   await Linking.openURL(file.url);
      // } else {
      //   Alert.alert(
      //     'Error',
      //     'Cannot open the PDF on this device. URL: ' + file.url
      //   );
      // }
      console.log(file.url);
      // 🔥 Open inside app (VAPT-safe WebView)
      navigation.navigate('PdfViewer', {
        url: file.url,
        title: `Statement - ${selectedLoan}`,
      });
    } catch (err) {
      console.log('❌ Download error:', err);
      Alert.alert('Error', 'Unable to download statement.');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      {/* SECTION 1 — Loan Selection */}
      <View style={formStyles.container}>
        <Text style={formStyles.sectionTitle}>Active Loan</Text>

        <View style={formStyles.statementPickerRow}>
          <View style={formStyles.statementPickerWrapper}>
            <AppPicker
              label="Select Loan ID"
              items={loanList.map(loan => ({
                label: loan.accountDescription || loan.accountNumber,
                value: loan.accountNumber,
                key: loan.key,
              }))}
              selectedValue={selectedLoan}
              onValueChange={v => setSelectedLoan(v)}
            />
          </View>

          <TouchableOpacity
            onPress={handleLoadStatement}
            style={formStyles.statementLoadIconButton}
            activeOpacity={0.8}
          >
            {loadingDetails ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <MaterialIcons name="manage-search" size={22} color="#ffffffe8" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* SECTION 2 — Loan Summary */}
      {loanSummary && (
        <View style={formStyles.card}>
          <Text style={formStyles.sectionTitle}>Loan Summary</Text>

          <View style={formStyles.statementRow}>
            <View style={formStyles.statementCol}>
              <Text style={formStyles.statementLabel}>Loan ID</Text>
              <Text style={formStyles.statementValue}>
                {loanSummary.loanId}
              </Text>
            </View>

            <View style={formStyles.statementCol}>
              <Text style={formStyles.statementLabel}>Loan Date</Text>
              <Text style={formStyles.statementValue}>
                {loanSummary.loanDate}
              </Text>
            </View>
          </View>

          <View style={formStyles.statementRow}>
            <View style={formStyles.statementCol}>
              <Text style={formStyles.statementLabel}>Loan Amount</Text>
              <Text style={formStyles.statementValue}>
                {formatAmount(loanSummary.loanAmount)}
              </Text>
            </View>

            <View style={formStyles.statementCol}>
              <Text style={formStyles.statementLabel}>ROI</Text>
              <Text style={formStyles.statementValue}>{loanSummary.roi}</Text>
            </View>
          </View>

          <View style={formStyles.statementRow}>
            <View style={formStyles.statementCol}>
              <Text style={formStyles.statementLabel}>Tenure</Text>
              <Text style={formStyles.statementValue}>
                {loanSummary.tenure}
              </Text>
            </View>

            <View style={formStyles.statementCol}>
              <Text style={formStyles.statementLabel}>Balance</Text>
              <Text style={formStyles.statementValue}>
                {formatAmount(loanSummary.balance)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* SECTION 3 — Last Transactions */}
      {transactions.length > 0 && (
        <View style={formStyles.card}>
          <View
            style={[formStyles.statementHeaderRow, { marginTop: spacing.lg }]}
          >
            <Text style={formStyles.sectionTitle}>Recent Transactions</Text>

            <TouchableOpacity
              onPress={handleDownloadStatement}
              style={formStyles.downloadIconButton}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name="file-download"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {transactions.map((tx, index) => (
            <TransactionCard
              key={index}
              item={{
                transDate: tx.Date,
                remarks: tx.DescriptionOfTransaction,
                dr: tx.Debit,
                cr: tx.Credit,
                balance: tx.Balance,
              }}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
