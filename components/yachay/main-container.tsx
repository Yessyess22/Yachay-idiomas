import type { PropsWithChildren } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';

import { Theme } from '@/constants/yachay-theme';

type MainContainerProps = PropsWithChildren<{
  style?: ViewStyle;
  edges?: Edge[];
}>;

export function MainContainer({ children, style, edges = ['top', 'left', 'right'] }: MainContainerProps) {
  return <SafeAreaView edges={edges} style={[styles.container, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.white,
  },
});
