import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '@/src/services/authService';
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
  const [claimingQuestId, setClaimingQuestId] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARD);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [feedbackIsError, setFeedbackIsError] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // ── Edición de Perfil ─────────────────────────────────────────
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showWebCamera, setShowWebCamera] = useState(false);
  const [webCameraLoading, setWebCameraLoading] = useState(false);
  const webVideoRef = useRef<any>(null);
  const webStreamRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (webStreamRef.current) {
        try {
          webStreamRef.current.getTracks().forEach((track: any) => track.stop());
        } catch (_) {}
      }
    };
  }, []);

  const AVATAR_OPTIONS = [
    '🦙', '🌄', '☀️', '🌿', '🦅', '🐍',
    '🌺', '⭐', '🏔️', '🌙', '💎', '🪶',
  ];

  const userStreak = streakDays ?? profile?.streak_count ?? 0;
  const userXp = xp ?? profile?.total_xp ?? 0;
  const userGems = gems ?? profile?.gems ?? 0;
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
      status: userStreak >= 7 ? 'unlocked' : userStreak > 0 ? 'progress' : 'locked',
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

  const getQuestMeta = (type: string) => {
    switch (type) {
      case 'lesson_count':
        return { emoji: '📖', bg: '#EBF3FE', border: '#D0E1FD', color: '#1D4ED8' };
      case 'xp_gain':
        return { emoji: '⚡', bg: '#FFF8E1', border: '#FFE082', color: '#B45309' };
      case 'perfect_lesson':
        return { emoji: '🌟', bg: '#FEF3C7', border: '#FDE68A', color: '#D97706' };
      case 'streak_maintain':
        return { emoji: '🔥', bg: '#FEE2E2', border: '#FECACA', color: '#DC2626' };
      default:
        return { emoji: '🎯', bg: '#F1F5F9', border: '#E2E8F0', color: '#475569' };
    }
  };

  const handleClaimQuest = async (q: DailyQuest) => {
    const uid = user?.uid || (user as any)?.id;
    if (!uid || claimingQuestId !== null) return;
    setClaimingQuestId(q.id);
    try {
      const res = await questService.claimQuestReward(uid, q.id);
      if (res.success) {
        if (res.gemReward > 0) addGems(res.gemReward);
        if (res.xpReward > 0) {
          addXp(res.xpReward);
          leaderboardService.recordWeeklyXp(uid, res.xpReward).catch(() => {});
        }
        setFeedbackIsError(false);
        setFeedbackMsg(`¡Misión Cumplida! 🎁 +${res.xpReward} XP y +${res.gemReward} Gemas 💎`);
        setTimeout(() => setFeedbackMsg(null), 3500);
        await refreshProfile();
        await loadQuestsData();
        loadLeaderboardData();
      }
    } catch (err) {
      console.warn('Error claiming quest reward:', err);
    } finally {
      setClaimingQuestId(null);
    }
  };

  async function performSignOut() {
    try {
      setSigningOut(true);
      await signOut();
      router.replace('/(auth)' as any);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setFeedbackIsError(true);
      setFeedbackMsg('No se pudo cerrar la sesión. Intenta de nuevo.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } finally {
      setSigningOut(false);
      setShowSignOutConfirm(false);
    }
  }

  async function handleSignOut() {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('¿Estás seguro de que deseas salir de Yachay?')
          : true;
      if (confirmed) {
        await performSignOut();
      }
      return;
    }
    setShowSignOutConfirm(true);
  }

  const username =
    (profile?.username?.toLowerCase().includes('alejandro') ||
     user?.displayName?.toLowerCase().includes('alejandro') ||
     user?.email?.toLowerCase().includes('alejandro'))
      ? 'Alejandro Padilla Ponce'
      : (profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Estudiante Yachay');

  function openEditModal() {
    setEditUsername(username);
    setEditAvatar(profile?.avatar_url || '');
    setShowEditModal(true);
  }

  const pickImageFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Concede permiso para acceder a tus fotos y cambiar tu foto de perfil.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setEditAvatar(imageUri);
      }
    } catch (err) {
      console.error('Error al seleccionar imagen:', err);
      Alert.alert('Error', 'No se pudo cargar la imagen seleccionada.');
    }
  };

  const startWebCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      Alert.alert(
        'Cámara no compatible',
        'Tu navegador no soporta captura de cámara en vivo. Por favor usa la opción de Galería/Archivos.'
      );
      return;
    }
    setShowWebCamera(true);
    setWebCameraLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      webStreamRef.current = stream;
      setWebCameraLoading(false);
      setTimeout(() => {
        if (webVideoRef.current) {
          webVideoRef.current.srcObject = stream;
          webVideoRef.current.play().catch(() => {});
        }
      }, 150);
    } catch (err) {
      console.error('Error al acceder a la cámara web:', err);
      setWebCameraLoading(false);
      setShowWebCamera(false);
      Alert.alert(
        'Permiso de cámara necesario',
        'No pudimos acceder a tu cámara. Concede permiso de cámara en tu navegador para continuar.'
      );
    }
  };

  const stopWebCamera = () => {
    if (webStreamRef.current) {
      try {
        webStreamRef.current.getTracks().forEach((track: any) => track.stop());
      } catch (_) {}
      webStreamRef.current = null;
    }
    setShowWebCamera(false);
    setWebCameraLoading(false);
  };

  const captureWebPhoto = () => {
    if (!webVideoRef.current) return;
    try {
      const video = webVideoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 480;
      const height = video.videoHeight || 480;
      const size = Math.min(width, height);
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Espejo horizontal para selfie natural
        ctx.translate(400, 0);
        ctx.scale(-1, 1);
        const sx = (width - size) / 2;
        const sy = (height - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopWebCamera();
        setEditAvatar(dataUrl);
      }
    } catch (err) {
      console.error('Error al capturar foto web:', err);
      stopWebCamera();
    }
  };

  const takePhotoWithCamera = async () => {
    if (Platform.OS === 'web') {
      startWebCamera();
      return;
    }

    try {
      let permission = await ImagePicker.getCameraPermissionsAsync();
      if (!permission.granted) {
        permission = await ImagePicker.requestCameraPermissionsAsync();
      }
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Concede permiso para usar la cámara y tomar una foto de perfil.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS === 'ios',
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
        setEditAvatar(imageUri);
      }
    } catch (err) {
      console.error('Error al tomar foto:', err);
      Alert.alert('Error', 'No se pudo abrir la cámara.');
    }
  };

  async function saveProfile() {
    const uid = user?.uid || (user as any)?.id;
    if (!uid) return;
    if (!editUsername.trim()) {
      Alert.alert('Nombre requerido', 'Por favor escribe un nombre de usuario.');
      return;
    }
    setSavingProfile(true);
    const { error } = await authService.updateProfile(uid, {
      username: editUsername.trim(),
      avatar_url: editAvatar || '',
    });
    setSavingProfile(false);
    if (error) {
      Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.');
    } else {
      await refreshProfile();
      setShowEditModal(false);
      setFeedbackIsError(false);
      setFeedbackMsg('✅ Perfil actualizado correctamente');
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  }

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
            <TouchableOpacity onPress={openEditModal} activeOpacity={0.85}>
              <View style={styles.avatarContainer}>
                {profile?.avatar_url && (profile.avatar_url.startsWith('data:image') || profile.avatar_url.startsWith('http') || profile.avatar_url.startsWith('file:')) ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatarPhoto}
                    resizeMode="cover"
                  />
                ) : profile?.avatar_url && AVATAR_OPTIONS.includes(profile.avatar_url) ? (
                  <View style={styles.avatarEmojiCircle}>
                    <Text style={styles.avatarEmoji}>{profile.avatar_url}</Text>
                  </View>
                ) : (
                  <Image
                    source={require('@/assets/images/yachi/yachi_principal.png')}
                    style={styles.avatarImage}
                    resizeMode="contain"
                  />
                )}
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
                {/* Botón lápiz de edición */}
                <View style={styles.editAvatarBadge}>
                  <Text style={styles.editAvatarBadgeText}>✏️</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <View style={styles.usernameRow}>
                <Text style={styles.userName}>{username}</Text>
              </View>
              <Text style={styles.userEmail}>{user?.email || 'estudiante@yachay.pe'}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>🌟 Yachachiq • Estudiante Activo</Text>
              </View>
            </View>
          </View>

          {/* ── Modal Editar Perfil ── */}
          <Modal
            visible={showEditModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowEditModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>✏️ Editar Perfil</Text>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                >
                  {/* Nombre de usuario */}
                  <Text style={styles.modalLabel}>Nombre de usuario</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editUsername}
                    onChangeText={setEditUsername}
                    placeholder="Tu nombre en Yachay"
                    placeholderTextColor="#94A3B8"
                    maxLength={30}
                    autoCapitalize="words"
                  />

                  {/* Foto o Avatar */}
                  <Text style={styles.modalLabel}>Foto o Avatar</Text>

                  {/* Vista previa actual en el modal */}
                  {(() => {
                    const isCustomPhoto = Boolean(
                      editAvatar &&
                        (editAvatar.startsWith('data:image') ||
                          editAvatar.startsWith('http') ||
                          editAvatar.startsWith('file:'))
                    );
                    const isPresetEmoji = Boolean(editAvatar && AVATAR_OPTIONS.includes(editAvatar));

                    return (
                      <View style={styles.modalAvatarPreviewRow}>
                        <View style={styles.modalAvatarPreviewCircle}>
                          {isCustomPhoto ? (
                            <Image
                              source={{ uri: editAvatar }}
                              style={styles.modalAvatarPreviewImage}
                              resizeMode="cover"
                            />
                          ) : isPresetEmoji ? (
                            <Text style={styles.modalAvatarPreviewEmoji}>{editAvatar}</Text>
                          ) : (
                            <Image
                              source={require('@/assets/images/yachi/yachi_principal.png')}
                              style={styles.modalAvatarPreviewYachi}
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        <View style={styles.modalAvatarPreviewInfo}>
                          <Text style={styles.modalAvatarPreviewTitle}>
                            {isCustomPhoto
                              ? 'Foto personal seleccionada 📸'
                              : isPresetEmoji
                              ? `Avatar andino (${editAvatar})`
                              : 'Yachi la llama'}
                          </Text>
                          <Text style={styles.modalAvatarPreviewSub}>
                            {isCustomPhoto
                              ? 'Puedes cambiarla o volver a un avatar tradicional'
                              : 'Sube una foto de tu galería o toma una foto'}
                          </Text>
                        </View>
                        {isCustomPhoto ? (
                          <TouchableOpacity
                            style={styles.removePhotoBtn}
                            onPress={() => setEditAvatar('')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Text style={styles.removePhotoBtnText}>✕</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    );
                  })()}

                  {/* Botones de acción para foto */}
                  <View style={styles.photoActionsRow}>
                    <TouchableOpacity
                      style={styles.photoActionBtn}
                      onPress={pickImageFromGallery}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoActionBtnIcon}>🖼️</Text>
                      <Text style={styles.photoActionBtnText}>Galería</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.photoActionBtn}
                      onPress={takePhotoWithCamera}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.photoActionBtnIcon}>📸</Text>
                      <Text style={styles.photoActionBtnText}>Cámara</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Selector de avatar emoji */}
                  <Text style={styles.modalSubLabel}>O elige un avatar andino:</Text>
                  <View style={styles.avatarGrid}>
                    {AVATAR_OPTIONS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[
                          styles.avatarGridItem,
                          editAvatar === emoji && styles.avatarGridItemSelected,
                        ]}
                        onPress={() => setEditAvatar(emoji)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.avatarGridEmoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                    {/* Opción: volver a Yachi */}
                    <TouchableOpacity
                      style={[
                        styles.avatarGridItem,
                        editAvatar === '' && styles.avatarGridItemSelected,
                      ]}
                      onPress={() => setEditAvatar('')}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={require('@/assets/images/yachi/yachi_principal.png')}
                        style={{ width: 36, height: 36 }}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                {/* Acciones */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowEditModal(false)}
                    disabled={savingProfile}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalSaveBtn, savingProfile && { opacity: 0.6 }]}
                    onPress={saveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.modalSaveText}>Guardar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* ── Modal Cámara Web ── */}
          {Platform.OS === 'web' && (
            <Modal
              visible={showWebCamera}
              transparent
              animationType="fade"
              onRequestClose={stopWebCamera}
            >
              <View style={styles.webCamOverlay}>
                <View style={styles.webCamCard}>
                  <View style={styles.webCamHeader}>
                    <Text style={styles.webCamTitle}>📸 Tomar Foto con Cámara</Text>
                    <TouchableOpacity
                      onPress={stopWebCamera}
                      style={styles.webCamCloseBtn}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.webCamCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.webCamSub}>
                    Encuádrate en el círculo y presiona "Capturar Foto"
                  </Text>

                  {/* Visor de video circular */}
                  <View style={styles.webCamCircleWrapper}>
                    {webCameraLoading && (
                      <View style={styles.webCamLoadingBox}>
                        <ActivityIndicator size="large" color="#7C3AED" />
                        <Text style={styles.webCamLoadingText}>Iniciando cámara...</Text>
                      </View>
                    )}
                    {React.createElement('video', {
                      ref: webVideoRef,
                      autoPlay: true,
                      playsInline: true,
                      muted: true,
                      style: {
                        width: 260,
                        height: 260,
                        borderRadius: 130,
                        objectFit: 'cover',
                        transform: 'scaleX(-1)',
                        display: webCameraLoading ? 'none' : 'block',
                      },
                    })}
                  </View>

                  {/* Acciones de la cámara */}
                  <View style={styles.webCamActions}>
                    <TouchableOpacity
                      style={styles.webCamCancelBtn}
                      onPress={stopWebCamera}
                    >
                      <Text style={styles.webCamCancelText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.webCamCaptureBtn, webCameraLoading && { opacity: 0.5 }]}
                      onPress={captureWebPhoto}
                      disabled={webCameraLoading}
                    >
                      <Text style={styles.webCamCaptureText}>📸 Capturar Foto</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          )}

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

        {/* Banner de verificación de correo si está pendiente */}
        {user && !user.emailVerified && user?.providerData?.some((p) => p.providerId === 'password') ? (
          <TouchableOpacity
            style={styles.unverifiedEmailBanner}
            onPress={() => router.push('/(auth)/verify-email' as any)}
            activeOpacity={0.85}
          >
            <View style={styles.unverifiedBannerLeft}>
              <Text style={styles.unverifiedBannerIcon}>✉️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.unverifiedBannerTitle}>Correo aún no confirmado</Text>
                <Text style={styles.unverifiedBannerSub}>
                  Haz clic aquí para confirmar tu cuenta y proteger tus avances.
                </Text>
              </View>
            </View>
            <View style={styles.unverifiedBannerAction}>
              <Text style={styles.unverifiedBannerActionText}>Confirmar</Text>
            </View>
          </TouchableOpacity>
        ) : null}

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
            <View style={styles.sectionHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>🎯 Misiones de Hoy</Text>
                <Text style={styles.sectionSubtitle}>
                  Cumple retos diarios y reclama tus regalos de XP y Gemas
                </Text>
              </View>
              {quests.length > 0 && (
                <View style={styles.questsCountBadge}>
                  <Text style={styles.questsCountBadgeText}>
                    {quests.filter((q) => q.claimed || (q.current_progress || 0) >= q.target_amount).length}/{quests.length}
                  </Text>
                </View>
              )}
            </View>

            <Card padding={14} style={styles.cardWrapper}>
              {quests.length > 0 ? (
                quests.map((q, idx) => {
                  const meta = getQuestMeta(q.quest_type);
                  const current = Math.min(q.target_amount, q.current_progress || 0);
                  const target = q.target_amount || 1;
                  const isCompleted = current >= target;
                  const progressPct = Math.min(100, Math.round((current / target) * 100));
                  const isClaimed = !!q.claimed;
                  const isClaiming = claimingQuestId === q.id;
                  const isLast = idx === quests.length - 1;

                  return (
                    <View
                      key={q.id}
                      style={[styles.questRow, isLast && { borderBottomWidth: 0, paddingBottom: 4 }]}
                    >
                      <View
                        style={[
                          styles.questEmojiCircle,
                          { backgroundColor: meta.bg, borderColor: meta.border },
                        ]}
                      >
                        <Text style={styles.questEmojiText}>{meta.emoji}</Text>
                      </View>

                      <View style={styles.questInfo}>
                        <View style={styles.questTitleRow}>
                          <Text style={styles.questTitle}>{q.title}</Text>
                        </View>
                        <Text style={styles.questDesc}>{q.description}</Text>

                        <ProgressBar
                          progress={progressPct}
                          height={7}
                          color={isClaimed ? '#94A3B8' : isCompleted ? '#10B981' : TEAL}
                          trackColor="#EAE3D6"
                          style={styles.progressBarBg}
                        />

                        <View style={styles.questProgressRow}>
                          <Text style={styles.questProgressText}>
                            {current} / {target} {isClaimed ? '• Cumplida' : isCompleted ? '• ¡Lista!' : ''}
                          </Text>
                          <View style={styles.questRewardPreview}>
                            <Text style={styles.questRewardPreviewText}>
                              +{q.xp_reward} XP • +{q.gem_reward} 💎
                            </Text>
                          </View>
                        </View>
                      </View>

                      {isClaimed ? (
                        <View style={styles.questClaimedBadge}>
                          <Text style={styles.questClaimedBadgeText}>✓ Listo</Text>
                        </View>
                      ) : isCompleted ? (
                        <TouchableOpacity
                          style={styles.questClaimBtn}
                          onPress={() => handleClaimQuest(q)}
                          disabled={isClaiming}
                          activeOpacity={0.8}
                        >
                          {isClaiming ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.questClaimBtnText}>🎁 Reclamar</Text>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.questPendingBadge}>
                          <Text style={styles.questPendingBadgeText}>
                            {progressPct}%
                          </Text>
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

            {/* Acceso a Certificado de Graduación */}
            <TouchableOpacity
              style={styles.certificateBannerBtn}
              onPress={() => router.push('/certificate' as any)}
              activeOpacity={0.85}
            >
              <Text style={styles.certificateBannerEmoji}>🎓</Text>
              <View style={styles.certificateBannerInfo}>
                <Text style={styles.certificateBannerTitle}>Diploma de Acreditación Andina</Text>
                <Text style={styles.certificateBannerSub}>Consulta tu certificado oficial de Amawt'a del Runa Simi.</Text>
              </View>
              <Text style={styles.certificateBannerArrow}>➔</Text>
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
              <Text style={styles.aboutAppTitle}>Créditos e Identidad Cultural</Text>
              <Text style={styles.aboutAppSub}>Etimología Yachay · Runasimi · UPDS · Misión sin fines de lucro</Text>
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

        <View style={styles.spacerBottom} />
      </ScrollView>

      {/* Toast de feedback (reemplaza Alert.alert) */}
      {feedbackMsg !== null && (
        <View style={[styles.feedbackToast, feedbackIsError ? styles.feedbackToastError : styles.feedbackToastSuccess]} pointerEvents="none">
          <Text style={styles.feedbackToastText}>{feedbackMsg}</Text>
        </View>
      )}

      {/* Confirmación de cierre de sesión (reemplaza Alert.alert nativo) */}
      {showSignOutConfirm && (
        <View style={styles.signOutOverlay}>
          <View style={styles.signOutCard}>
            <Text style={styles.signOutCardTitle}>¿Cerrar Sesión?</Text>
            <Text style={styles.signOutCardDesc}>¿Estás seguro de que deseas salir de Yachay?</Text>
            <View style={styles.signOutCardRow}>
              <TouchableOpacity style={styles.signOutCancelBtn} onPress={() => setShowSignOutConfirm(false)}>
                <Text style={styles.signOutCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.signOutConfirmBtn} onPress={performSignOut}>
                <Text style={styles.signOutConfirmText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  avatarPhoto: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
  // \u2500\u2500 Edit avatar badge \u2500\u2500
  editAvatarBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editAvatarBadgeText: {
    fontSize: 11,
  },
  // ── Avatar emoji circle ──
  avatarEmojiCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  // ── Username row ──
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // ── Edit Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '88%',
  },
  modalScroll: {
    maxHeight: 420,
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalSubLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
    marginBottom: 8,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    backgroundColor: '#F8FAFC',
    marginBottom: 6,
  },
  modalAvatarPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  modalAvatarPreviewCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  modalAvatarPreviewImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  modalAvatarPreviewEmoji: {
    fontSize: 30,
  },
  modalAvatarPreviewYachi: {
    width: 44,
    height: 44,
  },
  modalAvatarPreviewInfo: {
    flex: 1,
  },
  modalAvatarPreviewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  modalAvatarPreviewSub: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
    lineHeight: 15,
  },
  removePhotoBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  removePhotoBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#EF4444',
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 8,
  },
  photoActionBtnIcon: {
    fontSize: 16,
  },
  photoActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  avatarGridItem: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarGridItemSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  avatarGridEmoji: {
    fontSize: 28,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    marginTop: 2,
    fontWeight: '500',
  },
  questsCountBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  questsCountBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#4338CA',
  },
  cardWrapper: {
    marginBottom: 16,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2ECE1',
  },
  questEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questEmojiText: {
    fontSize: 22,
  },
  questInfo: {
    flex: 1,
    marginRight: 10,
  },
  questTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: TEXT_DARK,
    letterSpacing: -0.1,
  },
  questDesc: {
    fontSize: 11.5,
    color: TEXT_MUTED,
    marginTop: 1,
    marginBottom: 4,
    lineHeight: 15,
  },
  progressBarBg: {
    marginVertical: 2,
  },
  questProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  questProgressText: {
    fontSize: 10.5,
    color: TEXT_MUTED,
    fontWeight: '700',
  },
  questRewardPreview: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  questRewardPreviewText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  questClaimBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  questClaimBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  questClaimedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questClaimedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  questPendingBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 42,
    alignItems: 'center',
  },
  questPendingBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
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
  certificateBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 16,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  certificateBannerEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  certificateBannerInfo: {
    flex: 1,
  },
  certificateBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#92400E',
  },
  certificateBannerSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  certificateBannerArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: '#D97706',
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
  spacerBottom: {
    height: 40,
  },
  feedbackToast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  feedbackToastSuccess: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  feedbackToastError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  feedbackToastText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '700',
    textAlign: 'center',
  },
  signOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 24,
  },
  signOutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  signOutCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  signOutCardDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  signOutCardRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  signOutCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  signOutCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  signOutConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  signOutConfirmText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Modal Cámara Web */
  webCamOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1100,
  },
  webCamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  webCamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  webCamTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  webCamCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCamCloseText: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_MUTED,
  },
  webCamSub: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginBottom: 18,
  },
  webCamCircleWrapper: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    borderColor: '#7C3AED',
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  webCamLoadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  webCamLoadingText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  webCamActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  webCamCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  webCamCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  webCamCaptureBtn: {
    flex: 1.4,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webCamCaptureText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  unverifiedEmailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginVertical: 14,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  unverifiedBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 10,
  },
  unverifiedBannerIcon: {
    fontSize: 24,
  },
  unverifiedBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  unverifiedBannerSub: {
    fontSize: 11.5,
    color: '#B45309',
    lineHeight: 16,
  },
  unverifiedBannerAction: {
    backgroundColor: '#F59E0B',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  unverifiedBannerActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
