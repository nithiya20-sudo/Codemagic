// import React, { useState, useEffect } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';

// import AppPicker from '../ui/AppPicker';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// import { formStyles } from '../styles/formstyles';
// import { spacing } from '../theme';

// import StatusStep from '../ui/StatusStep';
// import { useAuth } from '../apicontext/AuthContext';
// import { fetchCustomerLoanAccounts } from '../api/customer/loan';
// import { getLoanStatusTracking } from '../api/customer/getLoanStatusTracking';
// import { formatDateFromServer } from '../utils/dateUtils';

// export default function LoanStatusScreen() {
//   const { user } = useAuth();

//   const [selectedLoan, setSelectedLoan] = useState(null);
//   const [statusList, setStatusList] = useState([]);
//   const [loanList, setLoanList] = useState([]);
//   const [loadingLoans, setLoadingLoans] = useState(false);
//   const [loadingStatus, setLoadingStatus] = useState(false);

//   /** =============================
//    * Load customer's active loans
//    ==============================*/
//   useEffect(() => {
//     const loadLoans = async () => {
//       if (!user?.username && !user?.userName) return;

//       try {
//         setLoadingLoans(true);

//         const custUserName = user.username || user.userName;
//         const list = await fetchCustomerLoanAccounts(custUserName);

//         const mapped = list.map((a, index) => ({
//           label: `${a.accountDescription}`,
//           value: a.accountNumber,
//           key: `${a.accountNumber}-${index}`,
//         }));

//         setLoanList(mapped);

//         // Preselect first loan if none selected
//         if (!selectedLoan && mapped.length > 0) {
//           setSelectedLoan(mapped[0].value);
//         }
//       } catch (err) {
//         console.log('❌ Loan list load error:', err);
//         Alert.alert('Error', 'Unable to load loan list.');
//       } finally {
//         setLoadingLoans(false);
//       }
//     };

//     loadLoans();
//   }, [user]);

//   /** =============================
//    * Load Loan Status Timeline
//    ==============================*/
//   const handleLoadStatus = async () => {
//     if (!selectedLoan) {
//       Alert.alert('Error', 'Please select a loan.');
//       return;
//     }

//     try {
//       setLoadingStatus(true);
//       setStatusList([]);

//       const timeline = await getLoanStatusTracking(selectedLoan);

//       const formatted = timeline.map((step) => ({
//       ...step,
//       date: formatDateFromServer(step.date),
//     }));

//       if (!timeline || timeline.length === 0) {
//         Alert.alert('Info', 'No status updates available for this loan.');
//         return;
//       }

//       setStatusList(formatted);
//     } catch (err) {
//       console.log('❌ Loan status error:', err);
//       Alert.alert(
//         'Error',
//         err?.message || 'Unable to load loan status. Please try again.'
//       );
//     } finally {
//       setLoadingStatus(false);
//     }
//   };

//   return (
//     <ScrollView
//       style={{ flex: 1 }}
//       contentContainerStyle={{ padding: spacing.md }}
//       keyboardShouldPersistTaps="handled"
//     >
//       {/* SECTION 1 — Loan Selection */}
//       <View style={formStyles.container}>
//         <Text style={formStyles.sectionTitle}>Active Loan</Text>

//         <View style={formStyles.statementPickerRow}>
//           <View style={formStyles.statementPickerWrapper}>
//             <AppPicker
//               label="Select Loan ID"
//               items={loanList}
//               selectedValue={selectedLoan}
//               onValueChange={(v) => setSelectedLoan(v)}
//             />
//           </View>

//           <TouchableOpacity
//             onPress={handleLoadStatus}
//             style={formStyles.statementLoadIconButton}
//             disabled={loadingLoans || !loanList.length}
//             activeOpacity={0.8}
//           >
//             <MaterialIcons
//               name="manage-search"
//               size={22}
//               color="#fff"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* SECTION 2 — Timeline */}
//       <View style={formStyles.card}>
//         <Text style={formStyles.sectionTitle}>Loan Status Timeline</Text>

//         {loadingStatus ? (
//           <Text style={formStyles.statusNoData}>Loading status…</Text>
//         ) : statusList.length === 0 ? (
//           <Text style={formStyles.statusNoData}>
//             Select a loan and tap the search icon to view status.
//           </Text>
//         ) : (
//           statusList.map((step, index) => (
//             <StatusStep
//               key={index}
//               label={step.label}
//               date={step.date}
//               status={step.status}
//               isLast={index === statusList.length - 1}
//             />
//           ))
//         )}
//       </View>
//     </ScrollView>
//   );
// }

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

  // Start as true so the loader shows immediately (no empty screen flash)
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState(false);

  /** =============================
   * Load customer's active loans
   ==============================*/
  useEffect(() => {
    const loadLoans = async () => {
      const custUserName = user?.username || user?.userName;

      if (!custUserName) {
        setLoadingLoans(false);
        return;
      }

      try {
        setLoadingLoans(true);

        const list = await fetchCustomerLoanAccounts(custUserName);

        const mapped = (list || []).map((a, index) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Check empty BEFORE mapping (avoids a crash when timeline is null)
      if (!timeline || timeline.length === 0) {
        Alert.alert('Info', 'No status updates available for this loan.');
        return;
      }

      const formatted = timeline.map(step => ({
        ...step,
        date: formatDateFromServer(step.date),
      }));

      setStatusList(formatted);
    } catch (err) {
      console.log('❌ Loan status error:', err);
      Alert.alert(
        'Error',
        err?.message || 'Unable to load loan status. Please try again.',
      );
    } finally {
      setLoadingStatus(false);
    }
  };

  // ------------------------------------
  // Loader while the active loan list is loading
  // ------------------------------------
  if (loadingLoans) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: spacing.lg,
          backgroundColor: '#F2F2F2',
        }}
      >
        <ActivityIndicator size="large" color="#1E9E86" />
        <Text style={{ marginTop: spacing.sm, fontSize: 13 }}>
          Loading active loans...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: spacing.md }}
      keyboardShouldPersistTaps="handled"
    >
      {/* SECTION 1 — Loan Selection */}
      <View style={formStyles.container}>
        <Text style={formStyles.sectionTitle}>Active Loan</Text>

        {loanList.length === 0 ? (
          <Text style={formStyles.statusNoData}>No active loans found.</Text>
        ) : (
          <View style={formStyles.statementPickerRow}>
            <View style={formStyles.statementPickerWrapper}>
              <AppPicker
                label="Select Loan ID"
                items={loanList}
                selectedValue={selectedLoan}
                onValueChange={v => setSelectedLoan(v)}
              />
            </View>

            <TouchableOpacity
              onPress={handleLoadStatus}
              style={formStyles.statementLoadIconButton}
              disabled={loadingStatus}
              activeOpacity={0.8}
            >
              {loadingStatus ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialIcons name="manage-search" size={22} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* SECTION 2 — Timeline */}
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Loan Status Timeline</Text>

        {loadingStatus ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.md }}>
            <ActivityIndicator size="small" color="#1E9E86" />
            <Text style={[formStyles.statusNoData, { marginTop: spacing.sm }]}>
              Loading status…
            </Text>
          </View>
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
