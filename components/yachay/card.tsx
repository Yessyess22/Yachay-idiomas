import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
}>;

/** Tarjeta blanca con borde y sombra suave usada en profile/shop/index/lesson. */
export function Card({ children, style, padding = 16, radius = 18 }: CardProps) {
  return <View style={[styles.card, { padding, borderRadius: radius }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
});
