module.exports = {
  bundle: true,
  minify: true,
  sourcemap: false,
  target: 'node20',
  platform: 'node',
  plugins: [
    {
      name: 'server-safe-stubs',
      setup(build) {
        // Fully stub react-native so no Flow syntax is parsed
        build.onResolve({ filter: /^react-native$/ }, (args) => ({
          path: args.path,
          namespace: 'react-native-stub',
        }));
        build.onLoad({ filter: /.*/, namespace: 'react-native-stub' }, () => ({
          contents: 'module.exports = {}',
          loader: 'js',
        }));

        // Stub Firebase client SDKs if they are accidentally imported
        const firebaseClientPkgs = [/^firebase\/(app|auth|firestore|storage)(\/.*)?$/];
        firebaseClientPkgs.forEach((re) => {
          build.onResolve({ filter: re }, (args) => ({ path: args.path, namespace: 'firebase-client-stub' }));
        });
        build.onLoad({ filter: /.*/, namespace: 'firebase-client-stub' }, () => ({
          contents: 'export default {}',
          loader: 'js',
        }));

        // Alias common client-only files to empty modules
        const clientFiles = [
          /(^|\/)firebaseConfig(\.ts|\.js)?$/,
          /(^|\/)services\/(firebase)(\.ts|\.js)?$/,
          /(^|\/)hooks\/(useFirebaseAuth)(\.ts|\.js|\.tsx|\.jsx)?$/,
        ];
        clientFiles.forEach((re) => {
          build.onResolve({ filter: re }, (args) => ({ path: args.path, namespace: 'client-stub' }));
        });
        build.onLoad({ filter: /.*/, namespace: 'client-stub' }, () => ({
          contents: 'module.exports = {}; export {};',
          loader: 'js',
        }));

        // Exclude Expo/React Native ecosystem from server bundle
        build.onResolve({ filter: /^(expo|@expo\/|@react-native\/|@react-navigation\/|react-native-|@rork\/)/ }, (args) => ({
          path: args.path,
          external: true,
        }));

        // Exclude platform specific files
        build.onResolve({ filter: /\.(ios|android|native)\.(js|ts|tsx|jsx)$/ }, (args) => ({
          path: args.path,
          external: true,
        }));
      },
    },
  ],
  external: [
    'react',
    'react-dom',
    'expo',
    'expo-*',
    '@expo/**',
    '@react-native/**',
    '@react-navigation/**',
    'firebase-admin',
    'firebase-admin/**',
    '@google-cloud/firestore',
    '@google-cloud/storage',
    '@google-cloud/**',
    'gcp-metadata',
    'google-auth-library',
    'google-gax',
    'protobufjs',
    'protobufjs/**',
  ],
  treeShaking: true,
  metafile: false,
  logLevel: 'warning',
  mainFields: ['module', 'main'],
  conditions: ['node', 'import'],
};
