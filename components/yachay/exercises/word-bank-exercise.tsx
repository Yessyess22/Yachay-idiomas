import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  function handleSelectWord(word: string, index: number) {
    if (disabled) return;
    const newAvail = [...availableWords];
    newAvail.splice(index, 1);
    setAvailableWords(newAvail);
    setSelectedWords([...selectedWords, word]);
  }

  function handleDeselectWord(word: string, index: number) {
    if (disabled) return;
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  }

  function checkAnswer() {
    const userSentence = selectedWords.join(' ').trim().toLowerCase();
    const target = correctSentence.trim().toLowerCase();
    onCheck(userSentence === target);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>{prompt}</Text>

      {/* Zona de la oración armada */}
      <View style={styles.sentenceZone}>
        {selectedWords.length === 0 ? (
          <Text style={styles.placeholderText}>Toca las palabras para formar la respuesta...</Text>
        ) : (
          selectedWords.map((word, idx) => (
            <TouchableOpacity
              key={`${word}-${idx}`}
              style={styles.wordChipSelected}
              onPress={() => handleDeselectWord(word, idx)}
              disabled={disabled}
            >
              <Text style={styles.wordChipTextSelected}>{word}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.divider} />

      {/* Banco de palabras disponibles */}
      <View style={styles.bankZone}>
        {availableWords.map((word, idx) => (
          <TouchableOpacity
            key={`${word}-${idx}`}
            style={styles.wordChip}
            onPress={() => handleSelectWord(word, idx)}
            disabled={disabled}
          >
            <Text style={styles.wordChipText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.checkBtn, selectedWords.length === 0 && styles.checkBtnDisabled]}
        onPress={checkAnswer}
        disabled={disabled || selectedWords.length === 0}
      >
        <Text style={styles.checkBtnText}>Comprobar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  prompt: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 20,
  },
  sentenceZone: {
    minHeight: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  placeholderText: {
    color: '#AFB5C0',
    fontSize: 15,
    fontStyle: 'italic',
  },
  divider: {
    height: 2,
    backgroundColor: '#E5E5E5',
    marginVertical: 10,
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
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderBottomWidth: 4,
    borderBottomColor: '#CECECE',
  },
  wordChipText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3C3C3C',
  },
  wordChipSelected: {
    backgroundColor: '#DDF4FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1CB0F6',
  },
  wordChipTextSelected: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1899D6',
  },
  checkBtn: {
    backgroundColor: '#58CC02',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#46A302',
  },
  checkBtnDisabled: {
    backgroundColor: '#E5E5E5',
    borderBottomColor: '#CCCCCC',
  },
  checkBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});
