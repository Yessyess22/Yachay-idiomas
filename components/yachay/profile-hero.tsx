import { Image } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/yachay-theme';

type ProfileHeroProps = {
  avatarSource?: ImageSourcePropType;
  landscapeSource?: ImageSourcePropType;
};

export function ProfileHero({ avatarSource, landscapeSource }: ProfileHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.landscape}>
        {landscapeSource ? (
          <Image source={landscapeSource} style={styles.landscapeImage} contentFit="contain" contentPosition="center" />
        ) : null}
      </View>
      <View style={styles.avatarWrap}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <Text style={styles.avatarFallback}>🦙</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
    ...Theme.shadow,
  },
  landscape: {
    height: 120,
    backgroundColor: Theme.colors.primaryDarkGreen,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeImage: {
    width: '70%',
    height: '100%',
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.secondaryGray,
    borderWidth: 4,
    borderColor: Theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: -40,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    fontSize: 36,
  },
});
