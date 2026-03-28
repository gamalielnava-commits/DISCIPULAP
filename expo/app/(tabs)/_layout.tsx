import { Stack } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import ScrollableTabs from "@/components/ScrollableTabs";
import { useApp } from "@/providers/AppProvider";

export default function TabLayout() {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="home" />
        <Stack.Screen name="discipulado" />
        <Stack.Screen name="grupos" />
        <Stack.Screen name="asistencia" />
        <Stack.Screen name="recursos" />
        <Stack.Screen name="reportes" />
        <Stack.Screen name="mensajes" />
        <Stack.Screen name="anuncios" />
        <Stack.Screen name="predicas" />
        <Stack.Screen name="devocionales" />
        <Stack.Screen name="usuarios" />
        <Stack.Screen name="administracion" />
        <Stack.Screen name="perfil" />
        <Stack.Screen name="zonas" />
      </Stack>
      
      <ScrollableTabs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});