import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/yachay-theme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

type ExploracionLinkProps = {
  titulo: string;
  subtitulo?: string;
  icon: MaterialIconName;
  imagenSource?: ImageSourcePropType;
  onPress?: () => void;
};

export function ExploracionLink({ titulo, subtitulo, icon, imagenSource, onPress }: ExploracionLinkProps) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>
        {imagenSource ? (
          <Image source={imagenSource} style={styles.iconImage} contentFit="contain" />
        ) : (
          <MaterialIcons name={icon} size={22} color={Theme.colors.white} />
        )}
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{titulo}</Text>
        {subtitulo ? <Text style={styles.subtitle}>{subtitulo}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primaryDarkGreen,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  textCol: { flex: 1 },
  title: {
    ...Theme.fonts.bodyLarge,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textTitleGray,
  },
  subtitle: {
    ...Theme.fonts.bodySmall,
    color: Theme.colors.textSubtitleGray,
    marginTop: 1,
  },
});
