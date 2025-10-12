module.exports = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: 'node20',
  platform: 'node',
  external: [
    'react',
    'react-dom',
    'react-native',
    'react-native-web',
    'expo',
    'firebase',
    '@firebase/*',
    '@google-cloud/*',
    'gcp-metadata',
    'google-auth-library',
    'google-gax',
    'protobufjs'
  ],
  treeShaking: true,
  metafile: false,
  logLevel: 'warning'
};
