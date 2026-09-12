import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';

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

const GLOSSARY_DATA: GlossaryWord[] = [
  { qu: 'Allinllachu', es: '¿Cómo estás? / Hola', phonetic: 'ah-yeen-yah-choo', category: 'Saludos' },
  { qu: 'Allinmi', es: 'Estoy bien', phonetic: 'ah-yeen-mee', category: 'Saludos' },
  { qu: 'Añay / Sulpayki', es: 'Gracias', phonetic: 'ah-nyahy', category: 'Cortesía' },
  { qu: 'Inti', es: 'Sol', phonetic: 'een-tee', category: 'Naturaleza' },
  { qu: 'Killa', es: 'Luna', phonetic: 'keel-yah', category: 'Naturaleza' },
  { qu: 'Mayu', es: 'Río', phonetic: 'mah-yoo', category: 'Naturaleza' },
  { qu: 'Wasi', es: 'Casa', phonetic: 'wah-see', category: 'Objetos' },
  { qu: 'Allqo', es: 'Perro', phonetic: 'ahl-kyoh', category: 'Animales' },
  { qu: 'Michi', es: 'Gato', phonetic: 'mee-chee', category: 'Animales' },
  { qu: 'Urpi', es: 'Paloma', phonetic: 'oor-pee', category: 'Animales' },
  { qu: 'Sumaq', es: 'Hermoso / Delicioso', phonetic: 'soo-mahq', category: 'Adjetivos' },
  { qu: 'Munay', es: 'Amar / Querer', phonetic: 'moo-nahy', category: 'Verbos' },
  { qu: 'Tupananchiskama', es: 'Hasta volver a encontrarnos', phonetic: 'too-pah-nahn-chees-kah-mah', category: 'Despedidas' },
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

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'dictionary' | 'stories'>('dictionary');
  const [selectedStory, setSelectedStory] = useState<StoryCard | null>(null);

  const filteredWords = GLOSSARY_DATA.filter(
    (w) =>
      w.qu.toLowerCase().includes(search.toLowerCase()) ||
      w.es.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <YachayTopBar />

      {/* Selector de Pestañas: Diccionario vs Historias */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'dictionary' && styles.tabBtnActive]}
          onPress={() => setActiveTab('dictionary')}
        >
          <Text style={[styles.tabText, activeTab === 'dictionary' && styles.tabTextActive]}>
            📖 Diccionario
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'stories' && styles.tabBtnActive]}
          onPress={() => setActiveTab('stories')}
        >
          <Text style={[styles.tabText, activeTab === 'stories' && styles.tabTextActive]}>
            📚 Historias (Stories)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'dictionary' ? (
          <View>
            <Text style={styles.sectionTitle}>Glosario Quechua - Español 🔍</Text>
            <Text style={styles.sectionSubtitle}>
              Busca cualquier palabra o expresión para conocer su pronunciación y significado.
            </Text>

            {/* Buscador */}
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar palabra en Quechua o Español..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />

            {/* Listado de palabras */}
            {filteredWords.map((word, index) => (
              <View key={index} style={styles.wordCard}>
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
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Cuentos e Historias Andinas 📖</Text>
            <Text style={styles.sectionSubtitle}>
              Lee diálogos interactivos en Quechua y mejora tu comprensión lectora.
            </Text>

            {STORIES_DATA.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                onPress={() => setSelectedStory(story)}
                activeOpacity={0.8}
              >
                <Text style={styles.storyIcon}>{story.icon}</Text>
                <View style={styles.storyContent}>
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
  container: {
    flex: 1,
    backgroundColor: '#F7F9FA',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#58CC02',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#777777',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3C3C3C',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 16,
    lineHeight: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: '#3C3C3C',
    marginBottom: 16,
  },
  wordCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  wordMain: {
    flex: 1,
  },
  wordQuechua: {
    fontSize: 18,
    fontWeight: '900',
    color: '#58CC02',
  },
  wordSpanish: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C3C3C',
    marginTop: 2,
  },
  wordPhonetic: {
    fontSize: 13,
    color: '#1CB0F6',
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: '#F1F8E9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  categoryText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '800',
  },
  storyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  storyIcon: {
    fontSize: 42,
    marginRight: 14,
  },
  storyContent: {
    flex: 1,
  },
  storyLevel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FF9600',
    letterSpacing: 1,
    marginBottom: 2,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3C3C3C',
  },
  storyQuechua: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1CB0F6',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  storyDesc: {
    fontSize: 13,
    color: '#777777',
    lineHeight: 18,
  },
});
