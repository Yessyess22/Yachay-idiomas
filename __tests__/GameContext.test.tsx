import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameProvider, useGame } from '@/src/context/GameContext';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/src/services/authService', () => ({
  authService: {
    updateGameState: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/src/services/leaderboardService', () => ({
  leaderboardService: {
    syncUserTotalXp: jest.fn().mockResolvedValue(undefined),
    recordWeeklyXp: jest.fn().mockResolvedValue(undefined),
    subscribeToLeaderboardChanges: jest.fn().mockReturnValue(() => {}),
    fetchWeeklyLeaderboard: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GameProvider>{children}</GameProvider>
);

describe('GameContext', () => {
  test('T1 – estado inicial: 5 vidas y 0 XP', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    expect(result.current.lives).toBe(5);
    expect(result.current.xp).toBe(0);
  });

  test('T2 – checkAnswer(false) descuenta 1 vida y activa isBlocked cuando vidas llegan a 0', () => {
    const { result } = renderHook(() => useGame(), { wrapper });

    act(() => result.current.checkAnswer(false));
    expect(result.current.lives).toBe(4);
    expect(result.current.isBlocked).toBe(false);

    act(() => {
      for (let i = 0; i < 4; i++) result.current.checkAnswer(false);
    });
    expect(result.current.lives).toBe(0);
    expect(result.current.isBlocked).toBe(true);
  });

  test('T3 – HYDRATE actualiza vidas, XP, gemas y racha desde el perfil de Supabase', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    act(() => {
      result.current.hydrateFromProfile({
        firebase_uid: 'uid-test',
        username: 'tester',
        avatar_url: null,
        total_xp: 120,
        created_at: '2026-09-14T00:00:00Z',
        lives: 3,
        gems: 50,
        streak_count: 7,
      });
    });
    expect(result.current.lives).toBe(3);
    expect(result.current.xp).toBe(120);
    expect(result.current.gems).toBe(50);
    expect(result.current.streakDays).toBe(7);
  });

  test('T4 – deductGems(5) descuenta 5 gemas correctamente y no baja de 0', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    const initialGems = result.current.gems;
    act(() => {
      result.current.deductGems(5);
    });
    expect(result.current.gems).toBe(initialGems - 5);
  });

  test('T5 – activateDoubleXp activa el estado hasDoubleXp con tiempo restante', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    expect(result.current.hasDoubleXp).toBe(false);

    act(() => {
      result.current.activateDoubleXp(15);
    });

    expect(result.current.hasDoubleXp).toBe(true);
    expect(result.current.doubleXpMinutesLeft).toBeGreaterThanOrEqual(14);
  });

  test('T6 – addStreakFreeze incrementa el contador de amuletos de hielo', () => {
    const { result } = renderHook(() => useGame(), { wrapper });
    const initialCount = result.current.streakFreezeCount;

    act(() => {
      result.current.addStreakFreeze();
    });

    expect(result.current.streakFreezeCount).toBe(initialCount + 1);
  });
});
