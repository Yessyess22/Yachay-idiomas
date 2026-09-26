import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
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
import { leaderboardService } from '@/src/services/leaderboardService';
import { DailyQuest, LeaderboardEntry } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { Card } from '@/components/yachay/card';
import { ProgressBar } from '@/components/yachay/progress-bar';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const TEAL_LIGHT = '#E8F8F0';
const GOLD = '#FFB300';
const GOLD_LIGHT = '#FFF8E1';
const GOLD_DARK = '#C67C00';
const PARCHMENT = '#F8F5EE';
const BORDER_COLOR = '#ECE5D8';
const GREEN = '#00C853';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';

type ProfileTab = 'expediente' | 'logros' | 'liga';

interface AchievementItem {
  id: string;
  title: string;
  desc: string;
  icon: any;
  status: 'unlocked' | 'progress' | 'locked';
  progress: number; // 0 - 100
  currentText: string;
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, firebase_uid: '1', username: 'Yachay Master 👑', weekly_xp: 450, league_tier: 'gold', avatar_url: null },
  { rank: 2, firebase_uid: '2', username: 'Kuntur Inca 🦅',    weekly_xp: 380, league_tier: 'silver', avatar_url: null },
  { rank: 3, firebase_uid: '3', username: 'Amaru Quechua 🐍', weekly_xp: 310, league_tier: 'silver', avatar_url: null },
  { rank: 4, firebase_uid: '4', username: 'Sumaq Learner 🌿', weekly_xp: 240, league_tier: 'bronze', avatar_url: null },
  { rank: 5, firebase_uid: '5', username: 'Inti Sol ☀️',      weekly_xp: 190, league_tier: 'bronze', avatar_url: null },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { streakDays, xp, gems, lives, equippedOutfit, addGems, addXp } = useGame();

  const [activeTab, setActiveTab] = useState<ProfileTab>('expediente');
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const userStreak = Math.max(1, streakDays ?? profile?.streak_count ?? 1);
  const userXp = xp ?? profile?.total_xp ?? 0;
  const userGems = gems ?? profile?.gems ?? 100;
  const userLevel = Math.max(1, Math.floor(userXp / 100) + 1);

  // Lista integral de Logros y Reliquias
  const achievements: AchievementItem[] = [
    {
      id: 'ach-1',
      title: 'Principiante Quechua',
      desc: 'Acumula tus primeros 50 XP en lecciones',
      icon: require('@/assets/images/logros/logro_principiante_chullo.png'),
      status: userXp >= 50 ? 'unlocked' : userXp > 0 ? 'progress' : 'locked',
      progress: Math.min(100, Math.round((userXp / 50) * 100)),
      currentText: `${Math.min(50, userXp)} / 50 XP`,
    },
    {
      id: 'ach-2',
      title: 'Hablante Activo',
      desc: 'Mantén una racha de 7 días activa',
      icon: require('@/assets/images/logros/logro_hablante_corona.png'),
      status: userStreak >= 7 ? 'unlocked' : userStreak > 1 ? 'progress' : 'locked',
      progress: Math.min(100, Math.round((userStreak / 7) * 100)),
      currentText: `${Math.min(7, userStreak)} / 7 días`,
    },
    {
      id: 'ach-3',
      title: 'Maestro del Sol',
      desc: 'Acumula 150 XP de maestría en lecciones',
      icon: require('@/assets/images/logros/logro_maestro_sol.png'),
      status: userXp >= 150 ? 'unlocked' : userXp > 50 ? 'progress' : 'locked',
      progress: Math.min(100, Math.round((userXp / 150) * 100)),
      currentText: `${Math.min(150, userXp)} / 150 XP`,
    },
    {
      id: 'ach-4',
      title: 'Tesorero Inca',
      desc: 'Consigue 250 gemas y monedas sagradas',
      icon: require('@/assets/images/logros/moneda_yachay_coin.png'),
      status: userGems >= 250 ? 'unlocked' : userGems > 50 ? 'progress' : 'locked',
      progress: Math.min(100, Math.round((userGems / 250) * 100)),
      currentText: `${Math.min(250, userGems)} / 250 gemas`,
    },
    {
      id: 'ach-5',
      title: 'Coleccionista Andino',
      desc: 'Equipa una reliquia tradicional en la tienda',
      icon: require('@/assets/images/logros/item_chullo_coleccionable.png'),
      status: equippedOutfit === 'chullo_item' ? 'unlocked' : 'locked',
      progress: equippedOutfit === 'chullo_item' ? 100 : 0,
      currentText: equippedOutfit === 'chullo_item' ? 'Equipado' : 'Sin equipar',
    },
    {
      id: 'ach-6',
      title: 'Explorador del Tawantinsuyu',
      desc: 'Alcanza el Nivel 2 en la carrera de aprendizaje',
      icon: require('@/assets/images/categorias/cat_vocabulario.png'),
      status: userLevel >= 2 ? 'unlocked' : 'progress',
      progress: Math.min(100, Math.round((userLevel / 2) * 100)),
      currentText: `Nivel ${userLevel} de 2`,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.status === 'unlocked').length;

  const loadLeaderboardData = useCallback(async () => {
    setLoadingLeaderboard(true);
    const uid = user?.uid || (user as any)?.id;
    const { data } = await leaderboardService.fetchWeeklyLeaderboard(uid, userXp);
    if (data && data.length > 0) {
      setLeaderboard(data);
    }
    setLoadingLeaderboard(false);
  }, [user, userXp]);

  const loadQuestsData = useCallback(async () => {
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      const { data } = await questService.fetchDailyQuests(uid);
      setQuests(data || []);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    const uid = user?.uid || (user as any)?.id;
    if (uid) {
      questService
        .fetchDailyQuests(uid)
        .then(({ data }) => {
          if (isMounted && data) setQuests(data);
        })
        .catch(() => {});
    }

    leaderboardService
      .fetchWeeklyLeaderboard(uid, userXp)
      .then(({ data }) => {
        if (isMounted && data && data.length > 0) {
          setLeaderboard(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user, userXp, activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshProfile(),
      loadQuestsData(),
      loadLeaderboardData(),
    ]);
    setRefreshing(false);
  };

  const handleClaimQuest = async (q: DailyQuest) => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    const res = await questService.claimQuestReward(uid, q.id);
    if (res.success) {
      if (res.gemReward > 0) addGems(res.gemReward);
      if (res.xpReward > 0) {
        addXp(res.xpReward);
        leaderboardService.recordWeeklyXp(uid, res.xpReward).catch(() => {});
      }
      Alert.alert('¡Recompensa Reclamada! 🎉', `+${res.xpReward} XP y +${res.gemReward} Gemas 💎`);
      loadQuestsData();
      loadLeaderboardData();
    }
  };

  async function handleSignOut() {
    const performSignOut = async () => {
      try {
        setSigningOut(true);
        await signOut();
        router.replace('/(auth)' as any);
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
        Alert.alert('Error', 'No se pudo cerrar la sesión.');
      } finally {
        setSigningOut(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('¿Estás seguro de que deseas salir de Yachay Simi?')
          : true;
      if (confirmed) {
        await performSignOut();
      }
      return;
    }

    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir de Yachay Simi?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: performSignOut,
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[TEAL]}
            tintColor={TEAL}
          />
        }
      >
        {/* Tarjeta Superior de Identidad del Alumno */}
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

          {/* Estadísticas en 4 Cajas Andinas */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{userStreak}</Text>
              <Text style={styles.statLabel}>Racha</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statEmoji}>⚡</Text>
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

          {/* Ribete textil decorativo */}
          <View style={styles.cardRibbon}>
            <Text style={styles.cardRibbonText}>❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖ ◆ ❖</Text>
          </View>
        </Card>

        {/* Selector de Pestañas Internas del Perfil */}
        <View style={styles.tabSelectorRow}>
          <TouchableOpacity
            style={[styles.tabSelectorBtn, activeTab === 'expediente' && styles.tabSelectorBtnActive]}
            onPress={() => setActiveTab('expediente')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSelectorText, activeTab === 'expediente' && styles.tabSelectorTextActive]}>
              👤 Expediente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSelectorBtn, activeTab === 'logros' && styles.tabSelectorBtnActive]}
            onPress={() => setActiveTab('logros')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSelectorText, activeTab === 'logros' && styles.tabSelectorTextActive]}>
              🏆 Logros ({unlockedCount}/{achievements.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabSelectorBtn, activeTab === 'liga' && styles.tabSelectorBtnActive]}
            onPress={() => setActiveTab('liga')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabSelectorText, activeTab === 'liga' && styles.tabSelectorTextActive]}>
              👑 Liga Andina
            </Text>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════════
            PESTAÑA 1: EXPEDIENTE DEL ALUMNO (Misiones y Resumen)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'expediente' && (
          <View>
            {/* Banner resumen de Logros */}
            <TouchableOpacity
              style={styles.achievementsSummaryCard}
              onPress={() => setActiveTab('logros')}
              activeOpacity={0.85}
            >
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryTag}>LOGROS Y MEDALLAS</Text>
                <Text style={styles.summaryTitle}>
                  {unlockedCount} de {achievements.length} Logros Desbloqueados
                </Text>
                <ProgressBar
                  progress={(unlockedCount / achievements.length) * 100}
                  height={8}
                  color={GOLD}
                  trackColor="#EAE3D6"
                  style={styles.summaryProgressBar}
                />
              </View>
              <View style={styles.summaryRightBtn}>
                <Text style={styles.summaryRightBtnText}>Ver Todos →</Text>
              </View>
            </TouchableOpacity>

            {/* Misiones Diarias de Hoy */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 Misiones de Hoy</Text>
            </View>

            <Card padding={14} style={styles.cardWrapper}>
              {quests.length > 0 ? (
                quests.map((q) => {
                  const current = q.current_progress || 0;
                  const target = q.target_amount || 1;
                  const progressPct = Math.min(100, Math.round((current / target) * 100));
                  return (
                    <View key={q.id} style={styles.questRow}>
                      <Text style={styles.questEmoji}>⚔️</Text>
                      <View style={styles.questInfo}>
                        <Text style={styles.questTitle}>{q.title}</Text>
                        <ProgressBar
                          progress={progressPct}
                          height={6}
                          color={TEAL}
                          trackColor="#EAE3D6"
                          style={styles.progressBarBg}
                        />
                        <Text style={styles.questProgressText}>
                          {current} / {target} {progressPct >= 100 ? '• ¡Listo!' : ''}
                        </Text>
                      </View>
                      {progressPct >= 100 ? (
                        <TouchableOpacity
                          style={[styles.questRewardBadge, { backgroundColor: GREEN }]}
                          onPress={() => handleClaimQuest(q)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.questRewardClaimText}>Reclamar</Text>
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
                  <Text style={styles.emptyQuestSub}>
                    Vuelve mañana para nuevos desafíos en lengua Quechua.
                  </Text>
                </View>
              )}
            </Card>

            {/* Acceso Rápido a Tienda de Yachi */}
            <TouchableOpacity
              style={styles.shopBannerBtn}
              onPress={() => router.push('/(tabs)/shop' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.shopBannerEmoji}>🛍️</Text>
              <View style={styles.shopBannerInfo}>
                <Text style={styles.shopBannerTitle}>Tienda de Yachi</Text>
                <Text style={styles.shopBannerSub}>Canjea gemas por vidas, pociones y reliquias andinas.</Text>
              </View>
              <Text style={styles.shopBannerArrow}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════
            PESTAÑA 2: LOGROS & MEDALLAS (Integración de Logros)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'logros' && (
          <View>
            <View style={styles.achievementsHeaderBox}>
              <Text style={styles.sectionCategoryTag}>RECOMPENSAS Y MEDALLAS</Text>
              <Text style={styles.sectionMainTitle}>Logros del Estudiante</Text>
              <Text style={styles.achievementsHeaderSub}>
                Completa desafíos, mantén tu racha y acumula sabiduría para desbloquear reliquias sagradas.
              </Text>
            </View>

            <View style={styles.achievementsList}>
              {achievements.map((ach) => (
                <View
                  key={ach.id}
                  style={[
                    styles.achievementRowCard,
                    ach.status === 'locked' && styles.achievementRowCardLocked,
                  ]}
                >
                  <View style={styles.achIconWrapper}>
                    <Image
                      source={ach.icon}
                      style={[
                        styles.achIconImage,
                        ach.status === 'locked' && styles.achIconImageLocked,
                      ]}
                      resizeMode="contain"
                    />
                    {ach.status === 'locked' && (
                      <View style={styles.achLockOverlay}>
                        <Text style={styles.achLockIcon}>🔒</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.achContent}>
                    <View style={styles.achTitleRow}>
                      <Text style={styles.achTitleText}>{ach.title}</Text>
                      {ach.status === 'unlocked' && (
                        <View style={styles.badgeUnlockedPill}>
                          <Text style={styles.badgeUnlockedText}>✓ Obtenido</Text>
                        </View>
                      )}
                      {ach.status === 'progress' && (
                        <View style={styles.badgeProgressPill}>
                          <Text style={styles.badgeProgressText}>{ach.progress}%</Text>
                        </View>
                      )}
                      {ach.status === 'locked' && (
                        <View style={styles.badgeLockedPill}>
                          <Text style={styles.badgeLockedText}>Bloqueado</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.achDescText}>{ach.desc}</Text>

                    {/* Barra de progreso */}
                    <View style={styles.achProgressWrap}>
                      <ProgressBar
                        progress={ach.progress}
                        height={6}
                        color={ach.status === 'unlocked' ? GREEN : GOLD}
                        trackColor="#EAE3D6"
                        style={styles.progressBarBg}
                      />
                      <Text style={styles.achProgressLabel}>{ach.currentText}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════
            PESTAÑA 3: LIGA ANDINA (Ranking y Clasificación)
            ══════════════════════════════════════════════════════════ */}
        {activeTab === 'liga' && (
          <View>
            {/* Banner de la Liga */}
            <View style={styles.leagueBanner}>
              <Text style={styles.leagueBannerEmoji}>👑</Text>
              <View style={styles.leagueBannerInfo}>
                <View style={styles.bannerTagRow}>
                  <Text style={styles.leagueBannerTag}>COMPETICIÓN SEMANAL</Text>
                  <View style={styles.syncStatusBadge}>
                    <Text style={styles.syncStatusText}>🟢 Sincronizado en tiempo real</Text>
                  </View>
                </View>
                <Text style={styles.leagueBannerTitle}>Liga Andina • Tawantinsuyu</Text>
                <Text style={styles.leagueBannerDesc}>
                  Los estudiantes con mayor XP ascienden de división y reciben gemas sagradas cada semana.
                </Text>
              </View>
            </View>

            {/* Podio de Honor (Top 3) */}
            <View style={styles.podiumContainer}>
              {/* 2º Lugar (Plata) */}
              <View style={[styles.podiumColumn, styles.podiumSecond]}>
                <Text style={styles.podiumMedal}>🥈</Text>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[1]?.username || 'Por clasificar'}
                </Text>
                <Text style={styles.podiumXp}>{leaderboard[1]?.weekly_xp ?? 0} XP</Text>
                <View style={[styles.podiumBlock, { height: 60, backgroundColor: '#D1D5DB' }]}>
                  <Text style={styles.podiumRankNum}>#2</Text>
                </View>
              </View>

              {/* 1º Lugar (Oro) */}
              <View style={[styles.podiumColumn, styles.podiumFirst]}>
                <Text style={styles.podiumMedal}>🥇</Text>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[0]?.username || 'Por clasificar'}
                </Text>
                <Text style={styles.podiumXp}>{leaderboard[0]?.weekly_xp ?? 0} XP</Text>
                <View style={[styles.podiumBlock, { height: 85, backgroundColor: GOLD }]}>
                  <Text style={[styles.podiumRankNum, { color: '#FFFFFF' }]}>#1</Text>
                </View>
              </View>

              {/* 3º Lugar (Bronce) */}
              <View style={[styles.podiumColumn, styles.podiumThird]}>
                <Text style={styles.podiumMedal}>🥉</Text>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {leaderboard[2]?.username || 'Por clasificar'}
                </Text>
                <Text style={styles.podiumXp}>{leaderboard[2]?.weekly_xp ?? 0} XP</Text>
                <View style={[styles.podiumBlock, { height: 45, backgroundColor: '#FDBA74' }]}>
                  <Text style={styles.podiumRankNum}>#3</Text>
                </View>
              </View>
            </View>

            {/* Lista del Ranking Semanal */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📊 Tabla Semanal de Posiciones</Text>
            </View>

            {loadingLeaderboard && leaderboard.length === 0 ? (
              <View style={styles.loadingLeaderboardWrap}>
                <ActivityIndicator size="small" color={TEAL} />
                <Text style={styles.loadingLeaderboardText}>
                  Sincronizando clasificación con la base de datos...
                </Text>
              </View>
            ) : (
              <Card padding={10} style={styles.cardWrapper}>
                {leaderboard.map((entry, idx) => {
                  const isCurrentUser =
                    entry.firebase_uid === user?.uid ||
                    (user as any)?.id === entry.firebase_uid ||
                    entry.username === username;

                  return (
                    <View
                      key={entry.firebase_uid || idx}
                      style={[
                        styles.leaderboardRow,
                        isCurrentUser && styles.leaderboardRowCurrent,
                      ]}
                    >
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankBadgeText}>#{idx + 1}</Text>
                      </View>
                      <View style={styles.leaderboardUserInfo}>
                        <Text
                          style={[
                            styles.leaderboardUsername,
                            isCurrentUser && styles.leaderboardUsernameCurrent,
                          ]}
                        >
                          {entry.username} {isCurrentUser ? '🌟 (Tú)' : ''}
                        </Text>
                        <Text style={styles.leaderboardTier}>
                          División {entry.league_tier ? entry.league_tier.toUpperCase() : 'ORO'}
                        </Text>
                      </View>
                      <Text style={styles.leaderboardXpText}>{entry.weekly_xp ?? 0} XP</Text>
                    </View>
                  );
                })}
              </Card>
            )}
          </View>
        )}

        {/* Botón de Créditos y Acerca de Yachay */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.aboutAppBtn}
            onPress={() => router.push('/modal' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.aboutAppIcon}>🏛️</Text>
            <View style={styles.aboutAppInfo}>
              <Text style={styles.aboutAppTitle}>Acerca de Yachay & Créditos</Text>
              <Text style={styles.aboutAppSub}>Desarrolladores · UPDS · Misión Cultural</Text>
            </View>
            <Text style={styles.aboutAppArrow}>➔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            disabled={signingOut}
            activeOpacity={0.85}
          >
            {signingOut ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signOutText}>🚪 Cerrar Sesión</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
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
    marginBottom: 14,
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
    backgroundColor: TEAL_LIGHT,
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
    color: TEXT_DARK,
  },
  userEmail: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  rolePill: {
    backgroundColor: '#E0F2F1',
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
    borderColor: BORDER_COLOR,
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
    color: TEXT_DARK,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
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

  /* Selector de Pestañas Internas */
  tabSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    marginBottom: 16,
    gap: 4,
  },
  tabSelectorBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabSelectorBtnActive: {
    backgroundColor: TEAL,
  },
  tabSelectorText: {
    fontSize: 12,
    fontWeight: '800',
    color: TEXT_MUTED,
  },
  tabSelectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  /* Resumen de Logros en Expediente */
  achievementsSummaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
    marginRight: 10,
  },
  summaryTag: {
    fontSize: 10,
    fontWeight: '900',
    color: GOLD_DARK,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 6,
  },
  summaryProgressBar: {
    width: '100%',
  },
  summaryRightBtn: {
    backgroundColor: GOLD_LIGHT,
    borderColor: GOLD,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  summaryRightBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: GOLD_DARK,
  },

  /* Misiones */
  sectionHeader: {
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  cardWrapper: {
    marginBottom: 16,
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
    color: TEXT_DARK,
    marginBottom: 4,
  },
  progressBarBg: {
    marginVertical: 2,
  },
  questProgressText: {
    fontSize: 10,
    color: TEXT_MUTED,
    fontWeight: '600',
  },
  questRewardBadge: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questRewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: TEAL_DARK,
  },
  questRewardClaimText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
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
    color: TEXT_DARK,
    marginBottom: 2,
  },
  emptyQuestSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
  },

  /* Botón de Tienda */
  shopBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    marginBottom: 16,
  },
  shopBannerEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  shopBannerInfo: {
    flex: 1,
  },
  shopBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  shopBannerSub: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  shopBannerArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: TEAL,
  },

  /* Botón de Salir (Rojo Destacado) */
  signOutBtn: {
    backgroundColor: '#FF3366',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#BE123C',
    shadowColor: '#FF3366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  /* Cabecera de Pestaña de Logros */
  achievementsHeaderBox: {
    marginBottom: 14,
  },
  sectionCategoryTag: {
    fontSize: 10,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionMainTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  achievementsHeaderSub: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 17,
  },
  achievementsList: {
    gap: 12,
  },
  achievementRowCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  achievementRowCardLocked: {
    opacity: 0.65,
    backgroundColor: '#F9FAFB',
  },
  achIconWrapper: {
    position: 'relative',
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FAF5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  achIconImage: {
    width: 42,
    height: 42,
  },
  achIconImageLocked: {
    tintColor: '#9CA3AF',
  },
  achLockOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  achLockIcon: {
    fontSize: 10,
  },
  achContent: {
    flex: 1,
  },
  achTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  achTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  achDescText: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  achProgressWrap: {
    gap: 3,
  },
  achProgressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  badgeUnlockedPill: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeUnlockedText: {
    fontSize: 10,
    fontWeight: '800',
    color: GREEN,
  },
  badgeProgressPill: {
    backgroundColor: GOLD_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeProgressText: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD_DARK,
  },
  badgeLockedPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeLockedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  /* Pestaña Liga Andina */
  leagueBanner: {
    flexDirection: 'row',
    backgroundColor: TEAL_DARK,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  leagueBannerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  leagueBannerInfo: {
    flex: 1,
  },
  leagueBannerTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  leagueBannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  leagueBannerDesc: {
    fontSize: 11,
    color: '#D1FAE5',
    lineHeight: 15,
  },

  /* Podio */
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    gap: 12,
  },
  podiumColumn: {
    flex: 1,
    alignItems: 'center',
  },
  podiumFirst: {
    zIndex: 2,
  },
  podiumSecond: {
    zIndex: 1,
  },
  podiumThird: {
    zIndex: 1,
  },
  podiumMedal: {
    fontSize: 26,
    marginBottom: 4,
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '800',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 2,
  },
  podiumXp: {
    fontSize: 10,
    fontWeight: '900',
    color: GOLD_DARK,
    marginBottom: 6,
  },
  podiumBlock: {
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRankNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#374151',
  },

  /* Filas de Leaderboard */
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  leaderboardRowCurrent: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 10,
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  leaderboardUserInfo: {
    flex: 1,
  },
  leaderboardUsername: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  leaderboardUsernameCurrent: {
    color: TEAL_DARK,
    fontWeight: '900',
  },
  leaderboardTier: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  leaderboardXpText: {
    fontSize: 13,
    fontWeight: '900',
    color: GOLD_DARK,
  },
  bannerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  syncStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  syncStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D1FAE5',
  },
  loadingLeaderboardWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingLeaderboardText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MUTED,
  },

  /* Footer Actions */
  footerActions: {
    marginTop: 20,
    gap: 12,
  },
  aboutAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  aboutAppIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  aboutAppInfo: {
    flex: 1,
  },
  aboutAppTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  aboutAppSub: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginTop: 1,
  },
  aboutAppArrow: {
    fontSize: 14,
    fontWeight: '900',
    color: TEAL,
    marginLeft: 8,
  },
});
