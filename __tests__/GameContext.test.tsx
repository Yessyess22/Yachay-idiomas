import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameProvider, useGame } from '@/src/context/GameContext';

jest.mock('@/src/services/authService', () => ({
  authService: {
    updateGameState: jest.fn().mockResolvedValue(undefined),
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
});
