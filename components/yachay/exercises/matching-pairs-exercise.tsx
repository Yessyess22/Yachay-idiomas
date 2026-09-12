import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PairItem {
  id: string;
  text: string;
  matchId: string;
  lang: 'qu' | 'es';
}

interface MatchingPairsProps {
  pairs: { qu: string; es: string }[];
  onComplete: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function MatchingPairsExercise({ pairs, onComplete, disabled }: MatchingPairsProps) {
  const [selectedQuechua, setSelectedQuechua] = useState<PairItem | null>(null);
  const [selectedSpanish, setSelectedSpanish] = useState<PairItem | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [errorPair, setErrorPair] = useState<string | null>(null);

  const quechuaItems: PairItem[] = pairs.map((p, i) => ({
    id: `qu-${i}`,
    text: p.qu,
    matchId: `pair-${i}`,
    lang: 'qu' as const,
  }));

  const spanishItems: PairItem[] = pairs
    .map((p, i) => ({
      id: `es-${i}`,
      text: p.es,
      matchId: `pair-${i}`,
      lang: 'es' as const,
    }))
    .sort(() => Math.random() - 0.5);

  function handleSelect(item: PairItem) {
    if (disabled || matchedIds.has(item.matchId)) return;
    setErrorPair(null);

    if (item.lang === 'qu') {
      setSelectedQuechua(item);
      if (selectedSpanish) {
        checkMatch(item, selectedSpanish);
      }
    } else {
      setSelectedSpanish(item);
      if (selectedQuechua) {
        checkMatch(selectedQuechua, item);
      }
    }
  }

  function checkMatch(qItem: PairItem, esItem: PairItem) {
    if (qItem.matchId === esItem.matchId) {
      const newMatched = new Set(matchedIds);
      newMatched.add(qItem.matchId);
      setMatchedIds(newMatched);
      setSelectedQuechua(null);
      setSelectedSpanish(null);

      if (newMatched.size === pairs.length) {
        onComplete(true);
      }
    } else {
      setErrorPair(qItem.matchId);
      setTimeout(() => {
        setSelectedQuechua(null);
        setSelectedSpanish(null);
        setErrorPair(null);
      }, 800);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Toca los pares que se corresponden 🧩</Text>

      <View style={styles.columnsContainer}>
        {/* Columna Quechua */}
        <View style={styles.column}>
          {quechuaItems.map((item) => {
            const isMatched = matchedIds.has(item.matchId);
            const isSelected = selectedQuechua?.id === item.id;
            const isError = errorPair === item.matchId;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  isMatched && styles.cardMatched,
                  isError && styles.cardError,
                ]}
                onPress={() => handleSelect(item)}
                disabled={disabled || isMatched}
              >
                <Text
                  style={[
                    styles.cardText,
                    isSelected && styles.cardTextSelected,
                    isMatched && styles.cardTextMatched,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Columna Español */}
        <View style={styles.column}>
          {spanishItems.map((item) => {
            const isMatched = matchedIds.has(item.matchId);
            const isSelected = selectedSpanish?.id === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                  isMatched && styles.cardMatched,
                ]}
                onPress={() => handleSelect(item)}
                disabled={disabled || isMatched}
              >
                <Text
                  style={[
                    styles.cardText,
                    isSelected && styles.cardTextSelected,
                    isMatched && styles.cardTextMatched,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 20,
    textAlign: 'center',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderBottomWidth: 4,
    borderBottomColor: '#CECECE',
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#1CB0F6',
    backgroundColor: '#DDF4FF',
  },
  cardMatched: {
    borderColor: '#58CC02',
    backgroundColor: '#E8F5E9',
    opacity: 0.6,
  },
  cardError: {
    borderColor: '#FF4B4B',
    backgroundColor: '#FFEBEE',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3C3C3C',
  },
  cardTextSelected: {
    color: '#1899D6',
  },
  cardTextMatched: {
    color: '#2E7D32',
  },
});
