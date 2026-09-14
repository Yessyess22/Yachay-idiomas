import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter, useSegments } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GameProvider, useGame } from '@/src/context/GameContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Bridges AuthContext profile into GameContext state on login/profile-load
function ProfileHydrator() {
  const { profile } = useAuth();
  const { hydrateFromProfile } = useGame();

  useEffect(() => {
    if (profile) {
      hydrateFromProfile(profile);
    }
  }, [profile]);

  return null;
}

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const { isBlocked } = useGame();
  const segments = useSegments();
  const router = useRouter();

  // Blocked guard — highest priority, runs independently
  useEffect(() => {
    if (isBlocked) {
      router.replace('/blocked' as any);
    }
  }, [isBlocked]);

  // Main routing: checks onboarding state from AsyncStorage before session routing
  useEffect(() => {
    if (loading) return;

    (async () => {
      const done = (await AsyncStorage.getItem('onboardingComplete')) === 'true';
      const inOnboarding = segments[0] === 'onboarding';

      if (!done && !inOnboarding) {
        router.replace('/onboarding' as any);
        return;
      }

      const inAuthGroup = segments[0] === '(auth)';
      if (!session && !inAuthGroup && done) {
        router.replace('/(auth)' as any);
      } else if (session && inAuthGroup) {
        router.replace('/(tabs)');
      }
    })();
  }, [session, loading, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="lesson/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="category/[slug]" options={{ headerShown: false }} />
      <Stack.Screen name="level/exam/[levelId]" options={{ headerShown: false }} />
      <Stack.Screen name="blocked" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="translator/index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <GameProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ProfileHydrator />
          <RootLayoutNav />
          <StatusBar style="auto" />
        </ThemeProvider>
      </GameProvider>
    </AuthProvider>
  );
}
