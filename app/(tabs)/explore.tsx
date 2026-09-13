import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { useRouter } from 'expo-router';

const TEAL = '#1B8B8C';
const CREAM = '#FAF7F2';

/* ─── Datos estáticos ─── */
interface GlossaryWord {
  qu: string;
  es: string;
  phonetic: string;
  category: string;
}

interface StoryCard {
  id: number;
  title: string;
  quechuaTitle: string;
  level: string;
  icon: string;
  description: string;
}

interface StudyModule {
  id: string;
  title: string;
  description: string;
  accentColor: string;
  icon: any;
  totalLessons: number;
  doneLessons: number;
  categorySlug: string;
}

const GLOSSARY_DATA: GlossaryWord[] = [
  { qu: 'Allinllachu', es: '¿Cómo estás? / Hola',       phonetic: 'ah-yeen-yah-choo',       category: 'Saludos' },
  { qu: 'Allinmi',     es: 'Estoy bien',                 phonetic: 'ah-yeen-mee',             category: 'Saludos' },
  { qu: 'Añay',        es: 'Gracias',                    phonetic: 'ah-nyahy',                category: 'Cortesía' },
  { qu: 'Inti',        es: 'Sol',                        phonetic: 'een-tee',                 category: 'Naturaleza' },
  { qu: 'Killa',       es: 'Luna',                       phonetic: 'keel-yah',               category: 'Naturaleza' },
  { qu: 'Mayu',        es: 'Río',                        phonetic: 'mah-yoo',                category: 'Naturaleza' },
  { qu: 'Wasi',        es: 'Casa',                       phonetic: 'wah-see',                category: 'Objetos' },
  { qu: 'Allqo',       es: 'Perro',                      phonetic: 'ahl-kyoh',               category: 'Animales' },
  { qu: 'Michi',       es: 'Gato',                       phonetic: 'mee-chee',               category: 'Animales' },
  { qu: 'Urpi',        es: 'Paloma',                     phonetic: 'oor-pee',                category: 'Animales' },
  { qu: 'Sumaq',       es: 'Hermoso / Delicioso',        phonetic: 'soo-mahq',               category: 'Adjetivos' },
  { qu: 'Munay',       es: 'Amar / Querer',              phonetic: 'moo-nahy',               category: 'Verbos' },
  { qu: 'Tupananchiskama', es: 'Hasta volver a vernos', phonetic: 'too-pah-nahn-chees-kah-mah', category: 'Despedidas' },
];

const STORIES_DATA: StoryCard[] = [
  {
    id: 1,
    title: 'El Zorro y el Cóndor',
    quechuaTitle: 'Atoqmantawan Kunturmantawan',
    level: 'Principiante',
    icon: '🦊🦅',
    description: 'Acompaña al zorro en su aventura hacia la fiesta de las nubes.',
  },
  {
    id: 2,
    title: 'La Leyenda de Manco Cápac',
    quechuaTitle: 'Manco Cápac Mama Ocllo-wan',
    level: 'Intermedio',
    icon: '☀️👑',
    description: 'Descubre cómo nació el gran Imperio del Tawantinsuyu.',
  },
  {
    id: 3,
    title: 'El Buen Vivir (Sumaq Kawsay)',
    quechuaTitle: 'Sumaq Kawsaymanta',
    level: 'Avanzado',
    icon: '🌿🏔️',
    description: 'Aprende los principios ancestrales de armonía con la Pachamama.',
  },
];

const MODULES: StudyModule[] = [
  {
    id: 'vocabulario', title: 'Vocabulario Andino',
    description: 'Palabras del hogar, naturaleza y comida',
    accentColor: TEAL,
    icon: require('@/assets/images/categorias/cat_vocabulario.png'),
    totalLessons: 24, doneLessons: 8, categorySlug: 'palabras',
  },
  {
    id: 'gramatica', title: 'Estructura Gramatical',
    description: 'Raíces, sufijos y orden oracional',
    accentColor: '#E5771A',
    icon: require('@/assets/images/categorias/cat_gramatica.png'),
    totalLessons: 20, doneLessons: 4, categorySlug: 'abecedario',
  },
  {
    id: 'fonetica', title: 'Fonética & Habla',
    description: 'Sonidos glotalizados y acento quechua',
    accentColor: '#1A6BE5',
    icon: require('@/assets/images/categorias/cat_pronunciacion.png'),
    totalLessons: 15, doneLessons: 2, categorySlug: 'abecedario',
  },
  {
    id: 'dialogos', title: 'Diálogos Cotidianos',
    description: 'Conversaciones en mercado y comunidad',
    accentColor: '#2BA84A',
    icon: require('@/assets/images/categorias/cat_dialogos.png'),
    totalLessons: 12, doneLessons: 1, categorySlug: 'palabras',
  },
];

type MainTab = 'modules' | 'dictionary' | 'stories';

export default function ExploreScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MainTab>('modules');
  const [search, setSearch] = useState('');

  const filteredWords = GLOSSARY_DATA.filter(
    (w) =>
      w.qu.toLowerCase().includes(search.toLowerCase()) ||
      w.es.toLowerCase().includes(search.toLowerCase())
  );

  const TABS: { key: MainTab; label: string }[] = [
    { key: 'modules',    label: '📚 Módulos' },
    { key: 'dictionary', label: '📖 Glosario' },
    { key: 'stories',    label: '📜 Historias' },
  ];

  return (
    <View style={styles.container}>
      <YachayTopBar />

      {/* Selector de pestañas */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── MÓDULOS ── */}
        {activeTab === 'modules' && (
          <View>
            <Text style={styles.sectionTitle}>Módulos de Estudio</Text>
            <Text style={styles.sectionSubtitle}>Elige el área que deseas reforzar hoy</Text>
            {MODULES.map((mod) => {
              const pct = Math.round((mod.doneLessons / mod.totalLessons) * 100);
              return (
                <TouchableOpacity
                  key={mod.id}
                  style={styles.moduleCard}
                  onPress={() => router.push({ pathname: '/category/[slug]' as any, params: { slug: mod.categorySlug } })}
                  activeOpacity={0.82}
                >
                  <View style={[styles.accentBar, { backgroundColor: mod.accentColor }]} />
                  <Image source={mod.icon} style={styles.moduleIcon} />
                  <View style={styles.moduleBody}>
                    <Text style={styles.moduleTitle}>{mod.title}</Text>
                    <Text style={styles.moduleDesc}>{mod.description}</Text>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: mod.accentColor }]} />
                      </View>
                      <Text style={styles.progressLabel}>{mod.doneLessons}/{mod.totalLessons}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── GLOSARIO ── */}
        {activeTab === 'dictionary' && (
          <View>
            <Text style={styles.sectionTitle}>Glosario Quechua – Español 🔍</Text>
            <Text style={styles.sectionSubtitle}>
              Busca palabras o expresiones para conocer su pronunciación y significado.
            </Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar en Quechua o Español..."
              placeholderTextColor="#9B8B7A"
              value={search}
              onChangeText={setSearch}
            />
            {filteredWords.map((word, i) => (
              <View key={i} style={styles.wordCard}>
                <View style={styles.wordMain}>
                  <Text style={styles.wordQuechua}>{word.qu}</Text>
                  <Text style={styles.wordSpanish}>{word.es}</Text>
                  <Text style={styles.wordPhonetic}>🔊 [{word.phonetic}]</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{word.category}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── HISTORIAS ── */}
        {activeTab === 'stories' && (
          <View>
            <Text style={styles.sectionTitle}>Cuentos e Historias Andinas 📖</Text>
            <Text style={styles.sectionSubtitle}>
              Lee diálogos interactivos en Quechua y mejora tu comprensión lectora.
            </Text>
            {STORIES_DATA.map((story) => (
              <TouchableOpacity key={story.id} style={styles.storyCard} activeOpacity={0.82}>
                <Text style={styles.storyIcon}>{story.icon}</Text>
                <View style={styles.storyBody}>
                  <Text style={styles.storyLevel}>{story.level}</Text>
                  <Text style={styles.storyTitle}>{story.title}</Text>
                  <Text style={styles.storyQuechua}>{story.quechuaTitle}</Text>
                  <Text style={styles.storyDesc}>{story.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },

  /* Tab bar interior */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D9',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F2EDE6',
  },
  tabBtnActive: {
    backgroundColor: TEAL,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7A6A5A',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  content: { padding: 16, paddingBottom: 48 },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2A1A0A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8A7A6A',
    marginBottom: 16,
    lineHeight: 19,
  },

  /* Módulos */
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECE6DE',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  accentBar: { width: 6, alignSelf: 'stretch', minHeight: 90 },
  moduleIcon: { width: 64, height: 64, resizeMode: 'contain', margin: 12, marginLeft: 10 },
  moduleBody: { flex: 1, paddingVertical: 14, paddingRight: 14 },
  moduleTitle: { fontSize: 16, fontWeight: '900', color: '#2A1A0A', marginBottom: 3 },
  moduleDesc: { fontSize: 13, color: '#7A6A5A', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBg: { flex: 1, height: 8, backgroundColor: '#EDE8E0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { fontSize: 12, fontWeight: '800', color: '#7A6A5A', flexShrink: 0 },

  /* Glosario */
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E8E2D9',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#2A1A0A',
    marginBottom: 14,
  },
  wordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECE6DE',
  },
  wordMain: { flex: 1 },
  wordQuechua: { fontSize: 17, fontWeight: '900', color: TEAL },
  wordSpanish: { fontSize: 14, fontWeight: '700', color: '#2A1A0A', marginTop: 2 },
  wordPhonetic: { fontSize: 12, color: '#1CB0F6', marginTop: 3 },
  categoryBadge: {
    backgroundColor: '#E4F4F4',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#B2DFDB',
  },
  categoryText: { color: '#00695C', fontSize: 11, fontWeight: '800' },

  /* Historias */
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECE6DE',
    alignItems: 'center',
    elevation: 1,
  },
  storyIcon: { fontSize: 40, marginRight: 14 },
  storyBody: { flex: 1 },
  storyLevel: { fontSize: 11, fontWeight: '900', color: '#E5A00D', letterSpacing: 0.8, marginBottom: 2 },
  storyTitle: { fontSize: 17, fontWeight: '800', color: '#2A1A0A' },
  storyQuechua: { fontSize: 13, fontWeight: '700', color: TEAL, fontStyle: 'italic', marginBottom: 3 },
  storyDesc: { fontSize: 13, color: '#7A6A5A', lineHeight: 18 },
});
