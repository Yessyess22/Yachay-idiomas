import { createContext, ReactNode, useCallback, useContext, useReducer } from 'react';

const INITIAL_LIVES = 5;
const XP_PER_CORRECT = 10;

type GameState = {
  lives: number;
  xp: number;
  streakDays: number;
  isBlocked: boolean;
};

type GameAction =
  | { type: 'CORRECT_ANSWER' }
  | { type: 'WRONG_ANSWER' }
  | { type: 'RESTORE_LIVES' };

type GameContextType = GameState & {
  checkAnswer: (isCorrect: boolean) => void;
  restoreLives: () => void;
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CORRECT_ANSWER':
      return { ...state, xp: state.xp + XP_PER_CORRECT };
    case 'WRONG_ANSWER': {
      const newLives = state.lives - 1;
      return { ...state, lives: newLives, isBlocked: newLives <= 0 };
    }
    case 'RESTORE_LIVES':
      return { ...state, lives: INITIAL_LIVES, isBlocked: false };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    lives: INITIAL_LIVES,
    xp: 0,
    streakDays: 1,
    isBlocked: false,
  });

  const checkAnswer = useCallback((isCorrect: boolean) => {
    dispatch({ type: isCorrect ? 'CORRECT_ANSWER' : 'WRONG_ANSWER' });
  }, []);

  const restoreLives = useCallback(() => {
    dispatch({ type: 'RESTORE_LIVES' });
  }, []);

  return (
    <GameContext.Provider value={{ ...state, checkAnswer, restoreLives }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider');
  return ctx;
}
