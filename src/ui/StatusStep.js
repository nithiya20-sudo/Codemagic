import React from 'react';
import { View, Text } from 'react-native';
import { formStyles } from '../styles/formstyles';

export default function StatusStep({ label, date, status, isLast }) {
  const dotStyle =
    status === 'done'
      ? formStyles.statusDotDone
      : status === 'current'
      ? formStyles.statusDotCurrent
      : formStyles.statusDotPending;

  return (
    <View style={formStyles.statusRow}>
      {/* Left Column → Dot + Line */}
      <View style={formStyles.statusLeftCol}>
        <View style={[formStyles.statusDot, dotStyle]} />
        {!isLast && <View style={formStyles.statusLine} />}
      </View>

      {/* Right Column → Labels */}
      <View style={formStyles.statusRightCol}>
        <Text style={formStyles.statusLabel}>{label}</Text>
        <Text style={formStyles.statusDate}>{date}</Text>
      </View>
    </View>
  );
}
