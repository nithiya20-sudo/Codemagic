module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'module:react-native-dotenv', // your dotenv plugin
    'react-native-reanimated/plugin', // ⚠️ MUST be last
  ],
};
