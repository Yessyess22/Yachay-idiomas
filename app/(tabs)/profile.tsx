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

const TEAL = '#1B8B8C';
const GOLD = '#E5A00D';

/* ─── Defaults ─── */
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
  { id: 1, title: 'Llama de Fuego',     description: 'Racha de 3 días',        icon_name: '🔥', requirement_type: 'streak_days',       requirement_value: 3,   unlocked: true },
  { id: 2, title: 'Sabio del Achahala', description: 'Completa Abecedario',     icon_name: '🎓', requirement_type: 'completed_lessons', requirement_value: 5,   unlocked: true },
  { id: 3, title: 'Tesorero Inca',      description: 'Acumula 100 gemas',       icon_name: '💎', requirement_type: 'gems_earned',       requirement_value: 100, unlocked: true },
  { id: 4, title: 'Fuerza Incaica',     description: 'Consigue 500 XP',         icon_name: '⚡', requirement_type: 'total_xp',          requirement_value: 500, unlocked: false },
];

/* Mapea icon_name (emoji o nombre) a imagen del kit si existe */
const KIT_BADGE_IMGS: Record<string, any> = {
  principiante: require('@/assets/images/logros/logro_principiante_chullo.png'),
  hablante:     require('@/assets/images/logros/logro_hablante_corona.png'),
  maestro:      require('@/assets/images/logros/logro_maestro_sol.png'),
};

function getBadgeImg(title: string) {
  const key = title.toLowerCase();
  if (key.includes('principiante')) return KIT_BADGE_IMGS.principiante;
  if (key.includes('hablante'))     return KIT_BADGE_IMGS.hablante;
  if (key.includes('maestro'))      return KIT_BADGE_IMGS.maestro;
  return null;
}

export default function ProfileScreen() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { streakDays, xp, gems, lives } = useGame();
  const router = useRouter();

  const [quests, setQuests] = useState<DailyQuest[]>(DEFAULT_QUESTS);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) loadProfileData();
  }, [user]);

  async function loadProfileData() {
    const { data: qData } = await questService.fetchDailyQuests(user!.uid);
    const { data: bData } = await questService.fetchBadges(user!.uid);
    if (qData && qData.length > 0) setQuests(qData);
    if (bData && bData.length > 0) setBadges(bData);
  }

  async function handleLogout() {
    await signOut();
    router.replace('/(auth)' as any);
  }

  if (authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={TEAL} />
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero: avatar + identidad */}
        <View style={styles.heroBg}>
          <View style={styles.avatarBorder}>
            <Image
              source={require('@/assets/images/mascota_principal_saludo.png')}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.userName}>{username}</Text>
          <Text style={styles.userHandle}>@{username.toLowerCase().replace(/\s+/g, '')}</Text>
          <Text style={styles.joinText}>📅 Miembro desde {joinDate}</Text>
        </View>

        {/* Estadísticas en fila */}
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statVal}>{streakDays}</Text>
            <Text style={styles.statLbl}>Racha</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statVal}>{totalXp}</Text>
            <Text style={styles.statLbl}>XP Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statEmoji}>💎</Text>
            <Text style={styles.statVal}>{gems}</Text>
            <Text style={styles.statLbl}>Gemas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statVal}>{lives}</Text>
            <Text style={styles.statLbl}>Vidas</Text>
          </View>
        </View>

        {/* Misiones Diarias */}
        <Text style={styles.sectionHeader}>Misiones del Día 🎯</Text>
        {loading ? (
          <ActivityIndicator color={TEAL} style={styles.loadingIndicator} />
        ) : (
          <View style={styles.questsWrap}>
            {quests.map((q) => {
              const cur = q.current_progress || 0;
              const pct = Math.min(100, Math.round((cur / q.target_amount) * 100));
              return (
                <View key={q.id} style={styles.questCard}>
                  <View style={styles.questTop}>
                    <Text style={styles.questTitle}>{q.title}</Text>
                    <Text style={styles.questReward}>⚡{q.xp_reward} 💎{q.gem_reward}</Text>
                  </View>
                  <Text style={styles.questDesc}>{q.description}</Text>
                  <View style={styles.progBg}>
                    <View style={[styles.progFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.progLabel}>{cur} / {q.target_amount}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Logros / Badges (fetchBadges restaurado) */}
        <Text style={styles.sectionHeader}>Logros Desbloqueados 🥇</Text>
        <View style={styles.badgesGrid}>
          {badges.map((b) => {
            const kitImg = getBadgeImg(b.title);
            return (
              <View key={b.id} style={[styles.badgeCard, !b.unlocked && styles.badgeLocked]}>
                {kitImg ? (
                  <Image source={kitImg} style={[styles.badgeImg, !b.unlocked && { opacity: 0.3 }]} />
                ) : (
                  <Text style={styles.badgeEmoji}>{b.icon_name}</Text>
                )}
                <Text style={[styles.badgeTitle, !b.unlocked && styles.badgeTitleLocked]}>
                  {b.title}
                </Text>
                <Text style={styles.badgeDesc}>{b.description}</Text>
                {!b.unlocked && <Text style={styles.lockedTag}>🔒 BLOQUEADO</Text>}
              </View>
            );
          })}
        </View>

        {/* Opciones de cuenta */}
        <Text style={styles.sectionHeader}>Cuenta ⚙️</Text>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push('/translator/index' as any)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🎙️</Text>
          <Text style={styles.actionText}>Traductor de Voz Quechua</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  loadingIndicator: { marginBottom: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 48 },

  /* Hero */
  heroBg: {
    backgroundColor: TEAL,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  avatarBorder: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, borderColor: '#FFFFFF',
    backgroundColor: '#D4EAE9',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12, overflow: 'hidden',
  },
  avatarImage: { width: 100, height: 100, resizeMode: 'cover' },
  userName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', marginBottom: 2 },
  userHandle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 6 },
  joinText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE6DE',
    marginBottom: 20,
  },
  statCell: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statDivider: { width: 1, backgroundColor: '#ECE6DE', marginVertical: 10 },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statVal: { fontSize: 19, fontWeight: '900', color: '#2A1A0A', lineHeight: 21 },
  statLbl: { fontSize: 11, color: '#8A7A6A', fontWeight: '700', marginTop: 2 },

  /* Section headers */
  sectionHeader: {
    fontSize: 18, fontWeight: '800', color: '#2A1A0A',
    marginHorizontal: 16, marginBottom: 12,
  },

  /* Quests */
  questsWrap: { paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  questCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#ECE6DE', elevation: 1,
  },
  questTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  questTitle: { fontSize: 15, fontWeight: '800', color: '#2A1A0A', flex: 1, paddingRight: 8 },
  questReward: { fontSize: 13, fontWeight: '800', color: GOLD },
  questDesc: { fontSize: 13, color: '#7A6A5A', marginBottom: 10 },
  progBg: { height: 10, backgroundColor: '#EDE8E0', borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  progFill: { height: '100%', backgroundColor: TEAL, borderRadius: 5 },
  progLabel: { fontSize: 11, fontWeight: '700', color: '#8A7A6A', textAlign: 'right' },

  /* Badges */
  badgesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12, marginBottom: 24,
  },
  badgeCard: {
    width: '48%', backgroundColor: '#FFFFFF',
    padding: 14, borderRadius: 18,
    borderWidth: 1, borderColor: '#ECE6DE', alignItems: 'center', elevation: 1,
  },
  badgeLocked: { opacity: 0.55, backgroundColor: '#F5F0E8' },
  badgeImg: { width: 56, height: 56, resizeMode: 'contain', marginBottom: 6 },
  badgeEmoji: { fontSize: 36, marginBottom: 6 },
  badgeTitle: { fontSize: 13, fontWeight: '800', color: '#2A1A0A', textAlign: 'center' },
  badgeTitleLocked: { color: '#8A7A6A' },
  badgeDesc: { fontSize: 11, color: '#7A6A5A', textAlign: 'center', marginTop: 2 },
  lockedTag: { fontSize: 10, fontWeight: '900', color: '#9B8B7A', marginTop: 6 },

  /* Actions */
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: TEAL,
    marginHorizontal: 16, marginBottom: 12,
    paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 16, borderBottomWidth: 4, borderBottomColor: '#136566', elevation: 2,
  },
  actionIcon: { fontSize: 22, marginRight: 12 },
  actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  logoutBtn: {
    marginHorizontal: 16,
    backgroundColor: '#FF4B4B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#C0392B',
  },
  logoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
