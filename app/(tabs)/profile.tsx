import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { Badge, DailyQuest } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: 1,
    title: 'Gana 30 XP hoy',
    description: 'Completa lecciones para ganar experiencia',
    target_amount: 30,
    current_progress: 10,
    xp_reward: 10,
    gem_reward: 5,
    quest_type: 'xp_gain',
  },
  {
    id: 2,
    title: 'Completa 2 lecciones perfectas',
    description: 'Responde sin cometer errores',
    target_amount: 2,
    current_progress: 1,
    xp_reward: 15,
    gem_reward: 10,
    quest_type: 'perfect_lesson',
  },
];

const DEFAULT_BADGES: Badge[] = [
  {
    id: 1,
    title: 'Llama de Fuego',
    description: 'Mantén una racha de 3 días seguidos',
    icon_name: '🔥',
    requirement_type: 'streak_days',
    requirement_value: 3,
    unlocked: true,
  },
  {
    id: 2,
    title: 'Sabio del Achahala',
    description: 'Completa el módulo de Abecedario',
    icon_name: '🎓',
    requirement_type: 'completed_lessons',
    requirement_value: 5,
    unlocked: true,
  },
  {
    id: 3,
    title: 'Tesorero Inca',
    description: 'Acumula 100 gemas',
    icon_name: '💎',
    requirement_type: 'gems_earned',
    requirement_value: 100,
    unlocked: true,
  },
  {
    id: 4,
    title: 'Fuerza Incaica',
    description: 'Consigue 500 XP en total',
    icon_name: '⚡',
    requirement_type: 'total_xp',
    requirement_value: 500,
    unlocked: false,
  },
];

export default function ProfileScreen() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { streakDays, xp, gems } = useGame();
  const router = useRouter();

  const [quests, setQuests] = useState<DailyQuest[]>(DEFAULT_QUESTS);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfileData();
    }
  }, [user]);

  async function loadProfileData() {
    setLoading(true);
    const { data: qData } = await questService.fetchDailyQuests(user!.id);
    const { data: bData } = await questService.fetchBadges(user!.id);
    if (qData && qData.length > 0) setQuests(qData);
    if (bData && bData.length > 0) setBadges(bData);
    setLoading(false);
  }

  async function handleLogout() {
    await signOut();
    router.replace('/(auth)' as any);
  }

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  const username = profile?.username || user?.email?.split('@')[0] || 'Estudiante Quechua';
  const totalXp = profile?.total_xp || xp || 120;
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : 'septiembre de 2026';

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabecera del Estudiante (Hero Banner) */}
        <View style={styles.heroCard}>
          <View style={styles.avatarBorder}>
            <Image
              source={require('@/assets/images/yachi/yachi_avatar_circular.png')}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.userName}>{username}</Text>
          <Text style={styles.userHandle}>@{username.toLowerCase().replace(/\s+/g, '')}</Text>
          <Text style={styles.joinText}>🗓️ Se unió en {joinDate}</Text>
        </View>

        {/* Cuadrícula de Estadísticas (2x2) */}
        <Text style={styles.sectionHeader}>Estadísticas Gamificadas 📊</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Racha de días</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>{totalXp}</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💎</Text>
            <Text style={styles.statValue}>{gems}</Text>
            <Text style={styles.statLabel}>Gemas Saldo</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>Plata</Text>
            <Text style={styles.statLabel}>Liga Actual</Text>
          </View>
        </View>

        {/* Misiones Diarias (Daily Quests) */}
        <Text style={styles.sectionHeader}>Misiones Diarias 🎯</Text>
        <View style={styles.questsContainer}>
          {quests.map((q) => {
            const current = q.current_progress || 0;
            const progressPct = Math.min(100, Math.round((current / q.target_amount) * 100));

            return (
              <View key={q.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{q.title}</Text>
                  <Text style={styles.questReward}>
                    +⚡{q.xp_reward} +💎{q.gem_reward}
                  </Text>
                </View>
                <Text style={styles.questDesc}>{q.description}</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {current} / {q.target_amount} ({progressPct}%)
                </Text>
              </View>
            );
          })}
        </View>

        {/* Logros e Insignias (Badges) */}
        <Text style={styles.sectionHeader}>Logros Desbloqueados 🥇</Text>
        <View style={styles.badgesGrid}>
          {badges.map((b) => (
            <View key={b.id} style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}>
              <Text style={styles.badgeIcon}>{b.icon_name}</Text>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeDesc}>{b.description}</Text>
              {!b.unlocked && <Text style={styles.lockedTag}>🔒 BLOQUEADO</Text>}
            </View>
          ))}
        </View>

        {/* Accesos Rápidos & Cuenta */}
        <Text style={styles.sectionHeader}>Opciones de Cuenta ⚙️</Text>
        <TouchableOpacity
          style={styles.translatorBtn}
          onPress={() => router.push('/translator/index' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.translatorBtnText}>🎙️ Ir al Traductor de Voz Quechua</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    elevation: 3,
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#58CC02',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F1F8E9',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3C3C3C',
  },
  userHandle: {
    fontSize: 14,
    color: '#1CB0F6',
    fontWeight: '700',
    marginTop: 2,
  },
  joinText: {
    fontSize: 13,
    color: '#777777',
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3C3C3C',
  },
  statLabel: {
    fontSize: 12,
    color: '#777777',
    fontWeight: '700',
    marginTop: 2,
  },
  questsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  questCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3C3C3C',
  },
  questReward: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF9600',
  },
  questDesc: {
    fontSize: 13,
    color: '#777777',
    marginBottom: 10,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#58CC02',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#777777',
    marginTop: 4,
    textAlign: 'right',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  badgeLocked: {
    opacity: 0.5,
    backgroundColor: '#F5F5F5',
  },
  badgeIcon: {
    fontSize: 34,
    marginBottom: 6,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3C3C3C',
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    color: '#777777',
    textAlign: 'center',
    marginTop: 2,
  },
  lockedTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#999999',
    marginTop: 6,
  },
  translatorBtn: {
    backgroundColor: '#1CB0F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#1899D6',
  },
  translatorBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  logoutBtn: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#D32F2F',
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
