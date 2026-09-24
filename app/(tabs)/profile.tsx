import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { questService } from '@/src/services/questService';
import { DailyQuest } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { Card } from '@/components/yachay/card';
import { ProgressBar } from '@/components/yachay/progress-bar';

const TEAL = '#1B8B8C';
const GOLD = '#E5A00D';
const PARCHMENT = '#F8F5EE';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { streakDays, xp, gems, lives, equippedOutfit, addGems, addXp } = useGame();
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [loadingQuests] = useState(false);

  const userStreak = Math.max(1, streakDays ?? profile?.streak_count ?? 1);
  const userXp = xp ?? profile?.total_xp ?? 0;
  const userGems = gems ?? profile?.gems ?? 100;
  const userLevel = Math.max(1, Math.floor(userXp / 100) + 1);

  const badges = [
    {
      id: '1',
      title: 'Chullo Sabio',
      desc: '50 XP en lecciones completadas',
      icon: require('@/assets/images/logros/item_chullo_coleccionable.png'),
      unlocked: userXp >= 50,
    },
    {
      id: '2',
      title: 'Corona Inca',
      desc: 'Racha de 7 días activa',
      icon: require('@/assets/images/logros/logro_hablante_corona.png'),
      unlocked: userStreak >= 7,
    },
    {
      id: '3',
      title: 'Inti Dorado',
      desc: '100 XP acumulado de maestría',
      icon: require('@/assets/images/logros/logro_maestro_sol.png'),
      unlocked: userXp >= 100,
    },
    {
      id: '4',
      title: 'Moneda Sagrada',
      desc: '500 gemas acumuladas',
      icon: require('@/assets/images/logros/moneda_yachay_coin.png'),
      unlocked: userGems >= 500,
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      questService
        .fetchDailyQuests(uid)
        .then(({ data }) => {
          if (isMounted) setQuests(data || []);
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleClaimQuest = async (q: DailyQuest) => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    const res = await questService.claimQuestReward(uid, q.id);
    if (res.success) {
      if (res.gemReward > 0) addGems(res.gemReward);
      if (res.xpReward > 0) addXp(res.xpReward);
      Alert.alert('¡Recompensa Reclamada! 🎉', `+${res.xpReward} XP y +${res.gemReward} Gemas 💎`);
      const { data } = await questService.fetchDailyQuests(uid);
      setQuests(data || []);
    }
  };

  async function handleSignOut() {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  const username = profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Apreciado Estudiante';

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de Perfil Andina */}
        <Card radius={22} style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('@/assets/images/yachi/yachi_principal.png')}
                style={styles.avatarImage}
                resizeMode="contain"
              />
              {/* Chullo Sagrado equipado desde la tienda */}
              {equippedOutfit === 'chullo_item' && (
                <Image
                  source={require('@/assets/images/logros/item_chullo_coleccionable.png')}
                  style={styles.chulloOverlay}
                  resizeMode="contain"
                />
              )}
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Nv. {userLevel}</Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{username}</Text>
              <Text style={styles.userEmail}>{user?.email || 'estudiante@yachay.pe'}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>🌟 Yachachiq • Estudiante Activo</Text>
              </View>
            </View>
          </View>

          {/* Estadísticas en 4 cajas redondeadas sincronizadas */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{userStreak}</Text>
              <Text style={styles.statLabel}>Racha</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🪙</Text>
              <Text style={styles.statValue}>{userXp}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>💎</Text>
              <Text style={styles.statValue}>{userGems}</Text>
              <Text style={styles.statLabel}>Gemas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>❤️</Text>
              <Text style={styles.statValue}>{lives}</Text>
              <Text style={styles.statLabel}>Vidas</Text>
            </View>
          </View>

          {/* Ribete textil andino */}
          <View style={styles.cardRibbon}>
            <Text style={styles.cardRibbonText}>❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖</Text>
          </View>
        </Card>

        {/* Sección: Misiones Diarias */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎯 Misiones de Hoy</Text>
        </View>

        <Card padding={14} style={styles.cardWrapper}>
          {loadingQuests ? (
            <ActivityIndicator size="small" color={TEAL} style={{ marginVertical: 20 }} />
          ) : quests.length > 0 ? (
            quests.map((q) => {
              const current = q.current_progress || 0;
              const target = q.target_amount || 1;
              const progressPct = Math.min(100, Math.round((current / target) * 100));
              return (
                <View key={q.id} style={styles.questRow}>
                  <Text style={styles.questEmoji}>⚔️</Text>
                  <View style={styles.questInfo}>
                    <Text style={styles.questTitle}>{q.title}</Text>
                    <ProgressBar progress={progressPct} height={6} color={TEAL} trackColor="#EAE3D6" style={styles.progressBarBg} />
                    <Text style={styles.questProgressText}>
                      {current} / {target} {progressPct >= 100 ? '• ¡Completado!' : ''}
                    </Text>
                  </View>
                  {progressPct >= 100 ? (
                    <TouchableOpacity
                      style={[styles.questRewardBadge, { backgroundColor: '#27AE60' }]}
                      onPress={() => handleClaimQuest(q)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.questRewardText, { color: '#FFFFFF', fontWeight: 'bold' }]}>Reclamar</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.questRewardBadge}>
                      <Text style={styles.questRewardText}>+{q.xp_reward} XP</Text>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyQuestBox}>
              <Text style={styles.emptyQuestEmoji}>✨</Text>
              <Text style={styles.emptyQuestTitle}>¡Al día con tus misiones!</Text>
              <Text style={styles.emptyQuestSub}>Vuelve mañana para nuevos desafíos en Quechua.</Text>
            </View>
          )}
        </Card>

        {/* Sección: Medallas Coleccionables */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏆 Medallas y Reliquias</Text>
        </View>

        <View style={styles.badgesGrid}>
          {badges.map((b) => (
            <Card key={b.id} padding={12} style={[styles.badgeCard, !b.unlocked && styles.badgeCardLocked]}>
              <View style={[styles.badgeIconBox, !b.unlocked && styles.badgeIconBoxLocked]}>
                <Image
                  source={b.icon}
                  style={[styles.badgeImage, !b.unlocked && styles.badgeImageLocked]}
                  resizeMode="contain"
                />
                {!b.unlocked && (
                  <View style={styles.badgeLockOverlay}>
                    <Text style={styles.badgeLockText}>🔒</Text>
                  </View>
                )}
              </View>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc} numberOfLines={2}>{b.desc}</Text>
              <View style={[styles.badgeStatusPill, b.unlocked ? styles.statusUnlockedPill : styles.statusLockedPill]}>
                <Text style={b.unlocked ? styles.statusUnlockedLabel : styles.statusLockedLabel}>
                  {b.unlocked ? '✓ Obtenida' : 'Bloqueada'}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Botón Cerrar Sesión */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>🚪 Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PARCHMENT,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Perfil Card */
  profileCard: {
    paddingBottom: 22,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 18,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DDF1ED',
    borderWidth: 2,
    borderColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  chulloOverlay: {
    position: 'absolute',
    top: -18,
    width: 50,
    height: 34,
    zIndex: 10,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: GOLD,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2C2520',
  },
  userEmail: {
    fontSize: 12,
    color: '#7A6E65',
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    color: '#1E824C',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Stats Grid */
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F7F4EB',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2C2520',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A6E65',
    marginTop: 1,
  },
  cardRibbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0E8DA',
    paddingVertical: 2,
    alignItems: 'center',
  },
  cardRibbonText: {
    color: '#A89785',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
  },

  /* Secciones */
  sectionHeader: {
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
    letterSpacing: -0.2,
  },

  /* Misiones */
  cardWrapper: {
    marginBottom: 18,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE1',
  },
  questEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  questInfo: {
    flex: 1,
    marginRight: 10,
  },
  questTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C2520',
    marginBottom: 4,
  },
  progressBarBg: {
    marginBottom: 3,
  },
  questProgressText: {
    fontSize: 11,
    color: '#7A6E65',
    fontWeight: '600',
  },
  questRewardBadge: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FBD46D',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questRewardText: {
    color: '#B7791F',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyQuestBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyQuestEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  emptyQuestTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  emptyQuestSub: {
    fontSize: 12,
    color: '#7A6E65',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Badges Grid */
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  badgeCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeCardLocked: {
    backgroundColor: '#F7F3EB',
    opacity: 0.7,
  },
  badgeIconBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#FFF9E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FCE7A6',
  },
  badgeIconBoxLocked: {
    backgroundColor: '#F5EFE6',
    borderColor: '#E2D9CC',
    position: 'relative',
  },
  badgeImage: {
    width: 44,
    height: 44,
  },
  badgeImageLocked: {
    opacity: 0.55,
  },
  badgeLockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D8CFC2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeLockText: {
    fontSize: 10,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2C2520',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 11,
    color: '#7A6E65',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
  },
  badgeStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusUnlockedPill: {
    backgroundColor: '#EAF7EE',
  },
  statusUnlockedLabel: {
    color: '#1E824C',
    fontSize: 10,
    fontWeight: '800',
  },
  statusLockedPill: {
    backgroundColor: '#EAE3D6',
  },
  statusLockedLabel: {
    color: '#7A6E65',
    fontSize: 10,
    fontWeight: '800',
  },

  /* Cerrar Sesión */
  signOutBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E87A7A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  signOutText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '800',
  },
});
