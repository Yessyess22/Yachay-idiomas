import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ImageSourcePropType } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LlamaMark } from '@/components/yachay/llama-mark';
import { Theme } from '@/constants/yachay-theme';
import { useIsTablet } from '@/hooks/use-responsive';

type YachayHeaderProps = {
  /** Shown next to the logo on tablet layouts, e.g. "Mi Perfil". */
  screenTitle?: string;
  subtitle?: string;
  xp?: number;
  onSettingsPress?: () => void;
  logoSource?: ImageSourcePropType;
};

export function YachayHeader({
  screenTitle,
  subtitle = 'Aprende quechua paso a paso',
  xp,
  onSettingsPress,
  logoSource,
}: YachayHeaderProps) {
  const isTablet = useIsTablet();

  if (isTablet) {
    return (
      <View style={styles.tabletHeader}>
        <GeometricPattern />
        <View style={styles.tabletBrandRow}>
          <LlamaMark source={logoSource} size={64} />
          <View style={styles.tabletBrandText}>
            <Text style={styles.tabletLogo}>Yachay</Text>
            <Text style={styles.tabletSubtitle}>{subtitle}</Text>
          </View>
          {screenTitle ? <Text style={styles.tabletScreenTitle}>{screenTitle}</Text> : null}
          <View style={styles.badgeRow}>
            {xp != null && <XpBadge xp={xp} />}
            <SettingsButton onPress={onSettingsPress} tone="light" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mobileHeader}>
      <View style={styles.badgeRow}>
        {xp != null && <XpBadge xp={xp} />}
        <SettingsButton onPress={onSettingsPress} tone="dark" />
      </View>
      <View style={styles.mobileBrandRow}>
        <View style={styles.mobileBrandText}>
          {screenTitle ? (
            <Text style={styles.mobileScreenTitle}>{screenTitle}</Text>
          ) : (
            <>
              <View style={styles.logoRow}>
                <Text style={styles.mobileLogo}>Yachay</Text>
                <Confetti />
              </View>
              <Text style={styles.mobileSubtitle}>{subtitle}</Text>
            </>
          )}
        </View>
        <LlamaMark source={logoSource} size={72} />
      </View>
    </View>
  );
}

/** Small colorful dots that echo the confetti accent next to the "Yachay" wordmark. */
const CONFETTI_DOTS = [
  { color: Theme.colors.accentBlue, top: 0, left: 2 },
  { color: Theme.colors.accentOrange, top: 8, left: 10 },
  { color: Theme.colors.accentGreen, top: 2, left: 16 },
  { color: Theme.colors.fireOrange, top: 12, left: 0 },
];

function Confetti() {
  return (
    <View style={styles.confetti} pointerEvents="none">
      {CONFETTI_DOTS.map((dot) => (
        <View key={dot.color} style={[styles.confettiDot, { backgroundColor: dot.color, top: dot.top, left: dot.left }]} />
      ))}
    </View>
  );
}

function XpBadge({ xp }: { xp: number }) {
  return (
    <View style={styles.xpBadge}>
      <Text style={styles.xpText}>{xp}</Text>
    </View>
  );
}

function SettingsButton({ onPress, tone }: { onPress?: () => void; tone: 'light' | 'dark' }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingsButton, tone === 'light' && styles.settingsButtonLight]}
      hitSlop={8}>
      <MaterialIcons name="settings" size={20} color={tone === 'light' ? Theme.colors.primaryDarkGreen : Theme.colors.white} />
    </Pressable>
  );
}

/** Subtle Andean-style geometric flourish in the tablet header corner. */
function GeometricPattern() {
  return (
    <View style={styles.pattern} pointerEvents="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.patternDiamond, { opacity: 0.08 + i * 0.02 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mobileHeader: {
    backgroundColor: Theme.colors.cream,
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  confetti: {
    width: 22,
    height: 20,
    marginLeft: 2,
    marginTop: -6,
  },
  confettiDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  mobileBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  mobileBrandText: { flex: 1 },
  mobileLogo: {
    ...Theme.fonts.titleLarge,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primaryDark,
  },
  mobileSubtitle: {
    ...Theme.fonts.bodyMedium,
    color: Theme.colors.textSubtitleGray,
    marginTop: 2,
  },
  mobileScreenTitle: {
    ...Theme.fonts.titleLarge,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textTitleGray,
  },
  xpBadge: {
    backgroundColor: Theme.colors.accentOrange,
    borderRadius: Theme.radius.pill,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  xpText: {
    ...Theme.fonts.label,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.white,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: Theme.radius.pill,
    backgroundColor: Theme.colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonLight: {
    backgroundColor: Theme.colors.white,
  },
  tabletHeader: {
    backgroundColor: Theme.colors.primaryDarkGreen,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.lg,
    overflow: 'hidden',
  },
  tabletBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  tabletBrandText: {},
  tabletLogo: {
    ...Theme.fonts.titleLarge,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.white,
  },
  tabletSubtitle: {
    ...Theme.fonts.bodySmall,
    color: Theme.colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
  tabletScreenTitle: {
    ...Theme.fonts.titleMedium,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.white,
    flex: 1,
    marginLeft: Theme.spacing.lg,
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  patternDiamond: {
    width: 22,
    height: 22,
    backgroundColor: Theme.colors.white,
    transform: [{ rotate: '45deg' }],
  },
});
