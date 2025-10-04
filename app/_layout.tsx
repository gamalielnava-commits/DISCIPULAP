import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { GlobalPlayerProvider } from "@/providers/GlobalPlayerProvider";
import MiniPlayer from "@/components/MiniPlayer";
import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useBirthdayNotifications } from "@/hooks/useBirthdayNotifications";

SplashScreen.preventAutoHideAsync().catch((e) => {
  console.log("SplashScreen.preventAutoHideAsync error", e);
});

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isDarkMode, isAuthenticated } = useApp();
  const { loading } = useFirebaseAuth();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const router = useRouter();
  const segments = useSegments();
  
  // Redirect logic based on authentication state
  useEffect(() => {
    if (loading) return; // Wait for auth to load
    
    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!isAuthenticated && inAuthGroup) {
      // User is not authenticated but trying to access protected routes
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup && segments[0] !== 'modal' && segments[0] !== 'gestion-modulos') {
      // User is authenticated but not in protected routes (and not in modal or gestion-modulos)
      router.replace('/home');
    }
  }, [isAuthenticated, segments, loading, router]);
  
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Atrás",
      headerStyle: {
        backgroundColor: isDarkMode ? colors.card : '#2B6CB0',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen 
        name="gestion-modulos" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: "modal",
          title: "Anuncio",
          headerStyle: {
            backgroundColor: isDarkMode ? colors.card : '#2B6CB0',
          },
        }} 
      />
    </Stack>
  );
}

function RootLayoutContent() {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const hasHiddenSplash = useRef(false);
  
  useBirthdayNotifications();

  const onReady = useCallback(async () => {
    if (hasHiddenSplash.current) return;
    try {
      await SplashScreen.hideAsync();
      hasHiddenSplash.current = true;
    } catch (e) {
      console.log("SplashScreen.hideAsync error", e);
    }
  }, []);
  
  return (
    <GlobalPlayerProvider>
      <View
        style={[styles.container, { backgroundColor: colors.background }]}
        onLayout={onReady}
        testID="root-layout-content"
      >
        <MiniPlayer />
        <RootLayoutNav />
      </View>
    </GlobalPlayerProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container} testID="gesture-root">
          <AppProvider>
            <RootLayoutContent />
          </AppProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});