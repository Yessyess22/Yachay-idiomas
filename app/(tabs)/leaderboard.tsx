import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { leaderboardService } from '@/src/services/leaderboardService';
import { LeaderboardEntry } from '@/src/types';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    const { data } = await leaderboardService.fetchWeeklyLeaderboard();
    if (data) {
      setEntries(data);
    }
    setLoading(false);
  }

  function getRankBadge(rank: number) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <View style={styles.headerBanner}>
        <Text style={styles.headerEmoji}>🏆</Text>
        <Text style={styles.headerTitle}>Liga Plata</Text>
        <Text style={styles.headerSubtitle}>
          Los 3 primeros ascienden a la Liga Oro este domingo.
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF9600" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.firebase_uid}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const rank = index + 1;
            const isMe = item.firebase_uid === user?.id;

            return (
              <View style={[styles.rankRow, isMe && styles.myRow]}>
                <Text style={styles.rankNumber}>{getRankBadge(rank)}</Text>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {item.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.username, isMe && styles.myUsername]}>
                    {item.username} {isMe ? '(Tú)' : ''}
                  </Text>
                </View>
                <Text style={styles.xpText}>⚡ {item.weekly_xp} XP</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  headerBanner: {
    backgroundColor: '#FF9600',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  myRow: {
    borderColor: '#58CC02',
    backgroundColor: '#F1F8E9',
    borderWidth: 2,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '800',
    width: 36,
    textAlign: 'center',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3C3C3C',
  },
  myUsername: {
    color: '#2E7D32',
    fontWeight: '900',
  },
  xpText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF9600',
  },
});
