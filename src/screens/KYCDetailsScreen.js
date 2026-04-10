import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';

import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';

import { layoutStyles } from '../styles/layoutStyles';
import { formStyles } from '../styles/formstyles';
import { typography } from '../theme';

import { useKyc } from './kyc/KycContext';
import { getCustomerDetails } from '../api/customer/getCustomerDetails';
import { useAuth } from '../apicontext/AuthContext';
import { formatDateFromServer } from '../utils/dateUtils';

export default function KYCDetailsScreen({ navigation }) {
  const { kycData, updateSection } = useKyc();
  const [loading, setLoading] = useState(false);

  // 🔹 This matches how you use useAuth in Login/Signup
  const { user } = useAuth();

  const customerUserName = user?.username || '';

  const personal = kycData.personal || {};

  useEffect(() => {
    // If already loaded once, do NOT fetch again
    if (personal?.firstName) {
      return;
    }

    async function loadDetails() {
      try {
        if (!customerUserName) {
          console.warn('⚠ No customerUserName found in AuthContext');
          return;
        }

        setLoading(true);

        const data = await getCustomerDetails(customerUserName);

        if (!data) {
          throw new Error('No customer data returned');
        }

        const p = data?.outParams || {};

        updateSection('personal', {
          firstName: (p.FirstName || '').trim(),
          middleName: (p.MiddleName || '').trim(),
          lastName: (p.LastName || '').trim(),
          gender: p.GenderDescription || p.Gender || '',
          dob: p.DateOfBirth || '',
          nrc: (p.IdentityNo || '').trim(),
        });

        // ---- ADDRESS ----
        updateSection("address", {
          provinceCode: (p.Province || "").trim(),
          districtCode: (p.District || "").trim(),
          residentialAddress: (p.Address || "").trim(),
        });

        // ---- CONTACT ----
        updateSection("contact", {
          mobile: (p.MobileNumber || "").trim(),
          mobileVerified: false,   // backend does NOT give this
          email: (p.Email || "").trim(),
          emailVerified: false,    // backend does NOT give this
        });
      } catch (err) {
        console.error('KYC personal fetch error:', err);
        Alert.alert('Error', 'Unable to load personal details from server.');
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [customerUserName]);

  if (loading) {
    return (
      <View
        style={[
          layoutStyles.screen,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={typography.body}>Loading personal details…</Text>
      </View>
    );
  }

  const currentPersonal = kycData.personal || {};

  return (
    <View style={layoutStyles.screen}>
      <View style={formStyles.container}>
        <Text style={typography.h3}>KYC Details</Text>

        <Text style={formStyles.sectionTitle}>
          Please review your personal details before continuing.
        </Text>
        <Text style={formStyles.label}>First Name</Text>
        <AppInput style={formStyles.infoValue}
          value={currentPersonal.firstName || ''}
          editable={false}
        />
        <Text style={formStyles.label}>Middle Name</Text>
        <AppInput
          style={formStyles.infoLabel}
          value={currentPersonal.middleName || ''}
          editable={false}
        />
        <Text style={formStyles.label}>Last Name</Text>
        <AppInput
          label="Last Name"
          value={currentPersonal.lastName || ''}
          editable={false}
        />
        <Text style={formStyles.label}>Gender</Text>
        <AppInput
          label="Gender"
          value={currentPersonal.gender || ''}
          editable={false}
        />
        <Text style={formStyles.label}>Date Of Birth</Text>
        <AppInput
          label="Date of Birth"
          value={formatDateFromServer(currentPersonal.dob) || ''}
          editable={false}
        />
        <Text style={formStyles.label}>NRC Number</Text>
        <AppInput
          label="NRC Number"
          value={currentPersonal.nrc || ''}
          editable={false}
        />

        <View style={{ marginTop: 20 }}>
          <AppButton
            title="Next"
            onPress={() => navigation.navigate('KycAddressScreen')}
          />
        </View>
      </View>
    </View>
  );
}
