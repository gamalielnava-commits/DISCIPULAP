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
        // Stub out react-native completely
        build.onResolve({ filter: /^react-native$/ }, args => {
          return { 
            path: args.path, 
            namespace: 'react-native-stub' 
          };
        });
        
        build.onLoad({ filter: /.*/, namespace: 'react-native-stub' }, () => {
          return {
            contents: 'module.exports = {};',
            loader: 'js',
          };
        });
        
        // Stub Firebase client SDK if accidentally imported in server bundle
        const firebaseClientPkgs = [/^firebase\/(app|auth|firestore|storage)(\/.*)?$/];
        firebaseClientPkgs.forEach((re) => {
          build.onResolve({ filter: re }, args => {
            return { path: args.path, namespace: 'firebase-client-stub' };
          });
        });
        build.onLoad({ filter: /.*/, namespace: 'firebase-client-stub' }, () => {
          return { contents: 'export default {};', loader: 'js' };
        });

        // Alias common client files to empty modules in functions
        const clientFiles = [
          /(^|\/)firebaseConfig(\.ts|\.js)?$/,
          /(^|\/)services\/(firebase)(\.ts|\.js)?$/,
          /(^|\/)hooks\/(useFirebaseAuth)(\.ts|\.js|\.tsx|\.jsx)?$/,
        ];
        clientFiles.forEach((re) => {
          build.onResolve({ filter: re }, args => {
            return { path: args.path, namespace: 'client-stub' };
          });
        });
        build.onLoad({ filter: /.*/, namespace: 'client-stub' }, () => {
          return { contents: 'module.exports = {}; export {};', loader: 'js' };
        });
        
        // Exclude all Expo packages
        build.onResolve({ filter: /^(expo|@expo\/|@react-native\/|@react-navigation\/|react-native-|@rork\/)/ }, args => {
          return { 
            path: args.path, 
            external: true 
          };
        });
        
        // Exclude platform-specific files
        build.onResolve({ filter: /\.(ios|android|native)\.(js|ts|tsx|jsx)$/ }, args => {
          return { path: args.path, external: true };
        });
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
    'protobufjs/**'
  ],
  treeShaking: true,
  metafile: false,
  logLevel: 'warning',
  mainFields: ['module', 'main'],
  conditions: ['node', 'import']
};
