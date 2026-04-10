// src/screens/kyc/KycAddressScreen.js
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Alert,ScrollView } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import AppPicker from '../../ui/AppPicker';
import AppInput from '../../ui/AppInput';
import AppButton from '../../ui/AppButton';

import { layoutStyles } from '../../styles/layoutStyles';
import { formStyles } from '../../styles/formstyles';
import { typography } from '../../theme';

import { useKyc } from './KycContext';
import { useAuth } from '../../apicontext/AuthContext';
import { getCustomerDetails } from '../../api/customer/getCustomerDetails';


const MASTER_DATA_KEY = 'MASTER_DATA';

export default function KycAddressScreen({ navigation }) {
  const { kycData, updateSection } = useKyc();
  const { user } = useAuth();

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [provinceCode, setProvinceCode] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [resAddress, setResAddress] = useState('');

  const [loading, setLoading] = useState(true);

  // -------------------------------
  // INIT: Load Master + Customer together (ordered)
  // -------------------------------
  useEffect(() => {
    async function init() {
      try {
        // 1) Load master data from storage
        const raw = await EncryptedStorage.getItem(MASTER_DATA_KEY);
        if (!raw) throw new Error('MasterData missing');

        const json = JSON.parse(raw);
        const provs = json?.Provinces || json?.provinces || [];
        const dists = json?.Districts || json?.districts || [];

        setProvinces(provs);
        setDistricts(dists);

        // 2) Start with anything already in KycContext.address
        let initialProvince = kycData.address?.provinceCode || '';
        let initialDistrict = kycData.address?.districtCode || '';
        let initialAddress =
          kycData.address?.residentialAddress || '';

        // // 3) If not in context, get from CustomerDetails
        // const username = user?.username;
        // if (username) {
        //   const data = await getCustomerDetails(username);
        //   const p = data?.outParams || {};

        //   if (!initialProvince && p.Province) {
        //     initialProvince = String(p.Province).trim();
        //   }

        //   if (!initialDistrict && p.District) {
        //     initialDistrict = String(p.District).trim();
        //   }

        //   if (!initialAddress && p.Address) {
        //     initialAddress = p.Address;
        //   }
        // }

        // 4) Apply to screen state
        setProvinceCode(initialProvince || '');
        setDistrictCode(initialDistrict || '');
        setResAddress(initialAddress || '');
      } catch (err) {
        console.error('Address init error:', err);
        Alert.alert(
          'Error',
          'Unable to load address details. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------
  // Filter districts for selected province
  // -------------------------------
  const filteredDistricts = useMemo(() => {
    return districts.filter(
      (d) =>
        String(d.ProvinceCode) === String(provinceCode)
    );
  }, [districts, provinceCode]);

  const handleProvinceChange = (val) => {
    setProvinceCode(val);
    setDistrictCode(''); // reset district when province changes
  };

  const handleNext = () => {
    if (!provinceCode) {
      Alert.alert('Validation', 'Please select a province.');
      return;
    }
    if (!districtCode) {
      Alert.alert('Validation', 'Please select a district.');
      return;
    }
    if (!resAddress.trim()) {
      Alert.alert(
        'Validation',
        'Please enter your residential address.'
      );
      return;
    }

    updateSection('address', {
      provinceCode,
      districtCode,
      residentialAddress: resAddress,
    });

    navigation.navigate('KycEmailScreen');
  };

  if (loading) {
    return (
      <View
        style={[
          layoutStyles.screen,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={typography.body}>
          Loading address details…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={formStyles.container}>
      <View style={formStyles.card}>
        <Text style={formStyles.sectionTitle}>Address Details</Text>

        {/* Province */}
        <AppPicker
          label="Province"
          placeholder="Select Province"
          items={provinces.map((p) => ({
            label: p.Name,
            value: String(p.Code),
          }))}
          selectedValue={String(provinceCode)}
          onValueChange={handleProvinceChange}
        />

        {/* District */}
        <AppPicker
          label="District"
          placeholder="Select District"
          items={filteredDistricts.map((d) => ({
            label: d.Name,
            value: String(d.Code),
          }))}
          selectedValue={String(districtCode)}
          onValueChange={(val) => setDistrictCode(String(val))}
        />

        {/* Address */}
        <AppInput
          label="Residential Address"
          value={resAddress}
          onChangeText={setResAddress}
          placeholder="Enter full residential address"
          multiline
          numberOfLines={4}
        />

 
      </View>
             {/* Buttons */}
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <View style={{ flex: 1 }}>
            <AppButton
              title="Back"
              variant="secondary"
              onPress={() => navigation.navigate("KYCDetails")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton title="Next" onPress={handleNext} />
          </View>
        </View>
 </ScrollView>
  );
}
