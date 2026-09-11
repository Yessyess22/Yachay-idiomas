import type { ImageSourcePropType } from 'react-native';

/**
 * Slots for the Yachay mockup artwork. Every consumer component falls back to a
 * themed vector icon when a slot is `undefined`, so illustrations can be added
 * incrementally without touching component code.
 */
export const Illustrations: Record<string, ImageSourcePropType | undefined> = {
  logoYachayConLlama: require('@/assets/images/llama_header.png'),
  avatarLlama: require('@/assets/images/llama_avatar.png'),
  iconoPalabras: require('@/assets/images/card_palabras.png'),
  imagenPaisajePerfil: require('@/assets/images/paisaje_perfil.png'),
  cardYachayMontana: require('@/assets/images/card_montana.png'),
  cardYachayAzul: require('@/assets/images/card_azul.png'),
  llamaExcelente: require('@/assets/images/llama_excelente.png'),
  llamaPiensa: require('@/assets/images/llama_piensa.png'),
  llamaSigueAsi: require('@/assets/images/llama_sigue_asi.png'),
  iconoAbecedario: undefined, // dibujado en código en CategoriaCard (glyph "A")
  iconoNumeros: undefined, // dibujado en código en CategoriaCard (glyph "1,2,3")
  iconoKhipu: undefined, // assets/images/icono_khipu.png
};
