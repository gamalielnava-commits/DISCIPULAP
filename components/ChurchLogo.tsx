import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useApp } from '@/providers/AppProvider';

interface ChurchLogoProps {
  size?: number;
  forceDark?: boolean;
}

export default function ChurchLogo({ size = 60, forceDark = false }: ChurchLogoProps) {
  const { isDarkMode } = useApp();
  const isDark = forceDark || isDarkMode;

  const handlePress = () => {
    router.push('/');
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.container, 
        { 
          width: size + 20, 
          height: size + 20,
        }
      ]}
    >
      <View style={[
        styles.logoOuter,
        { 
          width: size + 12, 
          height: size + 12,
          backgroundColor: isDark ? '#ffffff10' : '#00000008',
        }
      ]}>
        <View style={[
          styles.logoInner,
          { 
            width: size, 
            height: size,
            backgroundColor: '#8B5CF6',
            shadowColor: '#8B5CF6',
          }
        ]}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/51gamzq1fc1iut66r0qog' }}
            style={{
              width: size * 0.85,
              height: size * 0.85,
            }}
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoOuter: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  logoInner: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

});