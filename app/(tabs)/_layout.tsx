import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';

const TEAL = '#1B8B8C';

function NavIcon({ source, focused }: { source: any; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Image source={source} style={[styles.navIcon, { opacity: focused ? 1 : 0.42 }]} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: '#B0B8C1',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* Tab 1: Inicio */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <NavIcon source={require('@/assets/images/nav_inicio.png')} focused={focused} />
          ),
        }}
      />

      {/* Tab 2: Lecciones */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Lecciones',
          tabBarIcon: ({ focused }) => (
            <NavIcon source={require('@/assets/images/nav_lecciones.png')} focused={focused} />
          ),
        }}
      />

      {/* Tab 3: Logros */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Logros',
          tabBarIcon: ({ focused }) => (
            <NavIcon source={require('@/assets/images/nav_logros.png')} focused={focused} />
          ),
        }}
      />

      {/* Tab 4: Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <NavIcon source={require('@/assets/images/nav_perfil.png')} focused={focused} />
          ),
        }}
      />

      {/* Shop hidden from tab bar but still routable */}
      <Tabs.Screen
        name="shop"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E2D9',
    height: 74,
    paddingBottom: 12,
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#3A2A1A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  iconWrap: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  iconWrapActive: {
    backgroundColor: '#E4F4F4',
  },
  navIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
});
