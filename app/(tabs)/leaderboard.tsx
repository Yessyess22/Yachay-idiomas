import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useGame } from '@/src/context/GameContext';
import { leaderboardService } from '@/src/services/leaderboardService';
import { LeaderboardEntry } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const GOLD = '#FFB300';
const PARCHMENT = '#F8F5EE';
const BORDER_COLOR = '#ECE5D8';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: any;
  status: 'unlocked' | 'progress' | 'locked';
  progress?: number;
}

type Tab = 'achievements' | 'leaderboard';

function StatusBadge({ status, progress }: { status: Achievement['status']; progress?: number }) {
  if (status === 'unlocked') {
    return (
      <View style={[styles.badgePill, styles.badgeUnlocked]}>
        <Text style={styles.badgeUnlockedText}>✓ Desbloqueado</Text>
      </View>
    );
  }
  if (status === 'progress') {
    return (
      <View style={[styles.badgePill, styles.badgeProgress]}>
        <Text style={styles.badgeProgressText}>En progreso ({progress}%)</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badgePill, styles.badgeLocked]}>
      <Text style={styles.badgeLockedText}>🔒 Bloqueado</Text>
    </View>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.rankEmoji}>🥇</Text>;
  if (rank === 2) return <Text style={styles.rankEmoji}>🥈</Text>;
  if (rank === 3) return <Text style={styles.rankEmoji}>🥉</Text>;
  return (
    <View style={styles.rankNumberContainer}>
      <Text style={styles.rankNumber}>#{rank}</Text>
    </View>
  );
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, firebase_uid: '1', username: 'Yachay Master 👑', weekly_xp: 450, league_tier: 'gold', avatar_url: null },
  { rank: 2, firebase_uid: '2', username: 'Kuntur Inca 🦅',    weekly_xp: 380, league_tier: 'silver', avatar_url: null },
  { rank: 3, firebase_uid: '3', username: 'Amaru Quechua 🐍', weekly_xp: 310, league_tier: 'silver', avatar_url: null },
  { rank: 4, firebase_uid: '4', username: 'Sumaq Learner 🌿', weekly_xp: 240, league_tier: 'bronze', avatar_url: null },
  { rank: 5, firebase_uid: '5', username: 'Inti Sol ☀️',      weekly_xp: 190, league_tier: 'bronze', avatar_url: null },
];

export default function LogrosScreen() {
  const { streakDays, xp, gems } = useGame();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('achievements');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);
  const [loading] = useState(false);

  const userStreak = Math.max(1, streakDays ?? profile?.streak_count ?? 1);
  const userXp = xp ?? profile?.total_xp ?? 0;
  const userGems = gems ?? profile?.gems ?? 100;

  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'Principiante Quechua',
      description: 'Acumula tus primeros 50 XP en lecciones',
      icon: require('@/assets/images/logros/logro_principiante_chullo.png'),
      status: userXp >= 50 ? 'unlocked' : userXp > 0 ? 'progress' : 'locked',
      progress: userXp >= 50 ? 100 : Math.round((userXp / 50) * 100),
    },
    {
      id: 2,
      title: 'Hablante Activo',
      description: 'Mantén una racha de 7 días activa',
      icon: require('@/assets/images/logros/logro_hablante_corona.png'),
      status: userStreak >= 7 ? 'unlocked' : userStreak > 1 ? 'progress' : 'locked',
      progress: userStreak >= 7 ? 100 : Math.round((userStreak / 7) * 100),
    },
    {
      id: 3,
      title: 'Maestro Yachay',
      description: 'Domina 100 XP de vocabulario andino',
      icon: require('@/assets/images/logros/logro_maestro_sol.png'),
      status: userXp >= 100 ? 'unlocked' : userXp > 0 ? 'progress' : 'locked',
      progress: userXp >= 100 ? 100 : Math.round((userXp / 100) * 100),
    },
    {
      id: 4,
      title: 'Gran Ahorrador',
      description: 'Acumula 500 gemas en tu tesoro',
      icon: require('@/assets/images/logros/moneda_yachay_coin.png'),
      status: userGems >= 500 ? 'unlocked' : userGems > 0 ? 'progress' : 'locked',
      progress: userGems >= 500 ? 100 : Math.round((userGems / 500) * 100),
    },
    {
      id: 5,
      title: 'Chullo Coleccionable',
      description: 'Alcanza el Nivel 2 en Yachay (200 XP)',
      icon: require('@/assets/images/logros/item_chullo_coleccionable.png'),
      status: userXp >= 200 ? 'unlocked' : 'locked',
      progress: userXp >= 200 ? 100 : Math.round((userXp / 200) * 100),
    },
  ];

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const uid = user?.uid || (user as any)?.id;
        const { data } = await leaderboardService.fetchWeeklyLeaderboard(uid, userXp);
        if (isMounted && data && data.length > 0) {
          setEntries(data);
        }
      } catch {
        // Usar lista por defecto si falla red
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [user, userXp, activeTab]);

  return (
    <View style={styles.container}>
      <YachayTopBar />

      {/* Banner de Racha con Montañas Andinas */}
      <View style={styles.rachaBanner}>
        <View style={styles.rachaContent}>
          <View style={styles.rachaTagBadge}>
            <Text style={styles.rachaTag}>🔥 RACHA IMPARABLE</Text>
          </View>
          <Text style={styles.rachaDays}>
            {userStreak} {userStreak === 1 ? 'Día Seguido' : 'Días Seguidos'}
          </Text>
          <Text style={styles.rachaSub}>¡El esfuerzo constante forja al sabio!</Text>
        </View>
        <Image
          source={require('@/assets/images/logros/logro_hablante_corona.png')}
          style={styles.rachaCup}
          resizeMode="contain"
        />
        {/* Ribete textil andino */}
        <View style={styles.andineRibbon}>
          <Text style={styles.andineRibbonText}>▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼</Text>
        </View>
      </View>

      {/* Selector de Pestañas con estilo pastilla */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'achievements' && styles.tabBtnActive]}
          onPress={() => setActiveTab('achievements')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
            🏅 Mis Logros
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'leaderboard' && styles.tabBtnActive]}
          onPress={() => setActiveTab('leaderboard')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            🏆 Ranking Semanal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'achievements' ? (
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {achievements.map((ach) => (
            <View
              key={ach.id}
              style={[
                styles.card,
                ach.status === 'locked' && styles.cardLocked,
              ]}
            >
              <View style={styles.cardIconWrapper}>
                <Image
                  source={ach.icon}
                  style={[styles.cardIcon, ach.status === 'locked' && styles.cardIconLocked]}
                  resizeMode="contain"
                />
                {ach.status === 'locked' && (
                  <View style={styles.cardLockOverlay}>
                    <Text style={styles.cardLockText}>🔒</Text>
                  </View>
                )}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{ach.title}</Text>
                <Text style={styles.cardDesc}>{ach.description}</Text>
                {ach.progress !== undefined && ach.status === 'progress' && (
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${ach.progress}%` }]} />
                  </View>
                )}
                <View style={styles.statusBadgeRow}>
                  <StatusBadge status={ach.status} progress={ach.progress} />
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.leaderboardContainer}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={TEAL} />
              <Text style={styles.loadingText}>Cargando tabla de posiciones...</Text>
            </View>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item, index) => (item.rank ?? index).toString() + (item.firebase_uid || index)}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isMe = (user?.uid || (user as any)?.id) === item.firebase_uid;
                const isPodium = (item.rank ?? 99) <= 3;
                return (
                  <View
                    style={[
                      styles.card,
                      styles.rankCard,
                      isMe && styles.rankCardMe,
                      isPodium && styles.rankCardPodium,
                    ]}
                  >
                    <View style={styles.rankBadgeCol}>
                      <RankBadge rank={item.rank ?? 0} />
                    </View>
                    <View style={styles.rankAvatarCircle}>
                      <Text style={styles.rankAvatarText}>
                        {item.username ? item.username.charAt(0).toUpperCase() : '👤'}
                      </Text>
                    </View>
                    <View style={styles.rankInfoCol}>
                      <Text style={[styles.rankUsername, isMe && styles.rankUsernameMe]} numberOfLines={1}>
                        {item.username} {isMe && '(Tú)'}
                      </Text>
                      <Text style={styles.rankLeague}>
                        {item.league_tier === 'gold' ? '🌟 Liga de Oro' : item.league_tier === 'silver' ? '🥈 Liga de Plata' : '🥉 Liga Bronce'}
                      </Text>
                    </View>
                    <View style={styles.rankXpCol}>
                      <Text style={styles.rankXpValue}>{item.weekly_xp}</Text>
                      <Text style={styles.rankXpLabel}>XP</Text>
                    </View>
                  </View>
                );
              }}
              ListFooterComponent={<View style={{ height: 40 }} />}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PARCHMENT,
  },
  /* Banner de Racha */
  rachaBanner: {
    backgroundColor: '#009624',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#00C853',
    position: 'relative',
    shadowColor: '#009624',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  rachaContent: {
    flex: 1,
    paddingRight: 10,
  },
  rachaTagBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  rachaTag: {
    color: '#FFD768',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  rachaDays: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  rachaSub: {
    color: '#DDF1ED',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  rachaCup: {
    width: 68,
    height: 68,
  },
  andineRibbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  andineRibbonText: {
    color: '#FFD768',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
  },

  /* Pestañas */
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#EAE3D6',
    borderRadius: 14,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7A6E65',
  },
  tabTextActive: {
    color: TEAL_DARK,
    fontWeight: '800',
  },

  /* Scroll y Contenedores */
  contentScroll: {
    flex: 1,
  },
  leaderboardContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7A6E65',
    fontWeight: '600',
  },

  /* Tarjetas Estilo Pergamino Limpio */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardLocked: {
    opacity: 0.65,
    backgroundColor: '#F5F0E8',
  },
  cardIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F7F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E7DFD1',
    position: 'relative',
  },
  cardIcon: {
    width: 44,
    height: 44,
  },
  cardIconLocked: {
    opacity: 0.55,
  },
  cardLockOverlay: {
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
    elevation: 2,
  },
  cardLockText: {
    fontSize: 10,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2C2520',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#7A6E65',
    lineHeight: 16,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#EAE3D6',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: TEAL,
    borderRadius: 4,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeUnlocked: {
    backgroundColor: '#E0F2F1',
  },
  badgeUnlockedText: {
    color: '#1E824C',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeProgress: {
    backgroundColor: '#FFF9E6',
  },
  badgeProgressText: {
    color: '#B7791F',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeLocked: {
    backgroundColor: '#EAE3D6',
  },
  badgeLockedText: {
    color: '#7A6E65',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Ranking Cards */
  rankCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rankCardPodium: {
    borderColor: '#FBD46D',
  },
  rankCardMe: {
    backgroundColor: '#E8F8F0',
    borderColor: '#00C853',
    borderWidth: 2,
  },
  rankBadgeCol: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 22,
  },
  rankNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAE3D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7A6E65',
  },
  rankAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDF1ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#BFE4DC',
  },
  rankAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: TEAL_DARK,
  },
  rankInfoCol: {
    flex: 1,
  },
  rankUsername: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  rankUsernameMe: {
    color: TEAL_DARK,
  },
  rankLeague: {
    fontSize: 11,
    color: '#7A6E65',
    marginTop: 2,
    fontWeight: '500',
  },
  rankXpCol: {
    alignItems: 'flex-end',
  },
  rankXpValue: {
    fontSize: 16,
    fontWeight: '900',
    color: GOLD,
  },
  rankXpLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A6E65',
  },
});
