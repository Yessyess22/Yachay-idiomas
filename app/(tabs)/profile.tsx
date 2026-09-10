import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.replace('/(auth)/login' as any);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58cc02" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mi Perfil</Text>

      {/* Tarjeta del usuario */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {profile?.username ? profile.username.charAt(0).toUpperCase() : '👤'}
          </Text>
        </View>

        <Text style={styles.usernameText}>{profile?.username || 'Usuario'}</Text>
        <Text style={styles.emailText}>{user?.email || 'Sin correo'}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>⚡ {profile?.total_xp || 0}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>🔥 1</Text>
            <Text style={styles.statLabel}>Racha Días</Text>
          </View>
        </View>
      </View>

      {/* Información de la cuenta */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionHeader}>Información de la Cuenta</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>UID de Usuario:</Text>
          <Text style={styles.infoVal} numberOfLines={1} ellipsizeMode="middle">
            {profile?.firebase_uid || user?.id || '-'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Miembro desde:</Text>
          <Text style={styles.infoVal}>
            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Hoy'}
          </Text>
        </View>
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#58cc02',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  emailText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#e9ecef',
    paddingTop: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoKey: {
    color: '#666',
    fontSize: 14,
  },
  infoVal: {
    color: '#222',
    fontWeight: '600',
    fontSize: 14,
    maxWidth: '60%',
  },
  logoutButton: {
    backgroundColor: '#ff4b4b',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
