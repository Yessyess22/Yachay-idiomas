import type { ImageSourcePropType } from 'react-native';

/**
 * Slots for the Yachay mockup artwork. Every consumer component falls back to a
 * themed vector icon when a slot is `undefined`, so illustrations can be added
 * incrementally without touching component code.
 */
export const Illustrations: Record<string, ImageSourcePropType | undefined> = {
  // Yachi — mascota principal
  logoYachayConLlama: require('@/assets/images/yachi/yachi_principal.png'),
  avatarLlama: require('@/assets/images/yachi/yachi_avatar_circular.png'),
  llamaExcelente: require('@/assets/images/yachi/yachi_excelente.png'),
  llamaPiensa: require('@/assets/images/yachi/yachi_piensa.png'),
  llamaSigueAsi: require('@/assets/images/yachi/yachi_sigue_asi.png'),

  // Tarjetas e ilustraciones de fondo
  imagenPaisajePerfil: require('@/assets/images/cards/paisaje_perfil.png'),
  cardYachayMontana: require('@/assets/images/cards/tarjeta_montana.png'),
  cardYachayAzul: require('@/assets/images/cards/tarjeta_azul.png'),
  cardYachayVerde: require('@/assets/images/cards/tarjeta_verde.png'),
  iconoPalabras: require('@/assets/images/cards/tarjeta_palabras.png'),

  // Íconos de categoría (dibujados en código)
  iconoAbecedario: undefined,
  iconoNumeros: undefined,
  iconoKhipu: undefined,
};
