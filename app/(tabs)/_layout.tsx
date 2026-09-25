import { Tabs } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';

const TEAL = '#00C853';

function NavIcon({ source, focused }: { source: any; focused: boolean }) {
  return (
    <View style={styles.tabItemContainer}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Image source={source} style={[styles.navIcon, { opacity: focused ? 1 : 0.45 }]} />
      </View>
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

function AndeanBottomRibbon() {
  return (
    <View style={styles.bottomRibbonWrap}>
      <View style={styles.ribbonLine} />
      <Text style={styles.ribbonDiamonds}>❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖</Text>
      <View style={styles.ribbonLine} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <View style={styles.wrapper}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#0E5A60',
          tabBarInactiveTintColor: '#8A8074',
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

        {/* Tab 2: Explorar (Biblioteca Abierta) */}
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explorar',
            tabBarIcon: ({ focused }) => (
              <NavIcon source={require('@/assets/images/nav_lecciones.png')} focused={focused} />
            ),
          }}
        />

        {/* Tab 3: Traductor */}
        <Tabs.Screen
          name="translator"
          options={{
            title: 'Traductor',
            tabBarIcon: ({ focused }) => (
              <NavIcon source={require('@/assets/images/categorias/cat_pronunciacion.png')} focused={focused} />
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

        {/* Logros/Leaderboard oculto del tab bar, integrado dentro de Perfil */}
        <Tabs.Screen
          name="leaderboard"
          options={{
            href: null,
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
      <AndeanBottomRibbon />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAF7F0',
  },
  tabBar: {
    backgroundColor: '#FFFDF9',
    borderTopWidth: 1,
    borderTopColor: '#EAE3D6',
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#3A2A1A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  iconWrapActive: {
    backgroundColor: '#DDF1ED',
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  activeIndicator: {
    width: 22,
    height: 3,
    backgroundColor: TEAL,
    borderRadius: 2,
    marginTop: 2,
  },
  bottomRibbonWrap: {
    backgroundColor: '#FFFDF9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
    paddingTop: 2,
    paddingHorizontal: 16,
    gap: 8,
  },
  ribbonLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#E8DCC8',
  },
  ribbonDiamonds: {
    fontSize: 11,
    color: '#D4A373',
    letterSpacing: 4,
    fontWeight: '700',
  },
});
