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

const TEAL = '#1B8B8C';
const GOLD = '#E5A00D';

/* ─── Logros estáticos ─── */
interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: any;
  status: 'unlocked' | 'progress' | 'locked';
  progress?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 1, title: 'Principiante Quechua',
    description: 'Completaste las primeras 5 lecciones',
    icon: require('@/assets/images/logros/logro_principiante_chullo.png'),
    status: 'unlocked',
  },
  {
    id: 2, title: 'Hablante Activo',
    description: 'Mantén una racha de 10 días o más',
    icon: require('@/assets/images/logros/logro_hablante_corona.png'),
    status: 'unlocked',
  },
  {
    id: 3, title: 'Maestro Yachay',
    description: 'Domina 100 palabras de vocabulario',
    icon: require('@/assets/images/logros/logro_maestro_sol.png'),
    status: 'progress',
    progress: 65,
  },
  {
    id: 4, title: 'Gran Ahorrador',
    description: 'Acumula 1,000 Yachay Coins en tu tesoro',
    icon: require('@/assets/images/logros/moneda_yachay_coin.png'),
    status: 'unlocked',
  },
  {
    id: 5, title: 'Chullo Coleccionable',
    description: 'Completa todos los niveles del Abecedario',
    icon: require('@/assets/images/logros/item_chullo_coleccionable.png'),
    status: 'locked',
  },
];

type Tab = 'achievements' | 'leaderboard';

function StatusBadge({ status, progress }: { status: Achievement['status']; progress?: number }) {
  if (status === 'unlocked') return <Text style={styles.statusUnlocked}>✓ Desbloqueado</Text>;
  if (status === 'progress') return <Text style={styles.statusProgress}>En progreso ({progress}%)</Text>;
  return <Text style={styles.statusLocked}>🔒 Bloqueado</Text>;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Text style={styles.rankEmoji}>🥇</Text>;
  if (rank === 2) return <Text style={styles.rankEmoji}>🥈</Text>;
  if (rank === 3) return <Text style={styles.rankEmoji}>🥉</Text>;
  return <Text style={styles.rankNumber}>#{rank}</Text>;
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, firebase_uid: '1', username: 'Yachay Master 👑', weekly_xp: 450, league_tier: 'gold', avatar_url: null },
  { rank: 2, firebase_uid: '2', username: 'Kuntur Inca 🦅',    weekly_xp: 380, league_tier: 'silver', avatar_url: null },
  { rank: 3, firebase_uid: '3', username: 'Amaru Quechua 🐍', weekly_xp: 310, league_tier: 'silver', avatar_url: null },
  { rank: 4, firebase_uid: '4', username: 'Sumaq Learner 🌿', weekly_xp: 240, league_tier: 'bronze', avatar_url: null },
  { rank: 5, firebase_uid: '5', username: 'Inti Sol ☀️',      weekly_xp: 190, league_tier: 'bronze', avatar_url: null },
];

export default function LogrosScreen() {
  const { streakDays } = useGame();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('achievements');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    const { data } = await leaderboardService.fetchWeeklyLeaderboard();
    if (data && data.length > 0) setEntries(data);
  }

  return (
    <View style={styles.container}>
      <YachayTopBar />

      {/* Banner racha imparable */}
      <View style={styles.rachaBanner}>
        <View>
          <Text style={styles.rachaTag}>¡RACHA IMPARABLE!</Text>
          <Text style={styles.rachaDays}>{streakDays} Días Consecutivos</Text>
        </View>
        <Image
          source={require('@/assets/images/logros/logro_hablante_corona.png')}
          style={styles.rachaCup}
        />
      </View>
      <View style={styles.andineBorder} />

      {/* Pestañas internas */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'achievements' && styles.tabBtnActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
            🏅 Mis Logros
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'leaderboard' && styles.tabBtnActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            🏆 Ranking
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── LOGROS ── */}
      {activeTab === 'achievements' && (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {ACHIEVEMENTS.map((ach) => (
            <View key={ach.id} style={[styles.achCard, ach.status === 'locked' && styles.achCardLocked]}>
              <Image
                source={ach.icon}
                style={[styles.achIcon, ach.status === 'locked' && { opacity: 0.35 }]}
              />
              <View style={styles.achBody}>
                <Text style={[styles.achTitle, ach.status === 'locked' && styles.achTitleLocked]}>
                  {ach.title}
                </Text>
                <Text style={styles.achDesc}>{ach.description}</Text>
                <StatusBadge status={ach.status} progress={ach.progress} />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── RANKING ── */}
      {activeTab === 'leaderboard' && (
        loading ? (
          <ActivityIndicator size="large" color={TEAL} style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.firebase_uid}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.rankHeader}>
                <Text style={styles.rankHeaderText}>Liga Plata — Semana actual</Text>
                <Text style={styles.rankHeaderSub}>Los 3 primeros ascienden a Liga Oro este domingo.</Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const rank = index + 1;
              const isMe = item.firebase_uid === user?.id;
              return (
                <View style={[styles.rankRow, isMe && styles.myRow]}>
                  <View style={styles.rankBadgeWrap}>
                    <RankBadge rank={rank} />
                  </View>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>
                      {item.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={[styles.rankUsername, isMe && styles.myUsername]}>
                      {item.username}{isMe ? ' (Tú)' : ''}
                    </Text>
                  </View>
                  <Text style={styles.xpText}>⚡ {item.weekly_xp} XP</Text>
                </View>
              );
            }}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  loadingIndicator: { marginTop: 48 },

  rachaBanner: {
    backgroundColor: TEAL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rachaTag: { color: 'rgba(255,255,255,0.82)', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 3 },
  rachaDays: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  rachaCup: { width: 58, height: 58, resizeMode: 'contain', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 4 },
  andineBorder: { height: 7, backgroundColor: '#D4A96A', opacity: 0.5 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
    gap: 8,
  },
  tabBtn: {
    flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 12,
    backgroundColor: '#F2EDE6',
  },
  tabBtnActive: { backgroundColor: TEAL },
  tabText: { fontSize: 13, fontWeight: '800', color: '#7A6A5A' },
  tabTextActive: { color: '#FFFFFF' },

  listContent: { padding: 16, paddingBottom: 48 },

  /* Logros */
  achCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#ECE6DE',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  achCardLocked: { opacity: 0.55, backgroundColor: '#F5F0E8' },
  achIcon: { width: 58, height: 58, resizeMode: 'contain', marginRight: 14 },
  achBody: { flex: 1 },
  achTitle: { fontSize: 15, fontWeight: '900', color: '#2A1A0A', marginBottom: 2 },
  achTitleLocked: { color: '#8A7A6A' },
  achDesc: { fontSize: 13, color: '#7A6A5A', marginBottom: 5 },
  statusUnlocked: { fontSize: 13, fontWeight: '800', color: TEAL },
  statusProgress: { fontSize: 13, fontWeight: '800', color: GOLD },
  statusLocked: { fontSize: 13, fontWeight: '700', color: '#AAAAAA' },

  /* Ranking */
  rankHeader: { marginBottom: 14 },
  rankHeaderText: { fontSize: 18, fontWeight: '900', color: '#2A1A0A' },
  rankHeaderSub: { fontSize: 13, color: '#8A7A6A', marginTop: 2 },
  rankRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingVertical: 13, paddingHorizontal: 14,
    borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#ECE6DE',
  },
  myRow: { borderColor: TEAL, backgroundColor: '#E4F4F4', borderWidth: 2 },
  rankBadgeWrap: { width: 36, alignItems: 'center' },
  rankEmoji: { fontSize: 22 },
  rankNumber: { fontSize: 16, fontWeight: '800', color: '#7A6A5A' },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center', marginHorizontal: 12,
  },
  avatarInitial: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  rankInfo: { flex: 1 },
  rankUsername: { fontSize: 16, fontWeight: '700', color: '#2A1A0A' },
  myUsername: { color: TEAL, fontWeight: '900' },
  xpText: { fontSize: 15, fontWeight: '800', color: GOLD },
});
