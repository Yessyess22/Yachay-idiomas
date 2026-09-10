import { StyleSheet, View } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExploreScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#d7ffb8', dark: '#1e3a1e' }}
      headerImage={
        <IconSymbol
          size={250}
          color="#58cc02"
          name="paperplane.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explora el Quechua</ThemedText>
      </ThemedView>
      <ThemedText>
        Bienvenido al centro de información de Yachay. Aquí aprenderás sobre la historia, variantes y riqueza cultural del idioma quechua.
      </ThemedText>

      <Collapsible title="¿Qué es el Quechua (Runasimi)?">
        <ThemedText>
          El Quechua o Runasimi (&quot;habla de la gente&quot;) es la familia lingüística nativa más hablada en las Américas, con más de 8 millones de hablantes en Perú, Bolivia, Ecuador, Colombia y Argentina.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Alfabeto y Vocales">
        <ThemedText>
          El quechua estándar utiliza 3 vocales básicas: <ThemedText type="defaultSemiBold">A, I, U</ThemedText>.
          En la variante trivocalica oficial del Perú, las vocales e/o aparecen como alófonos en contacto con consonantes uvulares (q, qh, q&apos;).
        </ThemedText>
      </Collapsible>

      <Collapsible title="Sistema de Aprendizaje Yachay">
        <ThemedText>
          En Yachay avanzas por categorías temáticas (Abecedario, Números, Palabras clave), acumulando XP y completando exámenes al final de cada nivel.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#58cc02',
    bottom: -40,
    left: -20,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
});
