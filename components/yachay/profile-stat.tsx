import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/yachay-theme';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

type ProfileStatProps = {
  icon: MaterialIconName;
  iconColor: string;
  value: string | number;
  label: string;
};

export function ProfileStat({ icon, iconColor, value, label }: ProfileStatProps) {
  return (
    <View style={styles.stat}>
      <View style={styles.valueRow}>
        <MaterialIcons name={icon} size={18} color={iconColor} />
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: { alignItems: 'center' },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    ...Theme.fonts.titleSmall,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textTitleGray,
  },
  label: {
    ...Theme.fonts.bodySmall,
    color: Theme.colors.textSubtitleGray,
    marginTop: 2,
  },
});
