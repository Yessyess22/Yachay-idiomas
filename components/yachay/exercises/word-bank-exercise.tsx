import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { playTapSound } from '@/src/services/soundService';

interface WordBankProps {
  prompt: string;
  correctSentence: string;
  words: string[];
  onCheck: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function WordBankExercise({
  prompt,
  correctSentence,
  words,
  onCheck,
  disabled,
}: WordBankProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>(words);

  const targetWordCount = correctSentence.trim().split(/\s+/).length;

  function handleSelectWord(word: string, index: number) {
    if (disabled) return;
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newAvail = [...availableWords];
    newAvail.splice(index, 1);
    setAvailableWords(newAvail);
    setSelectedWords((prev) => [...prev, word]);
  }

  function handleDeselectWord(word: string, index: number) {
    if (disabled) return;
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords((prev) => [...prev, word]);
  }

  function handleClearAll() {
    if (disabled || selectedWords.length === 0) return;
    playTapSound();
    setAvailableWords([...availableWords, ...selectedWords]);
    setSelectedWords([]);
  }

  function checkAnswer() {
    playTapSound();
    const userSentence = selectedWords.join(' ').trim().toLowerCase();
    const target = correctSentence.trim().toLowerCase();
    onCheck(userSentence === target);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.prompt}>{prompt}</Text>
        {selectedWords.length > 0 && !disabled && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>🧹 Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Zona de ranuras / slots de la oración */}
      <View style={styles.sentenceZone}>
        {selectedWords.length === 0 ? (
          <View style={styles.emptySlotContainer}>
            {Array.from({ length: targetWordCount }).map((_, idx) => (
              <View key={`empty-slot-${idx}`} style={styles.emptySlot}>
                <Text style={styles.emptySlotNumber}>{idx + 1}</Text>
              </View>
            ))}
            <Text style={styles.placeholderText}>Toca las palabras para colocarlas en orden</Text>
          </View>
        ) : (
          selectedWords.map((word, idx) => (
            <TouchableOpacity
              key={`${word}-${idx}`}
              style={styles.wordChipSelected}
              onPress={() => handleDeselectWord(word, idx)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <Text style={styles.wordChipIndexBadge}>{idx + 1}</Text>
              <Text style={styles.wordChipTextSelected}>{word}</Text>
              <Text style={styles.removeIcon}>✕</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.divider} />

      {/* Banco de palabras disponibles */}
      <Text style={styles.bankLabel}>Fichas disponibles:</Text>
      <View style={styles.bankZone}>
        {availableWords.map((word, idx) => (
          <TouchableOpacity
            key={`${word}-${idx}`}
            style={styles.wordChip}
            onPress={() => handleSelectWord(word, idx)}
            disabled={disabled}
            activeOpacity={0.75}
          >
            <Text style={styles.wordChipText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, selectedWords.length === 0 && styles.checkBtnDisabled]}
        onPress={checkAnswer}
        disabled={disabled || selectedWords.length === 0}
        activeOpacity={0.85}
      >
        <Text style={styles.checkBtnText}>Comprobar Frase ➔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3C3C3C',
    flex: 1,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  sentenceZone: {
    minHeight: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  emptySlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  emptySlot: {
    width: 48,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptySlotNumber: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  bankLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 10,
  },
  bankZone: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  wordChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
  },
  wordChipText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  wordChipSelected: {
    backgroundColor: '#E8F8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00C853',
    borderBottomWidth: 4,
    borderBottomColor: '#009624',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wordChipIndexBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00C853',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  wordChipTextSelected: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00701A',
  },
  removeIcon: {
    fontSize: 11,
    color: '#FF3366',
    fontWeight: '900',
    marginLeft: 2,
  },
  checkBtn: {
    backgroundColor: '#00C853',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#009624',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  checkBtnDisabled: {
    backgroundColor: '#E5E7EB',
    borderBottomColor: '#CBD5E1',
    shadowOpacity: 0,
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
