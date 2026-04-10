import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';

import { layoutStyles } from '../styles/layoutStyles';
import { formStyles } from '../styles/formstyles';
import { colors, spacing } from '../theme';
import { getCustomerDetails } from '../api/customer/getCustomerDetails';
import EncryptedStorage from 'react-native-encrypted-storage';
import { formatDateFromServer } from '../utils/dateUtils';

export default function UserProfileScreen() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userJson = await EncryptedStorage.getItem('user');
      const parsed = userJson ? JSON.parse(userJson) : null;
      const username = parsed?.username;

      if (!username) {
        setLoading(false);
        return;
      }

      const response = await getCustomerDetails(username);

      if (response?.executionStatus === 'Success') {
        setDetails(response.outParams);
      }
    } catch (error) {
      console.log('❌ Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInfo = (label, value) => (
    <View style={layoutStyles.infoCard}>
      <Text style={formStyles.label}>{label}</Text>
      <Text style={formStyles.infoValue}>
        {String(value ?? '-').trim()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={layoutStyles.screenCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={layoutStyles.screenCenter}>
        <Text>No details found</Text>
      </View>
    );
  }

  return (
    <View style={layoutStyles.pageContainer}>
      <ScrollView contentContainerStyle={layoutStyles.pageContent}>

        {/* Screen Title */}
        <Text style={[formStyles.sectionTitle]}>User Profile</Text>

        <View style={formStyles.container}>
          <View style={formStyles.infoRow}>
            {renderInfo('Branch', details.BranchName)}
            {renderInfo('Customer ID', details.CustomerId)}
          </View>
          {renderInfo('NRC / Identity No', details.IdentityNo)}
          {renderInfo('First Name', details.FirstName)}
          {renderInfo('Last Name', details.LastName)}
          <View style={formStyles.infoRow}>
            {renderInfo('Gender', details.GenderDescription)}
            {renderInfo('Date of Birth', formatDateFromServer(details.DateOfBirth))}
          </View>
          <View style={formStyles.infoRow}>
          {renderInfo('Mobile Number', details.MobileNumber)}

          {renderInfo('Email', details.Email)}
          </View>
          <View style={formStyles.infoRow}>
            {renderInfo('Province', details.ProvinceDescription)}
            {renderInfo('District', details.DistrictDescription)}
          </View>
          {renderInfo('Address', details.Address)}



        </View>

      </ScrollView>
    </View>
  );
}
