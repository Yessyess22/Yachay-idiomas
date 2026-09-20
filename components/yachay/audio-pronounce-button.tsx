import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { playQuechuaAudio } from '@/src/services/voiceService';

interface AudioPronounceButtonProps {
  text: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showLabel?: boolean;
}

const TEAL = '#1B8B8C';

export function AudioPronounceButton({
  text,
  size = 'medium',
  style,
  showLabel = false,
}: AudioPronounceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  async function handlePress() {
    if (isPlaying || !text) return;
    setIsPlaying(true);
    // Feedback táctil suave al tocar el botón
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await playQuechuaAudio(text);
    } finally {
      setTimeout(() => {
        setIsPlaying(false);
      }, 1200);
    }
  }

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        isSmall && styles.buttonSmall,
        isLarge && styles.buttonLarge,
        isPlaying && styles.buttonPlaying,
        style,
      ]}
      onPress={handlePress}
      disabled={isPlaying}
      activeOpacity={0.7}
    >
      {isPlaying ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text style={[styles.iconText, isSmall && styles.iconSmall, isLarge && styles.iconLarge]}>
          🔊
        </Text>
      )}
      {showLabel && (
        <Text style={[styles.labelText, isPlaying && styles.labelPlaying]}>
          {isPlaying ? 'Pronunciando...' : 'Escuchar'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2F1',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: TEAL,
    gap: 6,
  },
  buttonSmall: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  buttonLarge: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  buttonPlaying: {
    backgroundColor: TEAL,
    borderColor: '#136566',
  },
  iconText: {
    fontSize: 16,
  },
  iconSmall: {
    fontSize: 12,
  },
  iconLarge: {
    fontSize: 22,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEAL,
  },
  labelPlaying: {
    color: '#FFFFFF',
  },
});
