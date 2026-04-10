// src/utils/imagePicker.js
import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const DEFAULT_OPTIONS = {
  mediaType: 'photo',
  includeBase64: false,
  quality: 0.5,     // compress
  maxWidth: 1280,   // resize
  maxHeight: 1280,  // resize
};

export const MAX_IMAGE_FILE_SIZE = 1024 * 1024; // 1 MB

// Build a readable file name like: IDPROOF_20251126_093015.jpg
const buildFileName = (prefix = 'IMG', asset) => {
  let ext = 'jpg';

  if (asset?.fileName && asset.fileName.includes('.')) {
    ext = asset.fileName.split('.').pop();
  } else if (asset?.type === 'image/png') {
    ext = 'png';
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  return `${prefix}_${yyyy}${MM}${dd}_${hh}${mm}${ss}.${ext}`;
};

// Internal helper to normalize + size-check
const processPickerResult = (result, maxSizeBytes, filePrefix) => {
  if (!result || result.didCancel) return null;

  const asset = result.assets && result.assets[0];
  if (!asset) return null;

  if (maxSizeBytes && asset.fileSize && asset.fileSize > maxSizeBytes) {
    Alert.alert(
      'File Too Large',
      `Please upload an image smaller than ${Math.round(
        maxSizeBytes / 1024 / 1024
      )} MB.`
    );
    return null;
  }

  const friendlyName = buildFileName(filePrefix, asset);

  return {
    uri: asset.uri,
    fileName: friendlyName,   // 👈 clean, readable name
    type: asset.type,
    size: asset.fileSize,
  };
};

/**
 * Standard image picker used across the app.
 * - Asks user: Camera / Gallery
 * - Applies compression + resize
 * - Enforces max size
 * - Generates friendly file name with prefix
 * - Returns a normalized { uri, fileName, type, size } or null.
 *
 * options = {
 *   maxSizeBytes?: number,
 *   filePrefix?: string,   // e.g. "IDPROOF", "ADDRPROOF"
 * }
 */
export const pickImageWithPrompt = (
  title = 'Attach Image',
  options = {}
) => {
  const {
    maxSizeBytes = MAX_IMAGE_FILE_SIZE,
    filePrefix = 'IMG',
  } = options;

  return new Promise((resolve) => {
    Alert.alert(
      title,
      'Choose how you want to attach the image',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const result = await launchCamera(DEFAULT_OPTIONS);
              const doc = processPickerResult(result, maxSizeBytes, filePrefix);
              resolve(doc);
            } catch (e) {
              console.log('❌ Camera error:', e);
              Alert.alert('Error', 'Unable to open camera.');
              resolve(null);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            try {
              const result = await launchImageLibrary(DEFAULT_OPTIONS);
              const doc = processPickerResult(result, maxSizeBytes, filePrefix);
              resolve(doc);
            } catch (e) {
              console.log('❌ Gallery error:', e);
              Alert.alert('Error', 'Unable to open gallery.');
              resolve(null);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true }
    );
  });
};
