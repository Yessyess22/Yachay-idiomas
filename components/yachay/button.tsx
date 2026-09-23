import { StyleSheet, Text, TouchableOpacity, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'danger' | 'teal';

const VARIANT_COLORS: Record<ButtonVariant, { bg: string; border: string }> = {
  primary: { bg: '#27AE60', border: '#1E8449' },
  danger: { bg: '#EA5455', border: '#C0392B' },
  teal: { bg: '#1B8B8C', border: '#0E4D55' },
};

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/** Botón "3D" estilo Duolingo (borde inferior grueso) usado en lección/CTAs de acción. */
export function Button({ label, onPress, variant = 'primary', disabled, style, textStyle }: ButtonProps) {
  const colors = VARIANT_COLORS[variant];
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: colors.bg, borderBottomColor: colors.border },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
  },
  disabled: {
    backgroundColor: '#D8D8D8',
    borderBottomColor: '#B0B0B0',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
