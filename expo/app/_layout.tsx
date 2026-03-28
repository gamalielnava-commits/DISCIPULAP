import '../firebaseConfig';
import { IS_FIREBASE_CONFIGURED } from '../firebaseConfig';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "@/providers/AppProvider";
import { GlobalPlayerProvider } from "@/providers/GlobalPlayerProvider";
import MiniPlayer from "@/components/MiniPlayer";
import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import { useBirthdayNotifications } from "@/hooks/useBirthdayNotifications";

SplashScreen.preventAutoHideAsync().catch((e) => {
  console.log("SplashScreen.preventAutoHideAsync error", e);
});

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;

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
      <Stack.Screen 
        name="test-firebase" 
        options={{ 
          headerShown: false,
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

    if (!IS_FIREBASE_CONFIGURED) {
      console.log('Firebase not configured. Skipping connection check.');
      return;
    }

    console.log('Firebase is configured and ready.');
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