import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Theme } from '@/constants/yachay-theme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

type CategoriaCardProps = {
  titulo: string;
  subtitulo?: string;
  imagenSource?: ImageSourcePropType;
  fallbackIcon: MaterialIconName;
  fallbackColor: string;
  onPress?: () => void;
  /** Position in the list, used to stagger the entrance animation. */
  index?: number;
  /** Short glyph (e.g. "A" or "1,2,3") drawn on a colored tile instead of an image/icon. */
  glyph?: string;
  /** Small llama badge peeking from the corner of the glyph tile, like in the reference art. */
  cornerLlama?: ImageSourcePropType;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CategoriaCard({
  titulo,
  subtitulo,
  imagenSource,
  fallbackIcon,
  fallbackColor,
  onPress,
  index = 0,
  glyph,
  cornerLlama,
}: CategoriaCardProps) {
  const pressed = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 0.97 : 1, { duration: 120 }) }],
  }));

  return (
    <Animated.View entering={FadeInUp.delay(index * 90).springify().damping(14)}>
      <AnimatedPressable
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
        onPress={onPress}
        style={[styles.card, pressStyle]}>
        <View style={[styles.thumb, { backgroundColor: glyph ? fallbackColor : fallbackColor + '1F' }]}>
          {glyph ? (
            <>
              <Text style={styles.glyphText} numberOfLines={1} adjustsFontSizeToFit>
                {glyph}
              </Text>
              {cornerLlama ? <Image source={cornerLlama} style={styles.cornerLlama} contentFit="cover" /> : null}
            </>
          ) : imagenSource ? (
            <Image source={imagenSource} style={styles.thumbImage} contentFit="cover" />
          ) : (
            <MaterialIcons name={fallbackIcon} size={30} color={fallbackColor} />
          )}
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{titulo}</Text>
          {subtitulo ? <Text style={styles.subtitle}>{subtitulo}</Text> : null}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.secondaryGray,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    gap: Theme.spacing.md,
    ...Theme.shadow,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.radius.md,
  },
  glyphText: {
    ...Theme.fonts.titleMedium,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.white,
  },
  cornerLlama: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: Theme.radius.pill,
    borderWidth: 2,
    borderColor: Theme.colors.white,
  },
  textCol: {
    flex: 1,
  },
  title: {
    ...Theme.fonts.titleSmall,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textTitleGray,
  },
  subtitle: {
    ...Theme.fonts.bodySmall,
    color: Theme.colors.textSubtitleGray,
    marginTop: 2,
  },
});
