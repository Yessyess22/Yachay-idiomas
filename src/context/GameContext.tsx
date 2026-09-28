import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { authService } from '@/src/services/authService';
import { leaderboardService } from '@/src/services/leaderboardService';
import { Profile } from '@/src/types';
import { scheduleStreakReminder, cancelStreakReminder, requestNotificationPermissions } from '@/src/services/notificationService';

const INITIAL_LIVES = 5;
const XP_PER_CORRECT = 10;
const GEMS_PER_LESSON = 15;
const SYNC_DEBOUNCE_MS = 800;
export const LIFE_REFILL_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 horas para regenerar 1 vida

export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  if (!fromDateStr || !toDateStr) return 999;
  const [y1, m1, d1] = fromDateStr.split('-').map(Number);
  const [y2, m2, d2] = toDateStr.split('-').map(Number);
  if (isNaN(y1) || isNaN(m1) || isNaN(d1) || isNaN(y2) || isNaN(m2) || isNaN(d2)) return 999;
  const dt1 = new Date(y1, m1 - 1, d1);
  const dt2 = new Date(y2, m2 - 1, d2);
  return Math.round((dt2.getTime() - dt1.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeRegeneratedLives(
  currentLives: number,
  lastLostAt: string | null
): { lives: number; lastLifeLostAt: string | null } {
  if (currentLives >= INITIAL_LIVES) {
    return { lives: INITIAL_LIVES, lastLifeLostAt: null };
  }
  if (!lastLostAt) {
    return { lives: currentLives, lastLifeLostAt: new Date().toISOString() };
  }

  const lostTime = new Date(lastLostAt).getTime();
  if (isNaN(lostTime)) {
    return { lives: currentLives, lastLifeLostAt: new Date().toISOString() };
  }

  const elapsed = Date.now() - lostTime;
  if (elapsed <= 0) {
    return { lives: currentLives, lastLifeLostAt: lastLostAt };
  }

  const livesToAdd = Math.floor(elapsed / LIFE_REFILL_INTERVAL_MS);
  if (livesToAdd <= 0) {
    return { lives: currentLives, lastLifeLostAt: lastLostAt };
  }

  const newLives = Math.min(INITIAL_LIVES, currentLives + livesToAdd);
  if (newLives >= INITIAL_LIVES) {
    return { lives: INITIAL_LIVES, lastLifeLostAt: null };
  }

  const updatedLostAt = new Date(lostTime + livesToAdd * LIFE_REFILL_INTERVAL_MS).toISOString();
  return { lives: newLives, lastLifeLostAt: updatedLostAt };
}

export function computeHydratedStreak(
  savedStreak: number,
  lastActiveDate: string | null | undefined,
  freezeCount: number
): { streak: number; lastActive: string | null; freezeCount: number; savedByFreeze: boolean } {
  const today = getLocalDateString();

  if (!lastActiveDate) {
    // Si no hay fecha de actividad previa registrada en la cuenta:
    // La racha empieza en 0. Al completar la primera lección de hoy pasará a 1.
    return {
      streak: 0,
      lastActive: null,
      freezeCount,
      savedByFreeze: false,
    };
  }

  const diff = getDaysDifference(lastActiveDate, today);

  if (diff <= 0) {
    // Ya estudió hoy
    return {
      streak: Math.max(1, savedStreak),
      lastActive: today,
      freezeCount,
      savedByFreeze: false,
    };
  }

  if (diff === 1) {
    // Estudió ayer: la racha se mantiene esperando la lección de hoy
    return {
      streak: Math.max(1, savedStreak),
      lastActive: lastActiveDate,
      freezeCount,
      savedByFreeze: false,
    };
  }

  if (diff === 2 && freezeCount > 0) {
    // Solo faltó ayer, pero tiene Amuleto de Hielo
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    return {
      streak: Math.max(1, savedStreak),
      lastActive: getLocalDateString(yest),
      freezeCount: Math.max(0, freezeCount - 1),
      savedByFreeze: true,
    };
  }

  // Pasaron 2 o más días sin amuleto: racha perdida a 0
  return {
    streak: 0,
    lastActive: lastActiveDate,
    freezeCount,
    savedByFreeze: false,
  };
}

type GameState = {
  lives: number;
  xp: number;
  gems: number;
  streakDays: number;
  lastActiveDate: string | null;
  lastLifeLostAt: string | null;
  streakSavedByFreeze: boolean;
  isBlocked: boolean;
  equippedOutfit: string | null;
  hasDoubleXp: boolean;
  doubleXpExpiresAt: number | null;
  streakFreezeCount: number;
};

type GameAction =
  | { type: 'CORRECT_ANSWER' }
  | { type: 'WRONG_ANSWER' }
  | { type: 'RESTORE_LIVES' }
  | { type: 'ADD_LIVES'; amount: number }
  | { type: 'REGENERATE_LIVES_TICK' }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'CONSUME_GEMS'; amount: number }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'SET_STREAK'; streak: number }
  | { type: 'RECORD_ACTIVITY'; streakDays: number; lastActiveDate: string }
  | { type: 'EQUIP_OUTFIT'; outfitId: string | null }
  | { type: 'ACTIVATE_DOUBLE_XP'; expiresAt: number }
  | { type: 'DEACTIVATE_DOUBLE_XP' }
  | { type: 'ADD_STREAK_FREEZE' }
  | {
      type: 'HYDRATE';
      lives: number;
      xp: number;
      gems: number;
      streakDays: number;
      lastActiveDate: string | null;
      lastLifeLostAt: string | null;
      streakSavedByFreeze: boolean;
      outfit: string | null;
      streakFreezeCount: number;
      doubleXpExpiresAt?: number | null;
    };

type GameContextType = GameState & {
  doubleXpMinutesLeft: number;
  timeUntilNextLifeMs: number;
  nextLifeFormattedTime: string;
  checkAnswer: (isCorrect: boolean) => void;
  restoreLives: () => void;
  addLives: (amount?: number) => void;
  addGems: (amount?: number) => void;
  consumeGems: (amount: number) => boolean;
  deductGems: (amount?: number) => void;
  addXp: (amount: number) => void;
  setStreak: (streak: number) => void;
  recordDailyActivity: () => { streakDays: number; isNewDay: boolean };
  hydrateFromProfile: (profile: Profile) => void;
  equipOutfit: (outfitId: string | null) => void;
  activateDoubleXp: (durationMinutes?: number) => void;
  addStreakFreeze: () => void;
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return {
        ...state,
        lives: action.lives,
        xp: action.xp,
        gems: action.gems,
        streakDays: action.streakDays,
        lastActiveDate: action.lastActiveDate,
        lastLifeLostAt: action.lastLifeLostAt,
        streakSavedByFreeze: action.streakSavedByFreeze,
        isBlocked: action.lives <= 0,
        equippedOutfit: action.outfit,
        streakFreezeCount: action.streakFreezeCount,
        hasDoubleXp: action.doubleXpExpiresAt ? Date.now() < action.doubleXpExpiresAt : state.hasDoubleXp,
        doubleXpExpiresAt: action.doubleXpExpiresAt !== undefined ? action.doubleXpExpiresAt : state.doubleXpExpiresAt,
      };
    case 'EQUIP_OUTFIT':
      return { ...state, equippedOutfit: action.outfitId };
    case 'ACTIVATE_DOUBLE_XP':
      return { ...state, hasDoubleXp: true, doubleXpExpiresAt: action.expiresAt };
    case 'DEACTIVATE_DOUBLE_XP':
      return { ...state, hasDoubleXp: false, doubleXpExpiresAt: null };
    case 'ADD_STREAK_FREEZE':
      return { ...state, streakFreezeCount: state.streakFreezeCount + 1 };
    case 'CORRECT_ANSWER':
      return { ...state };
    case 'ADD_XP':
      return { ...state, xp: state.xp + action.amount };
    case 'WRONG_ANSWER': {
      const newLives = Math.max(0, state.lives - 1);
      const newLastLost =
        state.lives === INITIAL_LIVES
          ? new Date().toISOString()
          : state.lastLifeLostAt || new Date().toISOString();
      return {
        ...state,
        lives: newLives,
        isBlocked: newLives <= 0,
        lastLifeLostAt: newLives < INITIAL_LIVES ? newLastLost : null,
      };
    }
    case 'RESTORE_LIVES':
      return { ...state, lives: INITIAL_LIVES, isBlocked: false, lastLifeLostAt: null };
    case 'ADD_LIVES': {
      const newLives = Math.min(INITIAL_LIVES, state.lives + action.amount);
      return {
        ...state,
        lives: newLives,
        isBlocked: newLives <= 0,
        lastLifeLostAt: newLives >= INITIAL_LIVES ? null : state.lastLifeLostAt,
      };
    }
    case 'REGENERATE_LIVES_TICK': {
      const { lives, lastLifeLostAt } = computeRegeneratedLives(state.lives, state.lastLifeLostAt);
      if (lives === state.lives && lastLifeLostAt === state.lastLifeLostAt) {
        return state;
      }
      return {
        ...state,
        lives,
        lastLifeLostAt,
        isBlocked: lives <= 0,
      };
    }
    case 'ADD_GEMS':
      return { ...state, gems: state.gems + action.amount };
    case 'CONSUME_GEMS':
      return { ...state, gems: Math.max(0, state.gems - action.amount) };
    case 'SET_STREAK':
      return { ...state, streakDays: action.streak };
    case 'RECORD_ACTIVITY':
      return {
        ...state,
        streakDays: action.streakDays,
        lastActiveDate: action.lastActiveDate,
      };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    lives: INITIAL_LIVES,
    xp: 0,
    gems: 0,
    streakDays: 0,
    lastActiveDate: null,
    lastLifeLostAt: null,
    streakSavedByFreeze: false,
    isBlocked: false,
    equippedOutfit: null,
    hasDoubleXp: false,
    doubleXpExpiresAt: null,
    streakFreezeCount: 0,
  });

  const userIdRef = useRef<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Solicitar permisos de notificaciones al montar el proveedor
  useEffect(() => {
    requestNotificationPermissions().catch(() => {});
    // Programar recordatorio diario de racha
    scheduleStreakReminder().catch(() => {});
  }, []);

  // Cargar estado inicial de Doble XP guardado localmente
  useEffect(() => {
    AsyncStorage.getItem('@yachay_double_xp_expires')
      .then((saved) => {
        if (saved) {
          const exp = parseInt(saved, 10);
          if (exp > Date.now()) {
            dispatch({ type: 'ACTIVATE_DOUBLE_XP', expiresAt: exp });
          } else {
            AsyncStorage.removeItem('@yachay_double_xp_expires').catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  // Timer para verificar si el Doble XP expiró
  useEffect(() => {
    if (!state.doubleXpExpiresAt) return;
    const checkExp = () => {
      if (Date.now() >= state.doubleXpExpiresAt!) {
        dispatch({ type: 'DEACTIVATE_DOUBLE_XP' });
        AsyncStorage.removeItem('@yachay_double_xp_expires').catch(() => {});
      }
    };
    const interval = setInterval(checkExp, 5000);
    return () => clearInterval(interval);
  }, [state.doubleXpExpiresAt]);

  // Timer periódico para regenerar vidas cada 60 segundos
  useEffect(() => {
    const lifeInterval = setInterval(() => {
      dispatch({ type: 'REGENERATE_LIVES_TICK' });
    }, 60000);
    return () => clearInterval(lifeInterval);
  }, []);

  // Debounced sync to Supabase profiles table
  useEffect(() => {
    if (!userIdRef.current) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      authService.updateGameState(userIdRef.current!, {
        lives: state.lives,
        gems: state.gems,
        xp: state.xp,
        streakDays: state.streakDays,
        avatarUrl: state.equippedOutfit,
        streakFreezeCount: state.streakFreezeCount,
        lastActiveDate: state.lastActiveDate,
        lastLifeLostAt: state.lastLifeLostAt,
      });
    }, SYNC_DEBOUNCE_MS);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [
    state.lives,
    state.gems,
    state.xp,
    state.streakDays,
    state.equippedOutfit,
    state.streakFreezeCount,
    state.lastActiveDate,
    state.lastLifeLostAt,
  ]);

  const hydrateFromProfile = useCallback((profile: Profile) => {
    userIdRef.current = profile.firebase_uid;
    const initialOutfit = profile.avatar_url ?? null;

    // 1. Calcular vidas regeneradas
    const rawLives = profile.lives ?? INITIAL_LIVES;
    const rawLastLifeLost = profile.last_life_lost_at ?? null;
    const { lives: hydratedLives, lastLifeLostAt: hydratedLastLost } = computeRegeneratedLives(
      rawLives,
      rawLastLifeLost
    );

    // 2. Calcular racha y validar contra el calendario (estilo Duolingo)
    const rawStreak = profile.streak_count ?? 0;
    const rawLastActive = profile.last_active_date ?? null;
    const rawFreezeCount = profile.streak_freeze_count ?? 0;

    const {
      streak: hydratedStreak,
      lastActive: hydratedLastActive,
      freezeCount: hydratedFreezeCount,
      savedByFreeze,
    } = computeHydratedStreak(rawStreak, rawLastActive, rawFreezeCount);

    dispatch({
      type: 'HYDRATE',
      lives: hydratedLives,
      lastLifeLostAt: hydratedLastLost,
      xp: profile.total_xp ?? 0,
      gems: profile.gems ?? 0,
      streakDays: hydratedStreak,
      lastActiveDate: hydratedLastActive,
      streakFreezeCount: hydratedFreezeCount,
      streakSavedByFreeze: savedByFreeze,
      outfit: initialOutfit,
    });

    AsyncStorage.getItem(`@yachay_outfit_${profile.firebase_uid}`)
      .then((localOutfit) => {
        if (localOutfit) {
          dispatch({ type: 'EQUIP_OUTFIT', outfitId: localOutfit });
        }
      })
      .catch(() => {});
  }, []);

  const checkAnswer = useCallback((isCorrect: boolean) => {
    dispatch({ type: isCorrect ? 'CORRECT_ANSWER' : 'WRONG_ANSWER' });
  }, []);

  const addXp = useCallback(
    (amount: number) => {
      dispatch({ type: 'ADD_XP', amount });
      if (userIdRef.current) {
        leaderboardService.syncUserTotalXp(userIdRef.current, state.xp + amount).catch(() => {});
      }
    },
    [state.xp]
  );

  const restoreLives = useCallback(() => {
    dispatch({ type: 'RESTORE_LIVES' });
  }, []);

  const addLives = useCallback((amount: number = 1) => {
    dispatch({ type: 'ADD_LIVES', amount });
  }, []);

  const consumeGems = useCallback(
    (amount: number) => {
      if (state.gems >= amount) {
        dispatch({ type: 'CONSUME_GEMS', amount });
        return true;
      }
      return false;
    },
    [state.gems]
  );

  const setStreak = useCallback((streak: number) => {
    dispatch({ type: 'SET_STREAK', streak });
  }, []);

  const recordDailyActivity = useCallback(() => {
    const today = getLocalDateString();
    const lastActive = state.lastActiveDate;
    const diff = lastActive ? getDaysDifference(lastActive, today) : 999;

    let nextStreak = state.streakDays;
    let isNewDay = false;

    if (diff === 0) {
      // Ya hizo lección hoy, no incrementa otra vez en el mismo día
      isNewDay = false;
      if (nextStreak === 0) {
        nextStreak = 1;
      }
    } else if (diff === 1) {
      // Día consecutivo (ayer -> hoy)
      nextStreak = (state.streakDays || 0) + 1;
      isNewDay = true;
    } else {
      // Racha rota o primera lección
      nextStreak = 1;
      isNewDay = true;
    }

    dispatch({
      type: 'RECORD_ACTIVITY',
      streakDays: nextStreak,
      lastActiveDate: today,
    });

    if (userIdRef.current) {
      authService.updateGameState(userIdRef.current, {
        lives: state.lives,
        gems: state.gems,
        xp: state.xp,
        streakDays: nextStreak,
        lastActiveDate: today,
        lastLifeLostAt: state.lastLifeLostAt,
        avatarUrl: state.equippedOutfit,
        streakFreezeCount: state.streakFreezeCount,
      });
    }

    return { streakDays: nextStreak, isNewDay };
  }, [
    state.lastActiveDate,
    state.streakDays,
    state.lives,
    state.gems,
    state.xp,
    state.lastLifeLostAt,
    state.equippedOutfit,
    state.streakFreezeCount,
  ]);

  const equipOutfit = useCallback((outfitId: string | null) => {
    dispatch({ type: 'EQUIP_OUTFIT', outfitId });
    if (userIdRef.current) {
      AsyncStorage.setItem(`@yachay_outfit_${userIdRef.current}`, outfitId || '').catch(() => {});
    }
  }, []);

  const activateDoubleXp = useCallback((durationMinutes = 15) => {
    const expiresAt = Date.now() + durationMinutes * 60 * 1000;
    dispatch({ type: 'ACTIVATE_DOUBLE_XP', expiresAt });
    AsyncStorage.setItem('@yachay_double_xp_expires', String(expiresAt)).catch(() => {});
  }, []);

  const addStreakFreeze = useCallback(() => {
    dispatch({ type: 'ADD_STREAK_FREEZE' });
    const nextVal = (state.streakFreezeCount || 0) + 1;
    if (userIdRef.current) {
      AsyncStorage.setItem(`@yachay_streak_freeze_${userIdRef.current}`, String(nextVal)).catch(() => {});
    }
  }, [state.streakFreezeCount]);

  const addGems = useCallback((amount = GEMS_PER_LESSON) => {
    dispatch({ type: 'ADD_GEMS', amount });
    cancelStreakReminder().catch(() => {});
  }, []);

  const deductGems = useCallback((amount = 5) => {
    dispatch({ type: 'CONSUME_GEMS', amount });
  }, []);

  const isDoubleXpActive =
    state.hasDoubleXp && !!state.doubleXpExpiresAt && Date.now() < state.doubleXpExpiresAt;
  const doubleXpMinutesLeft =
    isDoubleXpActive && state.doubleXpExpiresAt
      ? Math.max(1, Math.ceil((state.doubleXpExpiresAt - Date.now()) / 60000))
      : 0;

  const timeUntilNextLifeMs = (() => {
    if (state.lives >= INITIAL_LIVES || !state.lastLifeLostAt) return 0;
    const lostTime = new Date(state.lastLifeLostAt).getTime();
    if (isNaN(lostTime)) return 0;
    const elapsed = Date.now() - lostTime;
    const rem = LIFE_REFILL_INTERVAL_MS - (elapsed % LIFE_REFILL_INTERVAL_MS);
    return Math.max(0, rem);
  })();

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '0m';
    const totalMinutes = Math.ceil(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const nextLifeFormattedTime = formatCountdown(timeUntilNextLifeMs);

  return (
    <GameContext.Provider
      value={{
        ...state,
        hasDoubleXp: isDoubleXpActive,
        doubleXpMinutesLeft,
        timeUntilNextLifeMs,
        nextLifeFormattedTime,
        checkAnswer,
        restoreLives,
        addLives,
        addGems,
        consumeGems,
        deductGems,
        addXp,
        setStreak,
        recordDailyActivity,
        hydrateFromProfile,
        equipOutfit,
        activateDoubleXp,
        addStreakFreeze,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider');
  return ctx;
}
