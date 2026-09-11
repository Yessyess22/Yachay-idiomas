import { Fragment, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { ExploracionLink } from '@/components/yachay/exploracion-link';
import { MainContainer } from '@/components/yachay/main-container';
import { YachayHeader } from '@/components/yachay/yachay-header';
import { Illustrations } from '@/constants/illustrations';
import { Theme } from '@/constants/yachay-theme';
import { useIsTablet } from '@/hooks/use-responsive';

const TOPICS = [
  {
    key: 'khipu',
    titulo: '¿Qué es el Quechua?',
    subtitulo: 'Khipu',
    icon: 'account-balance' as const,
    imagenSource: Illustrations.iconoKhipu,
    body: 'El Quechua o Runasimi ("habla de la gente") es la familia lingüística nativa más hablada en las Américas, con más de 8 millones de hablantes en Perú, Bolivia, Ecuador, Colombia y Argentina.',
  },
  {
    key: 'alfabeto',
    titulo: 'Alfabeto y Vocales',
    icon: 'format-list-numbered' as const,
    imagenSource: Illustrations.iconoNumeros,
    body: 'El quechua estándar utiliza 3 vocales básicas: A, I, U. En la variante trivocálica oficial del Perú, las vocales e/o aparecen como alófonos en contacto con consonantes uvulares (q, qh, q\').',
  },
  {
    key: 'palabras',
    titulo: 'Palabras',
    subtitulo: 'Allillanchu',
    icon: 'chat-bubble-outline' as const,
    imagenSource: Illustrations.iconoPalabras,
    body: 'En Yachay avanzas por categorías temáticas (Abecedario, Números, Palabras clave), acumulando XP y completando exámenes al final de cada nivel.',
  },
];

export default function ExploreScreen() {
  const isTablet = useIsTablet();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  return (
    <MainContainer>
      <YachayHeader screenTitle="Explora el Quechua" logoSource={Illustrations.logoYachayConLlama} />

      <ScrollView contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}>
        <Text style={styles.intro}>
          Bienvenido al centro de información de Yachay. Aquí aprenderás sobre la historia, variantes y riqueza
          cultural del idioma quechua.
        </Text>

        {TOPICS.map((topic) => (
          <Fragment key={topic.key}>
            <ExploracionLink
              titulo={topic.titulo}
              subtitulo={topic.subtitulo}
              icon={topic.icon}
              imagenSource={topic.imagenSource}
              onPress={() => setExpandedKey(expandedKey === topic.key ? null : topic.key)}
            />
            {expandedKey === topic.key && <Text style={styles.body}>{topic.body}</Text>}
          </Fragment>
        ))}
      </ScrollView>
    </MainContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  contentTablet: {
    paddingHorizontal: Theme.spacing.xl,
    maxWidth: 560,
  },
  intro: {
    ...Theme.fonts.bodyMedium,
    color: Theme.colors.textSubtitleGray,
    marginBottom: Theme.spacing.lg,
  },
  body: {
    ...Theme.fonts.bodySmall,
    color: Theme.colors.textSubtitleGray,
    marginTop: -Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    marginLeft: 56,
  },
});
