import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type ProgressBarProps = {
  /** Progreso de 0 a 100. */
  progress: number;
  height?: number;
  color?: string;
  trackColor?: string;
  /** Punto indicador redondo al extremo de la barra (usado en la Meta Diaria del home). */
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
};

const DOT_SIZE = 10;

/** Barra de progreso reutilizada en home (meta diaria), perfil (misiones) y lección. */
export function ProgressBar({
  progress,
  height = 8,
  color = '#00C853',
  trackColor = '#EAE3D6',
  showDot = false,
  style,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
        style,
      ]}
    >
      <View style={[styles.fill, { width: `${pct}%`, borderRadius: height / 2, backgroundColor: color }]} />
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              left: `${Math.max(0, Math.min(100 - DOT_SIZE, pct - 4))}%`,
              top: (height - DOT_SIZE) / 2,
              backgroundColor: color,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
