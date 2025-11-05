module.exports = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: 'node20',
  platform: 'node',
  plugins: [
    {
      name: 'exclude-mobile-packages',
      setup(build) {
        build.onResolve({ filter: /^(react-native|expo|@expo\/|@react-native|@react-navigation|react-native-|@rork\/)/ }, args => {
          return { path: args.path, external: true };
        });
      },
    },
  ],
  external: [
    'react',
    'react-dom',
    'firebase',
    'firebase-admin',
    'firebase-admin/*',
    '@google-cloud/firestore',
    '@google-cloud/storage',
    'gcp-metadata',
    'google-auth-library',
    'google-gax',
    'protobufjs'
  ],
  treeShaking: true,
  metafile: false,
  logLevel: 'warning'
};
