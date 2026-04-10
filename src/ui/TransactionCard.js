import React from 'react';
import { View, Text } from 'react-native';
import { formStyles } from '../styles/formstyles';
import { spacing } from '../theme';

// Format date to DD-MMM-YYYY
const formatDate = (dateStr) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
};

// Format amount with commas and 2 decimals
const formatAmount = (val) => {
  if (val === null || val === undefined || val === '') return '-';

  const num = Number(val);
  if (Number.isNaN(num)) return val;

  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};


export default function TransactionCard({ item }) {
  return (
    <View style={formStyles.transactionCard}>
      
      {/* Line 1 — Date + Remarks */}
      <View style={formStyles.transactionTopRow}>
        <Text style={formStyles.transactionDate}>{formatDate(item.transDate)}</Text>

        <Text style={formStyles.transactionRemarks} numberOfLines={1}>
          {item.remarks}
        </Text>
      </View>

      {/* Line 2 — CR / DR / BAL */}
      <View style={formStyles.transactionBottomRow}>
        <Text style={formStyles.transactionSmallGreen}>CR: {formatAmount(item.cr)}</Text>
        <Text style={formStyles.transactionSmallRed}>DR: {formatAmount(item.dr)}</Text>
        <Text style={formStyles.transactionSmall}>BAL: {formatAmount(item.balance)}</Text>
      </View>
    </View>
  );
}
