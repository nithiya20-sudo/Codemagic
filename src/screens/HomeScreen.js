import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  BackHandler,
  Alert,
  Dimensions,
} from 'react-native';
import { formStyles } from '../styles/formstyles';
import { layoutStyles } from '../styles/layoutStyles';
import AppPicker from '../ui/AppPicker';
import AppButton from '../ui/AppButton';
import { useAuth } from '../apicontext/AuthContext';
import { fetchCustomerLoanAccounts } from '../api/customer/loan';
import { fetchLoanDetails } from '../api/customer/loanDetails';
import { colors, spacing } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import { displayAmount } from '../utils/formatters';
import { getAffordability } from '../api/customer/getAffordability';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [userName, setUserName] = useState('User');
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [loading, setLoading] = useState(false);
  /** =============================
    * Back Button Confirm ONLY when screen is focused
    ==============================*/
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit the app?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]);
        return true; // block default back behavior
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  /** =============================
   * Load user name
   ==============================*/
  useEffect(() => {
    if (user?.fullName || user?.username) {
      setUserName(user.fullName || user.username);
    }
  }, [user]);

  /** =============================
   * Load customer loan accounts
   ==============================*/
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user?.username) return;
      try {
        const list = await fetchCustomerLoanAccounts(user.username);
        if (!mounted) return;

        const mapped = list.map((a, index) => ({
          id: a.accountNumber,
          accountNumber: a.accountNumber,
          accountDescription: a.accountDescription,
          key: `${a.accountNumber}-${index}`,
        }));

        setLoans(mapped);
        if (!selectedLoanId && mapped.length) setSelectedLoanId(mapped[0].id);
      } catch (e) {
        console.log('❌ account load error:', e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.username]);

  /** =============================
   * Load loan details for selected loan
   ==============================*/
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!selectedLoanId) return;
      console.log('🔍 Fetching loan details for:', selectedLoanId);
      setLoading(true);

      try {
        const details = await fetchLoanDetails(selectedLoanId);
        if (!mounted) return;

        // Merge loan details with the selected loan only (no flicker)
        setLoans(prev =>
          prev.map(l => (l.id === selectedLoanId ? { ...l, ...details } : l)),
        );
        console.log('✅ Loan details merged:', details);
      } catch (err) {
        console.error('❌ Loan details error:', err.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedLoanId]);

  const checkEligibilityAndNavigate = async loanType => {
    try {
      // ✅ Decide LoanTypeId
      const LoanTypeId = loanType === 'QUICK' ? 0 : 3;

      // ✅ Create payload separately (so we can log it)
      const payload = {
        CustomerUserName: user?.username,
        LoanAmount: 0,
        Tenure: 0,
        LoanTypeId: LoanTypeId,
        LoanNo: 0,
      };

      // 🔵 PRINT REQUEST
      console.log('📤 Affordability Request Payload:');
      console.log(JSON.stringify(payload, null, 2));

      const res = await getAffordability(payload);

      // 🟢 PRINT FULL RESPONSE
      console.log('📥 Affordability Full Response:');
      console.log(JSON.stringify(res, null, 2));

      if (res.executionStatus !== 'Success') {
        Alert.alert('Error', res.executionMessage || 'Failed');
        return;
      }

      const {
        IsKYCVerified,
        IsIncomeVerified,
        KYCValidationMessage,
        IncomeValidationMessage,
      } = res.outParams || {};

      if (IsKYCVerified !== '1') {
        Alert.alert(
          'KYC Required',
          KYCValidationMessage || 'Please complete your KYC.',
        );
        return;
      }

      if (IsIncomeVerified !== '1') {
        Alert.alert(
          'Income Verification Required',
          IncomeValidationMessage || 'Please verify your income.',
        );
        return;
      }

      // ✅ Navigate
      if (loanType === 'QUICK') {
        navigation.navigate('QuickLoan', {
          affordabilityResponse: res,
          loanTypeId: 0,
          loanNumber: null,
          LoanNo: 0,
        });
      } else {
        navigation.navigate('NormalLoan', {
          affordabilityResponse: res,
          loanTypeId: 0,
          loanNumber: null,
          LoanNo: 0,
        });
      }
    } catch (err) {
      console.log('❌ Loan eligibility error:', err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  /** =============================
   * Handle Picker Change
   ==============================*/
  const handleLoanChange = valOrItem => {
    const nextId =
      (valOrItem && typeof valOrItem === 'object'
        ? valOrItem.value ?? valOrItem.id
        : valOrItem) ?? null;
    setSelectedLoanId(nextId);
  };

  /** =============================
   * Helpers
   ==============================*/
  const selectedLoan = useMemo(
    () => loans.find(l => l.id === selectedLoanId) || {},
    [loans, selectedLoanId],
  );

  // Nice date like "30 Oct 2009"
  const niceDate = v => {
    if (!v || v === '-') return '-';
    // handle "MM/DD/YYYY HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss"
    try {
      if (typeof v === 'string') {
        const datePart = v.split(/[T ]/)[0];
        if (datePart.includes('/')) {
          const [mm, dd, yyyy] = datePart.split('/');
          const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
          if (!isNaN(d))
            return d.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
        }
        const d = new Date(v);
        if (!isNaN(d))
          return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
      }
      const d = new Date(v);
      if (!isNaN(d))
        return d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
    } catch (_) {}
    return '-';
  };

  /** =============================
   * UI Rendering
   ==============================*/
  return (
    <ScrollView
      style={layoutStyles.pageContainer}
      contentContainerStyle={layoutStyles.pageContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔹 Active Loan Summary */}
      <View style={[layoutStyles.sectionBlock]}>
        <Text style={[formStyles.sectionTitle, formStyles.mtLg]}>
          Active Loan Summary
        </Text>

        <AppPicker
          style={formStyles.mbLg}
          selectedValue={selectedLoanId}
          onValueChange={handleLoanChange}
          items={loans.map(loan => ({
            label: loan.accountDescription || loan.id,
            value: loan.id,
            key: loan.key,
          }))}
        />

        {/* Loan Info */}
        {/* 🔥 Stylish Loan Summary Card */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginTop: -6,
            elevation: 3,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {/* Header */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: '800',
              color: colors.primary,
            }}
          >
            {selectedLoan.product || 'Loan Product'}
          </Text>

          <Text style={{ marginTop: 4 }}>
            <Text style={formStyles.infoLabel}>Loan No: </Text>
            <Text style={formStyles.infoValue}>{selectedLoan.id || '-'}</Text>
          </Text>

          <View
            style={{
              height: 1,
              backgroundColor: '#E0E0E0',
              marginVertical: 12,
            }}
          />

          {/* 1️⃣ Row — Loan Amount & Balance Principal */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>Loan Amount</Text>
              <Text style={formStyles.infoValue}>
                {displayAmount(selectedLoan.amount)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>Balance Principal</Text>
              <Text style={formStyles.infoValue}>
                {displayAmount(selectedLoan.balprincipal)}
              </Text>
            </View>
          </View>

          {/* 2️⃣ Row — EMI & Installment */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>EMI</Text>
              <Text style={formStyles.infoValue}>
                {displayAmount(selectedLoan.emi)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>Installment</Text>
              <Text style={formStyles.infoValue}>
                {selectedLoan.tenure || '-'}
              </Text>
            </View>
          </View>

          {/* 3️⃣ Next Due + Arrear */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 16,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>Next Due</Text>
              <Text style={[formStyles.infoValue, { marginTop: 2 }]}>
                {niceDate(selectedLoan.nduedate)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>Arrears</Text>
              <Text style={[formStyles.infoValue, { marginTop: 2 }]}>
                {selectedLoan.darrear || 0} Days |{' '}
                {displayAmount(selectedLoan.aarrear)}
              </Text>
            </View>
          </View>

          {/* 4️⃣ Last Payment Section */}
          <View
            style={{
              height: 1,
              backgroundColor: '#E0E0E0',
              marginVertical: 12,
            }}
          />

          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>Last Payment Date</Text>
              <Text style={formStyles.infoValue}>
                {niceDate(selectedLoan.lpaydate)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={formStyles.infoLabel}>Last Paid Amount</Text>
              <Text style={formStyles.infoValue}>
                {displayAmount(selectedLoan.lpayamount)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 🔹 Quick Access */}
      <Text
        style={[formStyles.sectionTitle, { marginTop: 15, marginBottom: 0 }]}
      >
        Quick Access
      </Text>
      <View style={layoutStyles.quickActionsRow}>
        <AppButton
          title="Quick Loan"
          icon="flash-on"
          iconPosition="left"
          size="sm"
          onPress={() => checkEligibilityAndNavigate('QUICK')}
          style={[
            layoutStyles.quickActionButton,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primary,
            },
          ]}
          textStyle={{ color: colors.primary }}
          iconColor={colors.primary}
        />

        <AppButton
          title="Normal Loan"
          icon="credit-card"
          iconPosition="left"
          size="sm"
          onPress={() => checkEligibilityAndNavigate('NORMAL')}
          style={[
            layoutStyles.quickActionButton,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primary,
            },
          ]}
          textStyle={{ color: colors.primary }}
          iconColor={colors.primary}
        />

        <AppButton
          title="Loan Status"
          icon="bar-chart"
          iconPosition="left"
          size="sm"
          style={[
            layoutStyles.quickActionButton,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primary,
            },
          ]}
          textStyle={{ color: colors.primary }}
          iconColor={colors.primary}
          onPress={() => navigation.navigate('LoanStatus')}
        />

        <AppButton
          title="Loan Statement"
          icon="receipt"
          iconPosition="left"
          size="sm"
          style={[
            layoutStyles.quickActionButton,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primary,
            },
          ]}
          textStyle={{ color: colors.primary }}
          iconColor={colors.primary}
          onPress={() => navigation.navigate('LoanStatement')}
        />
      </View>

      {/* 🔹 Additional Details */}
      <Text
        style={[formStyles.sectionTitle, { marginTop: 10, marginBottom: 0 }]}
      >
        Additional Details
      </Text>
      <View style={layoutStyles.quickActionsRow}>
        <AppButton
          title="KYC Details"
          icon="badge"
          iconPosition="left"
          size="sm"
          style={layoutStyles.quickActionButton}
          onPress={() => navigation.navigate('KYCDetails')}
        />
        <AppButton
          title="Income Details"
          icon="account-balance-wallet"
          iconPosition="left"
          size="sm"
          style={layoutStyles.quickActionButton}
          onPress={() => navigation.navigate('IncomeDetails')}
        />
        <AppButton
          title="Max Loan"
          icon="trending-up"
          iconPosition="left"
          size="sm"
          style={layoutStyles.quickActionButton}
          onPress={() => navigation.navigate('Affordability')}
        />
      </View>
    </ScrollView>
  );
}
