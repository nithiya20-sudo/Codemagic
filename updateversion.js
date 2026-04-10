const fs = require('fs');

const pkg = require('./package.json');
const version = pkg.version;
const code = version.replace(/\./g, '');

const data = `VERSION_NAME=${version}
VERSION_CODE=${code}
`;

fs.writeFileSync('./android/version.properties', data);

console.log('Android version updated:', version);
