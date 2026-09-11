import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { AccountInfo } from '@/components/yachay/account-info';
import { CerrarSesionButton } from '@/components/yachay/cerrar-sesion-button';
import { MainContainer } from '@/components/yachay/main-container';
import { ProfileHero } from '@/components/yachay/profile-hero';
import { ProfileStat } from '@/components/yachay/profile-stat';
import { YachayHeader } from '@/components/yachay/yachay-header';
import { Illustrations } from '@/constants/illustrations';
import { Theme } from '@/constants/yachay-theme';
import { useIsTablet } from '@/hooks/use-responsive';
import { useAuth } from '@/src/context/AuthContext';

export default function ProfileScreen() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const isTablet = useIsTablet();

  async function handleLogout() {
    await signOut();
    router.replace('/(auth)/login' as any);
  }

  if (loading) {
    return (
      <MainContainer style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.accentGreen} />
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <YachayHeader screenTitle="Mi Perfil" logoSource={Illustrations.logoYachayConLlama} />

      <ScrollView contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}>
        <ProfileHero avatarSource={Illustrations.avatarLlama} landscapeSource={Illustrations.imagenPaisajePerfil} />

        <View style={styles.statsRow}>
          <ProfileStat icon="bolt" iconColor={Theme.colors.accentOrange} value={profile?.total_xp ?? 0} label="XP Total" />
          <ProfileStat icon="local-fire-department" iconColor={Theme.colors.fireOrange} value={1} label="Racha Días" />
        </View>

        <AccountInfo
          rows={[
            { label: 'UID de Usuario:', value: profile?.firebase_uid || user?.id || '-' },
            {
              label: 'Miembro desde:',
              value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Hoy',
            },
          ]}
        />

        <CerrarSesionButton onPress={handleLogout} />
      </ScrollView>
    </MainContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  contentTablet: {
    paddingHorizontal: Theme.spacing.xl,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
