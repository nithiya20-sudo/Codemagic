
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { colors } from '../theme';

export default function SignatureBox({ onOK, onClear }) {
  const ref = useRef();

  const handleOK = (signature) => {
    if (onOK) onOK(signature);
  };

  const handleEnd = () => {
    ref.current?.readSignature();
  };

  const handleClear = () => {
    ref.current?.clearSignature();
    if (onClear) onClear();   // 🔥 notify parent
  };

  return (
    <View style={styles.container}>
      <SignatureScreen
        ref={ref}
        onOK={handleOK}
        onEnd={handleEnd}
        autoClear={false}
        webStyle={styleHtml}
        backgroundColor="#ffffff"
      />

      <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
        <Text style={styles.clearText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    height: 240,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  clearText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

const styleHtml = `
  .m-signature-pad {
    box-shadow: none;
    border: none;
  }
  .m-signature-pad--body {
    border: none;
  }
  canvas {
    background-color: #ffffff;
    border-radius: 8px;
  }
`;
