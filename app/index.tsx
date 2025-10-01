import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/providers/AppProvider';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated } = useApp();
  const { loading } = useFirebaseAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    if (isAuthenticated) {
      router.replace('/home');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading screen while determining auth state
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C3AED',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});