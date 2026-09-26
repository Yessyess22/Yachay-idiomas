import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { authService } from '@/src/services/authService';
import { Profile } from '@/src/types';
import { scheduleStreakReminder, cancelStreakReminder, requestNotificationPermissions } from '@/src/services/notificationService';

const INITIAL_LIVES = 5;
const XP_PER_CORRECT = 10;
const GEMS_PER_LESSON = 15;
const SYNC_DEBOUNCE_MS = 800;

type GameState = {
  lives: number;
  xp: number;
  gems: number;
  streakDays: number;
  isBlocked: boolean;
  equippedOutfit: string | null;
  hasDoubleXp: boolean;
};

type GameAction =
  | { type: 'CORRECT_ANSWER' }
  | { type: 'WRONG_ANSWER' }
  | { type: 'RESTORE_LIVES' }
  | { type: 'ADD_GEMS'; amount: number }
  | { type: 'CONSUME_GEMS'; amount: number }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'SET_STREAK'; streak: number }
  | { type: 'EQUIP_OUTFIT'; outfitId: string | null }
  | { type: 'ACTIVATE_DOUBLE_XP' }
  | { type: 'HYDRATE'; lives: number; xp: number; gems: number; streakDays: number; outfit: string | null };

type GameContextType = GameState & {
  checkAnswer: (isCorrect: boolean) => void;
  restoreLives: () => void;
  addGems: (amount?: number) => void;
  consumeGems: (amount: number) => boolean;
  addXp: (amount: number) => void;
  setStreak: (streak: number) => void;
  hydrateFromProfile: (profile: Profile) => void;
  equipOutfit: (outfitId: string | null) => void;
  activateDoubleXp: () => void;
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
        isBlocked: action.lives <= 0,
        equippedOutfit: action.outfit,
      };
    case 'EQUIP_OUTFIT':
      return { ...state, equippedOutfit: action.outfitId };
    case 'ACTIVATE_DOUBLE_XP':
      return { ...state, hasDoubleXp: true };
    case 'CORRECT_ANSWER':
      return { ...state };
    case 'ADD_XP':
      return { ...state, xp: state.xp + action.amount };
    case 'WRONG_ANSWER': {
      const newLives = Math.max(0, state.lives - 1);
      return { ...state, lives: newLives, isBlocked: newLives <= 0 };
    }
    case 'RESTORE_LIVES':
      return { ...state, lives: INITIAL_LIVES, isBlocked: false };
    case 'ADD_GEMS':
      return { ...state, gems: state.gems + action.amount };
    case 'CONSUME_GEMS':
      return { ...state, gems: Math.max(0, state.gems - action.amount) };
    case 'SET_STREAK':
      return { ...state, streakDays: action.streak };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    lives: INITIAL_LIVES,
    xp: 0,
    gems: 100,
    streakDays: 1,
    isBlocked: false,
    equippedOutfit: null,
    hasDoubleXp: false,
  });

  const userIdRef = useRef<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Solicitar permisos de notificaciones al montar el proveedor
  useEffect(() => {
    requestNotificationPermissions().catch(() => {});
    // Programar recordatorio diario de racha
    scheduleStreakReminder().catch(() => {});
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
      });
    }, SYNC_DEBOUNCE_MS);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [state.lives, state.gems, state.xp, state.streakDays, state.equippedOutfit]);

  const hydrateFromProfile = useCallback((profile: Profile) => {
    userIdRef.current = profile.firebase_uid;
    const initialOutfit = profile.avatar_url ?? null;

    dispatch({
      type: 'HYDRATE',
      lives: profile.lives ?? INITIAL_LIVES,
      xp: profile.total_xp ?? 0,
      gems: profile.gems ?? 100,
      streakDays: Math.max(1, profile.streak_count ?? 1),
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

  const addXp = useCallback((amount: number) => {
    dispatch({ type: 'ADD_XP', amount });
  }, []);

  const restoreLives = useCallback(() => {
    dispatch({ type: 'RESTORE_LIVES' });
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

  const equipOutfit = useCallback((outfitId: string | null) => {
    dispatch({ type: 'EQUIP_OUTFIT', outfitId });
    if (userIdRef.current) {
      AsyncStorage.setItem(`@yachay_outfit_${userIdRef.current}`, outfitId || '').catch(() => {});
    }
  }, []);

  const activateDoubleXp = useCallback(() => {
    dispatch({ type: 'ACTIVATE_DOUBLE_XP' });
  }, []);

  // Cuando el usuario gana gemas (completa lección), cancelar recordatorio de racha del día
  const addGems = useCallback((amount = GEMS_PER_LESSON) => {
    dispatch({ type: 'ADD_GEMS', amount });
    cancelStreakReminder().catch(() => {});
  }, []);

  return (
    <GameContext.Provider
      value={{
        ...state,
        checkAnswer,
        restoreLives,
        addGems,
        consumeGems,
        addXp,
        setStreak,
        hydrateFromProfile,
        equipOutfit,
        activateDoubleXp,
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
