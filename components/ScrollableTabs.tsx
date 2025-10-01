import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { usePathname, router } from 'expo-router';
import { Home, Users, Calendar, BookOpen, BarChart3, Book, GraduationCap, MessageSquare, UserCog, Settings, User, Bell, FileText, Heart, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
  name: string;
  title: string;
  icon: any;
  requiresPermission?: string;
}

const tabs: TabItem[] = [
  { name: 'home', title: 'Home', icon: Home },
  { name: 'discipulado', title: 'Discipulado', icon: GraduationCap, requiresPermission: 'canAccessDiscipulado' },
  { name: 'devocionales', title: 'Devocionales', icon: Heart, requiresPermission: 'canAccessDevocionales' },
  { name: 'predicas', title: 'Prédicas', icon: FileText, requiresPermission: 'canAccessPredicas' },
  { name: 'grupos', title: 'Grupos', icon: Users, requiresPermission: 'canAccessGrupos' },
  { name: 'zonas', title: 'Zonas', icon: MapPin, requiresPermission: 'canAccessZonas' },
  { name: 'asistencia', title: 'Asistencia', icon: Calendar, requiresPermission: 'canAccessAsistencia' },
  { name: 'mensajes', title: 'Mensajes', icon: MessageSquare, requiresPermission: 'canAccessMensajes' },
  { name: 'anuncios', title: 'Anuncios', icon: Bell, requiresPermission: 'canAccessAnuncios' },
  { name: 'recursos', title: 'Recursos', icon: BookOpen, requiresPermission: 'canAccessRecursos' },
  { name: 'reportes', title: 'Reportes', icon: BarChart3, requiresPermission: 'canAccessReportes' },
  { name: 'usuarios', title: 'Usuarios', icon: UserCog, requiresPermission: 'canAccessUsuarios' },
  { name: 'administracion', title: 'Admin', icon: Settings, requiresPermission: 'canAccessAdministracion' },
  { name: 'perfil', title: 'Perfil', icon: User, requiresPermission: 'canAccessPerfil' },
];

export default function ScrollableTabs() {
  const { permissions, isDarkMode } = useApp();
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tabWidths, setTabWidths] = useState<number[]>([]);
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(80)).current;
  const tabScales = useRef(tabs.map(() => new Animated.Value(1))).current;

  // Filter tabs based on permissions
  const visibleTabs = tabs.filter(tab => {
    if (!tab.requiresPermission) return true;
    return permissions?.[tab.requiresPermission as keyof typeof permissions];
  });

  const scrollToTab = useCallback((index: number) => {
    if (scrollViewRef.current && tabWidths.length > 0) {
      let scrollPosition = 0;
      const screenWidth = Dimensions.get('window').width;
      
      for (let i = 0; i < index; i++) {
        scrollPosition += tabWidths[i];
      }
      
      const tabCenter = scrollPosition + (tabWidths[index] / 2);
      const scrollTo = Math.max(0, tabCenter - (screenWidth / 2));
      
      scrollViewRef.current.scrollTo({ x: scrollTo, animated: true });
    }
  }, [tabWidths]);

  useEffect(() => {
    const currentPath = pathname.replace('/(tabs)/', '').replace('/', '');
    const index = visibleTabs.findIndex(tab => {
      // Handle both home and empty path for home
      if (tab.name === 'home') {
        return currentPath === '' || currentPath === 'home';
      }
      return tab.name === currentPath;
    });
    if (index !== -1) {
      setSelectedIndex(index);
      scrollToTab(index);
    }
  }, [pathname, visibleTabs, scrollToTab]);

  useEffect(() => {
    if (tabWidths.length === visibleTabs.length && tabWidths[selectedIndex]) {
      let position = 0;
      for (let i = 0; i < selectedIndex; i++) {
        position += tabWidths[i];
      }
      
      const currentTabWidth = tabWidths[selectedIndex];
      
      // Animate position without native driver for width
      Animated.timing(indicatorPosition, {
        toValue: position,
        duration: 300,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(indicatorWidth, {
        toValue: currentTabWidth,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [selectedIndex, tabWidths]);



  const handleTabPress = (tab: TabItem, index: number) => {
    const route = tab.name === 'home' ? '/(tabs)/home' : `/(tabs)/${tab.name}`;
    router.push(route as any);
    setSelectedIndex(index);
    scrollToTab(index);
  };

  const onTabLayout = (event: any, index: number) => {
    const { width } = event.nativeEvent.layout;
    setTabWidths(prev => {
      const newWidths = [...prev];
      newWidths[index] = width;
      return newWidths;
    });
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.surfaceLight,
      paddingBottom: Math.max(insets.bottom, 8),
    }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        overScrollMode="never"
        decelerationRate="fast"
      >
        <View style={styles.tabsContainer}>
          {visibleTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = selectedIndex === index;
            const originalIndex = tabs.findIndex(t => t.name === tab.name);
            const scale = tabScales[originalIndex];
            
            const animatePress = () => {
              Animated.sequence([
                Animated.timing(scale, {
                  toValue: 0.92,
                  duration: 80,
                  useNativeDriver: true,
                }),
                Animated.spring(scale, {
                  toValue: 1,
                  friction: 4,
                  tension: 40,
                  useNativeDriver: true,
                }),
              ]).start();
              handleTabPress(tab, index);
            };
            
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={animatePress}
                onLayout={(event) => onTabLayout(event, index)}
                activeOpacity={0.9}
              >
                <Animated.View
                  style={[
                    styles.tabContent,
                    isActive && styles.activeTabContent,
                    { transform: [{ scale }] },
                  ]}
                >
                  <Icon
                    size={26}
                    color={isActive ? colors.primary : colors.tabIconDefault}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isActive ? colors.primary : colors.tabIconDefault },
                      isActive && styles.activeTabLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.title}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
          
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: colors.primary,
                left: indicatorPosition,
                width: indicatorWidth,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              },
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 12,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    paddingTop: 12,
    paddingBottom: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 72,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  activeTabContent: {
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  activeTabLabel: {
    fontWeight: '800',
  },
  indicator: {
    position: 'absolute',
    bottom: 2,
    height: 4,
    borderRadius: 2,
  },
});