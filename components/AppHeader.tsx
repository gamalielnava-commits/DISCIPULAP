import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import ChurchLogo from '@/components/ChurchLogo';
import { useApp } from '@/providers/AppProvider';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import NotificationBadge from '@/components/NotificationBadge';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightActions?: React.ReactNode;
  onBackPress?: () => void;
}

export default function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  rightActions,
  onBackPress,
}: AppHeaderProps) {
  const { isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  
  // Calcular padding superior: safe area + espacio adicional (reducido para más espacio)
  const topPadding = Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 40);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradient1, colors.gradient2]}
      style={[styles.container, { paddingTop: topPadding }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
            >
              <ChevronLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <View style={styles.logoWrapper}>
            <ChurchLogo size={46} />
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <NotificationBadge />
          {rightActions ? rightActions : null}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    borderBottomWidth: Platform.OS === 'android' ? 0.5 : 0,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 48,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    backgroundColor: '#FFFFFF25',
    borderRadius: 12,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 1,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#FFFFFFB3',
    letterSpacing: 0.2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});