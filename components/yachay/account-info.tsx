import { StyleSheet, Text, View } from 'react-native';

import { Theme } from '@/constants/yachay-theme';

type AccountInfoRow = { label: string; value: string };

type AccountInfoProps = {
  title?: string;
  rows: AccountInfoRow[];
};

export function AccountInfo({ title = 'Información de la Cuenta', rows }: AccountInfoProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {rows.map((row) => (
        <View style={styles.row} key={row.label}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.md,
    borderWidth: 1,
    borderColor: Theme.colors.cardBorder,
    padding: Theme.spacing.md,
  },
  title: {
    ...Theme.fonts.bodyMedium,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textTitleGray,
    marginBottom: Theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xs + 2,
  },
  label: {
    ...Theme.fonts.bodySmall,
    color: Theme.colors.textSubtitleGray,
  },
  value: {
    ...Theme.fonts.bodySmall,
    fontWeight: Theme.fontWeight.semibold,
    color: Theme.colors.textTitleGray,
    maxWidth: '60%',
  },
});
