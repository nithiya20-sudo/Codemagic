import React from 'react';
import { View, ActivityIndicator, Dimensions, Alert } from 'react-native';
import Pdf from 'react-native-pdf';

export default function PdfViewerScreen({ route }) {
  const { url, title } = route.params;

  if (!url) {
    Alert.alert("Error", "PDF URL missing");
    return null;
  }

  const source = { uri: url, cache: true };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Pdf
        trustAllCerts={false} // security safe
        source={source}

        style={{
          flex: 1,
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}

        onLoadComplete={(pages) => {
          console.log(`📄 PDF loaded with ${pages} pages.`);
        }}

        onError={(error) => {
          console.log('❌ PDF load error:', error);
          Alert.alert("Error", "Unable to load PDF file");
        }}

        activityIndicator={
          <ActivityIndicator size="large" color="#007bff" />
        }
      />
    </View>
  );
}
