const fs = require('fs');

const packageJson = require('./package.json');

const version = packageJson.version;

// Example:
// 0.0.6 -> 6
const buildNumber = version.replace(/\./g, '');

const plistPath = './ios/CoinMob/Info.plist';

let plistContent = fs.readFileSync(plistPath, 'utf8');

// Update version name
plistContent = plistContent.replace(
  /<key>CFBundleShortVersionString<\/key>\s*<string>.*?<\/string>/,
  `<key>CFBundleShortVersionString</key>\n\t<string>${version}</string>`,
);

// Update build number
plistContent = plistContent.replace(
  /<key>CFBundleVersion<\/key>\s*<string>.*?<\/string>/,
  `<key>CFBundleVersion</key>\n\t<string>${buildNumber}</string>`,
);

fs.writeFileSync(plistPath, plistContent);

console.log('iOS version updated successfully');
console.log('Version:', version);
console.log('Build:', buildNumber);
