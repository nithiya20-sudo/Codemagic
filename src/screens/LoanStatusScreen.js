import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';

import AppPicker from '../ui/AppPicker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { formStyles } from '../styles/formstyles';
import { spacing } from '../theme';

import StatusStep from '../ui/StatusStep';
import { useAuth } from '../apicontext/AuthContext';
import { fetchCustomerLoanAccounts } from '../api/customer/loan';
import { getLoanStatusTracking } from '../api/customer/getLoanStatusTracking';
import { formatDateFromServer } from '../utils/dateUtils';

export default function LoanStatusScreen() {
  const { user } = useAuth();

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [statusList, setStatusList] = useState([]);
  const [loanList, setLoanList] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  /** =============================
   * Load customer's active loans
   ==============================*/
  useEffect(() => {
    const loadLoans = async () => {
      if (!user?.username && !user?.userName) return;

      try {
        setLoadingLoans(true);

        const custUserName = user.username || user.userName;
        const list = await fetchCustomerLoanAccounts(custUserName);

        const mapped = list.map((a, index) => ({
          label: `${a.accountDescription}`,
          value: a.accountNumber,
          key: `${a.accountNumber}-${index}`,
        }));

        setLoanList(mapped);

        // Preselect first loan if none selected
        if (!selectedLoan && mapped.length > 0) {
          setSelectedLoan(mapped[0].value);
        }
      } catch (err) {
        console.log('❌ Loan list load error:', err);
        Alert.alert('Error', 'Unable to load loan list.');
      } finally {
        setLoadingLoans(false);
      }
    };

    loadLoans();
  }, [user]);

  /** =============================
   * Load Loan Status Timeline
   ==============================*/
  const handleLoadStatus = async () => {
    if (!selectedLoan) {
      Alert.alert('Error', 'Please select a loan.');
      return;
    }

    try {
      setLoadingStatus(true);
      setStatusList([]);

      const timeline = await getLoanStatusTracking(selectedLoan);

      const formatted = timeline.map((step) => ({
      ...step,
      date: formatDateFromServer(step.date),
    }));

      if (!timeline || timeline.length === 0) {
        Alert.alert('Info', 'No status updates available for this loan.');
        return;
      }

      setStatusList(formatted);
    } catch (err) {
      console.log('❌ Loan status error:', err);
      Alert.alert(
        'Error',
        err?.message || 'Unable to load loan status. Please try again.'
      );
    } finally {
      setLoadingStatus(false);
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
              items={loanList}
              selectedValue={selectedLoan}
              onValueChange={(v) => setSelectedLoan(v)}
            />
          </View>

          <TouchableOpacity
            onPress={handleLoadStatus}
            style={formStyles.statementLoadIconButton}
            disabled={loadingLoans || !loanList.length}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="manage-search"
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* SECTION 2 — Timeline */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Loan Status Timeline</Text>

        {loadingStatus ? (
          <Text style={formStyles.statusNoData}>Loading status…</Text>
        ) : statusList.length === 0 ? (
          <Text style={formStyles.statusNoData}>
            Select a loan and tap the search icon to view status.
          </Text>
        ) : (
          statusList.map((step, index) => (
            <StatusStep
              key={index}
              label={step.label}
              date={step.date}
              status={step.status}
              isLast={index === statusList.length - 1}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
