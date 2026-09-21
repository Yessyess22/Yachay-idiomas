import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { YachayTopBar } from '@/components/yachay/yachay-top-bar';
import { AudioPronounceButton } from '@/components/yachay/audio-pronounce-button';
import { useGame } from '@/src/context/GameContext';

const TEAL = '#1B8B8C';
const TEAL_DARK = '#0E4D55';
const TEAL_LIGHT = '#DDF1ED';
const GOLD = '#D48B0A';
const GOLD_LIGHT = '#FFF9E6';
const ORANGE = '#E5771A';
const BLUE = '#1A6BE5';
const GREEN = '#2BA84A';

/* ─── Datos de Glosario ─── */
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
  id: 'fonetica' | 'gramatica' | 'vocabulario' | 'dialogos';
  title: string;
  quechuaTitle: string;
  description: string;
  accentColor: string;
  icon: any;
  totalLessons: number;
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
    id: 'fonetica',
    title: 'Fonética & Habla',
    quechuaTitle: 'Achahala Simi T\'uqyay',
    description: 'Sistema trivocálico, fonemas posvelares y acentuación andina.',
    accentColor: BLUE,
    icon: require('@/assets/images/categorias/cat_pronunciacion.png'),
    totalLessons: 15,
  },
  {
    id: 'gramatica',
    title: 'Estructura Gramatical',
    quechuaTitle: 'Simi Kamachikuy',
    description: 'Lengua aglutinante, sufijos de certeza, pronombres y conjugación.',
    accentColor: ORANGE,
    icon: require('@/assets/images/categorias/cat_gramatica.png'),
    totalLessons: 20,
  },
  {
    id: 'vocabulario',
    title: 'Vocabulario Andino',
    quechuaTitle: 'Yupaykuna & Ayllu',
    description: 'Números sagrados del 1 al 10, familia, naturaleza y hogar.',
    accentColor: TEAL,
    icon: require('@/assets/images/categorias/cat_vocabulario.png'),
    totalLessons: 24,
  },
  {
    id: 'dialogos',
    title: 'Diálogos Cotidianos',
    quechuaTitle: 'Sumaq Kawsay Rimay',
    description: 'Saludos tradicionales, fórmulas de cortesía y código ético andino.',
    accentColor: GREEN,
    icon: require('@/assets/images/categorias/cat_dialogos.png'),
    totalLessons: 12,
  },
];

type MainTab = 'modules' | 'dictionary' | 'stories' | 'translator';

export default function ExploreScreen() {
  const router = useRouter();
  const { xp } = useGame();
  const [activeTab, setActiveTab] = useState<MainTab>('modules');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
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
    { key: 'translator', label: '🎙️ Traductor' },
  ];

  const selectedModule = MODULES.find((m) => m.id === selectedModuleId);

  return (
    <View style={styles.container}>
      <YachayTopBar />

      {/* Selector de pestañas superiores */}
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, activeTab === t.key && styles.tabBtnActive]}
            onPress={() => {
              if (t.key === 'translator') {
                router.push('/translator' as any);
              } else {
                setActiveTab(t.key);
                setSelectedModuleId(null);
              }
            }}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── SECCIÓN MÓDULOS DE LECCIONES ── */}
        {activeTab === 'modules' && (
          <View>
            {/* Si NO hay módulo seleccionado, muestra la lista de los 4 módulos */}
            {!selectedModule ? (
              <View>
                <View style={styles.sectionBannerContainer}>
                  <ImageBackground
                    source={require('@/assets/images/cards/tarjeta_montana.png')}
                    style={styles.sectionBannerBg}
                    imageStyle={styles.sectionBannerImg}
                  >
                    <View style={styles.sectionBannerOverlay}>
                      <Text style={styles.bannerTag}>ÁREAS DE APRENDIZAJE • GUÍA INTEGRADA</Text>
                      <Text style={styles.bannerTitle}>Módulos de Lecciones</Text>
                      <Text style={styles.bannerDesc}>
                        Selecciona un módulo para consultar su guía gramatical, escuchar fonemas andinos y revisar su estructura.
                      </Text>
                      <View style={styles.bannerTextileRibbon}>
                        <Text style={styles.textileRibbonText}>▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </View>

                {MODULES.map((mod, idx) => {
                  const dynamicDone = Math.min(mod.totalLessons, Math.floor((xp || 0) / (30 * (idx + 1))));
                  const pct = Math.round((dynamicDone / mod.totalLessons) * 100);

                  return (
                    <TouchableOpacity
                      key={mod.id}
                      style={styles.moduleCard}
                      onPress={() => setSelectedModuleId(mod.id)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.accentBar, { backgroundColor: mod.accentColor }]} />
                      <Image source={mod.icon} style={styles.moduleIcon} />
                      <View style={styles.moduleBody}>
                        <View style={styles.moduleHeaderRow}>
                          <Text style={styles.moduleTitle}>{mod.title}</Text>
                          <View style={[styles.guidePill, { backgroundColor: `${mod.accentColor}18` }]}>
                            <Text style={[styles.guidePillText, { color: mod.accentColor }]}>
                              📖 Guía & Audios
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.moduleQuechuaSub}>{mod.quechuaTitle}</Text>
                        <Text style={styles.moduleDesc}>{mod.description}</Text>

                        {/* Barra de progreso */}
                        <View style={styles.progressRow}>
                          <View style={styles.progressBg}>
                            <View
                              style={[
                                styles.progressFill,
                                { width: `${Math.max(6, pct)}%`, backgroundColor: mod.accentColor },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressLabel}>{dynamicDone}/{mod.totalLessons}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* Vista Detallada de la Guía del Módulo Seleccionado */
              <View style={styles.guideWrapper}>
                {/* Botón superior de retroceso al listado de módulos */}
                <TouchableOpacity
                  style={styles.backToModulesBtn}
                  onPress={() => setSelectedModuleId(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backToModulesText}>← Volver a todos los módulos</Text>
                </TouchableOpacity>

                {/* Banner temático del Módulo */}
                <View style={[styles.moduleHeroCard, { borderColor: selectedModule.accentColor }]}>
                  <View style={styles.moduleHeroTop}>
                    <Image source={selectedModule.icon} style={styles.moduleHeroIcon} />
                    <View style={styles.moduleHeroText}>
                      <Text style={[styles.moduleHeroBadge, { color: selectedModule.accentColor }]}>
                        {selectedModule.quechuaTitle.toUpperCase()}
                      </Text>
                      <Text style={styles.moduleHeroTitle}>{selectedModule.title}</Text>
                    </View>
                  </View>
                  <Text style={styles.moduleHeroDesc}>{selectedModule.description}</Text>
                </View>

                {/* Contenido pedagógico distribuido según el módulo seleccionado */}
                {selectedModule.id === 'fonetica' && renderFoneticaGuide()}
                {selectedModule.id === 'gramatica' && renderGramaticaGuide()}
                {selectedModule.id === 'vocabulario' && renderVocabularioGuide()}
                {selectedModule.id === 'dialogos' && renderDialogosGuide()}

                {/* Botón inferior de retorno */}
                <TouchableOpacity
                  style={styles.bottomBackBtn}
                  onPress={() => setSelectedModuleId(null)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.bottomBackBtnText}>← Volver al listado de módulos</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── SECCIÓN GLOSARIO ── */}
        {activeTab === 'dictionary' && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>Glosario Quechua – Español 🔍</Text>
              <Text style={styles.sectionSubtitle}>
                Busca palabras o expresiones para conocer su pronunciación y significado.
              </Text>
            </View>

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
                  <Text style={styles.wordPhonetic}>[{word.phonetic}]</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <AudioPronounceButton text={word.qu} size="small" />
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{word.category}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── SECCIÓN HISTORIAS ── */}
        {activeTab === 'stories' && (
          <View>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.sectionTitle}>Cuentos e Historias Andinas 📖</Text>
              <Text style={styles.sectionSubtitle}>
                Lee diálogos interactivos en Quechua y mejora tu comprensión lectora.
              </Text>
            </View>

            {STORIES_DATA.map((story) => (
              <TouchableOpacity key={story.id} style={styles.storyCard} activeOpacity={0.82}>
                <Text style={styles.storyIcon}>{story.icon}</Text>
                <View style={styles.storyBody}>
                  <View style={styles.storyBadge}>
                    <Text style={styles.storyLevel}>{story.level}</Text>
                  </View>
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

/* ═══════════════════════════════════════════════════════════════════
   GUÍAS DISTRIBUIDAS POR MÓDULO (CON AUDIOS INTERACTIVOS)
   ═══════════════════════════════════════════════════════════════════ */

/** Módulo 1: Fonética & Habla */
function renderFoneticaGuide() {
  return (
    <View style={styles.guideContentArea}>
      {/* 1. Trivocálico */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>01</Text>
          <Text style={styles.guideCardTag}>FONÉTICA ACHAHALA</Text>
        </View>
        <Text style={styles.guideCardTitle}>Sistema Trivocálico Quechua</Text>
        <Text style={styles.guideBodyText}>
          En el Quechua estándar solo existen <Text style={styles.boldText}>3 vocales fonémicas</Text>:{' '}
          <Text style={styles.highlightTeal}>A</Text>, <Text style={styles.highlightTeal}>I</Text> y{' '}
          <Text style={styles.highlightTeal}>U</Text>. Las vocales 'E' y 'O' son únicamente alófonos
          que surgen al entrar en contacto con la consonante posvelar 'Q'.
        </Text>

        <View style={styles.vowelRow}>
          <View style={styles.vowelItem}>
            <View style={styles.vowelTop}>
              <Text style={styles.vowelLetter}>A</Text>
              <AudioPronounceButton text="Allin" size="small" />
            </View>
            <Text style={styles.vowelWord}>Allin</Text>
            <Text style={styles.vowelTrans}>Bueno / Bien</Text>
          </View>

          <View style={styles.vowelItem}>
            <View style={styles.vowelTop}>
              <Text style={styles.vowelLetter}>I</Text>
              <AudioPronounceButton text="Inti" size="small" />
            </View>
            <Text style={styles.vowelWord}>Inti</Text>
            <Text style={styles.vowelTrans}>Sol sagrado</Text>
          </View>

          <View style={styles.vowelItem}>
            <View style={styles.vowelTop}>
              <Text style={styles.vowelLetter}>U</Text>
              <AudioPronounceButton text="Urpi" size="small" />
            </View>
            <Text style={styles.vowelWord}>Urpi</Text>
            <Text style={styles.vowelTrans}>Paloma / Amor</Text>
          </View>
        </View>
      </View>

      {/* 2. Fonemas Especiales Andinos */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>02</Text>
          <Text style={styles.guideCardTag}>CONSONANTES ANDINAS</Text>
        </View>
        <Text style={styles.guideCardTitle}>Fonemas Característicos</Text>

        <View style={styles.consonantList}>
          {/* Fonema Q */}
          <View style={styles.consonantItem}>
            <View style={styles.consonantHeader}>
              <View style={styles.consonantBadge}>
                <Text style={styles.consonantLetter}>Q</Text>
              </View>
              <View style={styles.consonantInfo}>
                <Text style={styles.consonantName}>Oclusiva Posvelar</Text>
                <Text style={styles.consonantTip}>Garganta profunda, carraspeo suave tipo "ka"</Text>
              </View>
            </View>
            <View style={styles.audioExampleRow}>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Qosqo (Cusco)</Text>
                <AudioPronounceButton text="Qosqo" size="small" />
              </View>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Quri (Oro)</Text>
                <AudioPronounceButton text="Quri" size="small" />
              </View>
            </View>
          </View>

          {/* Fonema SH */}
          <View style={styles.consonantItem}>
            <View style={styles.consonantHeader}>
              <View style={styles.consonantBadge}>
                <Text style={styles.consonantLetter}>SH</Text>
              </View>
              <View style={styles.consonantInfo}>
                <Text style={styles.consonantName}>Fricativa Palatal</Text>
                <Text style={styles.consonantTip}>Suave como en inglés "shine" o "sha"</Text>
              </View>
            </View>
            <View style={styles.audioExampleRow}>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Mishki (Dulce)</Text>
                <AudioPronounceButton text="Mishki" size="small" />
              </View>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Allinllachu</Text>
                <AudioPronounceButton text="Allinllachu" size="small" />
              </View>
            </View>
          </View>

          {/* Fonema LL */}
          <View style={styles.consonantItem}>
            <View style={styles.consonantHeader}>
              <View style={styles.consonantBadge}>
                <Text style={styles.consonantLetter}>LL</Text>
              </View>
              <View style={styles.consonantInfo}>
                <Text style={styles.consonantName}>Lateral Palatal Sonoro</Text>
                <Text style={styles.consonantTip}>Sonido de "elle" andina clásica</Text>
              </View>
            </View>
            <View style={styles.audioExampleRow}>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Killa (Luna)</Text>
                <AudioPronounceButton text="Killa" size="small" />
              </View>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Llaqta (Pueblo)</Text>
                <AudioPronounceButton text="Llaqta" size="small" />
              </View>
            </View>
          </View>

          {/* Semivocal W */}
          <View style={styles.consonantItem}>
            <View style={styles.consonantHeader}>
              <View style={styles.consonantBadge}>
                <Text style={styles.consonantLetter}>W</Text>
              </View>
              <View style={styles.consonantInfo}>
                <Text style={styles.consonantName}>Semivocal Labiovelar</Text>
                <Text style={styles.consonantTip}>Suave como una "u" en diptongo, nunca dura</Text>
              </View>
            </View>
            <View style={styles.audioExampleRow}>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Wasi (Casa)</Text>
                <AudioPronounceButton text="Wasi" size="small" />
              </View>
              <View style={styles.audioExamplePill}>
                <Text style={styles.audioExampleText}>Wawa (Bebé)</Text>
                <AudioPronounceButton text="Wawa" size="small" />
              </View>
            </View>
          </View>
        </View>
      </View>

    </View>
  );
}

/** Módulo 2: Estructura Gramatical */
function renderGramaticaGuide() {
  return (
    <View style={styles.guideContentArea}>
      {/* 1. Pronombres Personales */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>01</Text>
          <Text style={styles.guideCardTag}>RUNAKUNA • PRONOMBRES</Text>
        </View>
        <Text style={styles.guideCardTitle}>Pronombres y Dualidad Inclusiva</Text>
        <Text style={styles.guideBodyText}>
          El Quechua distingue dos formas de "nosotros": el <Text style={styles.boldText}>Inclusivo</Text>{' '}
          (tú y yo juntos) y el <Text style={styles.boldText}>Exclusivo</Text> (nosotros pero no tú).
        </Text>

        <View style={styles.tableList}>
          {[
            { q: 'Ñoqa', es: 'Yo', note: '1ª persona singular' },
            { q: 'Qam', es: 'Tú / Usted', note: '2ª persona singular' },
            { q: 'Pay', es: 'Él / Ella', note: '3ª persona (sin género)' },
            { q: 'Ñoqanchik', es: 'Nosotros (Inclusivo)', note: 'Incluye a quien escucha' },
            { q: 'Ñoqayku', es: 'Nosotros (Exclusivo)', note: 'Excluye al oyente' },
            { q: 'Qamkuna', es: 'Ustedes', note: '2ª persona plural' },
            { q: 'Paykuna', es: 'Ellos / Ellas', note: '3ª persona plural' },
          ].map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowQuechua}>{item.q}</Text>
                <Text style={styles.rowEs}>{item.es}</Text>
                <Text style={styles.rowNote}>{item.note}</Text>
              </View>
              <AudioPronounceButton text={item.q} size="small" />
            </View>
          ))}
        </View>
      </View>

      {/* 2. Sufijos Esenciales */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>02</Text>
          <Text style={styles.guideCardTag}>SIMI T’AQAKUNA • SUFIJOS</Text>
        </View>
        <Text style={styles.guideCardTitle}>Estructura Aglutinante</Text>
        <Text style={styles.guideBodyText}>
          No existen artículos independientes como "el" o "la". Se adhieren sufijos directamente a la raíz léxica:
        </Text>

        <View style={styles.suffixGrid}>
          <View style={styles.suffixCard}>
            <Text style={styles.suffixTag}>-mi / -n</Text>
            <Text style={styles.suffixType}>Validador Testimonial</Text>
            <Text style={styles.suffixDesc}>Indica certeza vivida en persona ("me consta").</Text>
            <View style={styles.examplePill}>
              <Text style={styles.exampleText}>Allinmi (¡Estoy bien!)</Text>
              <AudioPronounceButton text="Allinmi" size="small" />
            </View>
          </View>

          <View style={styles.suffixCard}>
            <Text style={styles.suffixTag}>-chu</Text>
            <Text style={styles.suffixType}>Pregunta o Negación</Text>
            <Text style={styles.suffixDesc}>Convierte en pregunta cerrada o con Mana en negación.</Text>
            <View style={styles.examplePill}>
              <Text style={styles.exampleText}>Allinllachu? (¿Estás bien?)</Text>
              <AudioPronounceButton text="Allinllachu" size="small" />
            </View>
          </View>

          <View style={styles.suffixCard}>
            <Text style={styles.suffixTag}>-kuna</Text>
            <Text style={styles.suffixType}>Pluralizador</Text>
            <Text style={styles.suffixDesc}>Se agrega a cualquier sustantivo para pluralizarlo.</Text>
            <View style={styles.examplePill}>
              <Text style={styles.exampleText}>Wasikuna (Casas)</Text>
              <AudioPronounceButton text="Wasikuna" size="small" />
            </View>
          </View>

          <View style={styles.suffixCard}>
            <Text style={styles.suffixTag}>-manta</Text>
            <Text style={styles.suffixType}>Origen / Procedencia</Text>
            <Text style={styles.suffixDesc}>Equivale a "de", "desde" o "acerca de".</Text>
            <View style={styles.examplePill}>
              <Text style={styles.exampleText}>Qosqomanta kani</Text>
              <AudioPronounceButton text="Qosqomanta kani" size="small" />
            </View>
          </View>
        </View>
      </View>

      {/* 3. Conjugación en Presente */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>03</Text>
          <Text style={styles.guideCardTag}>RUWAY • CONJUGACIÓN</Text>
        </View>
        <Text style={styles.guideCardTitle}>Presente Indicativo (Rimay = Hablar)</Text>
        <Text style={styles.guideBodyText}>
          Se retira la -y del infinitivo y se agrega la desinencia correspondiente:
        </Text>

        <View style={styles.conjugationWrap}>
          {[
            { person: 'Ñoqa', verb: 'Rimani', trans: 'Yo hablo', root: 'Rima-ni' },
            { person: 'Qam', verb: 'Rimanki', trans: 'Tú hablas', root: 'Rima-nki' },
            { person: 'Pay', verb: 'Riman', trans: 'Él / Ella habla', root: 'Rima-n' },
            { person: 'Ñoqanchik', verb: 'Rimanchik', trans: 'Nosotros hablamos', root: 'Rima-nchik' },
            { person: 'Paykuna', verb: 'Rimanku', trans: 'Ellos hablan', root: 'Rima-nku' },
          ].map((c, i) => (
            <View key={i} style={styles.conjRow}>
              <View style={styles.conjLeft}>
                <Text style={styles.conjPerson}>{c.person}</Text>
                <Text style={styles.conjVerb}>{c.verb}</Text>
                <Text style={styles.conjRoot}>{c.root} ({c.trans})</Text>
              </View>
              <AudioPronounceButton text={`${c.person} ${c.verb}`} size="small" />
            </View>
          ))}
        </View>
      </View>

    </View>
  );
}

/** Módulo 3: Vocabulario Andino */
function renderVocabularioGuide() {
  return (
    <View style={styles.guideContentArea}>
      {/* 1. Yupaykuna: Números */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>01</Text>
          <Text style={styles.guideCardTag}>YUPAYKUNA • NÚMEROS</Text>
        </View>
        <Text style={styles.guideCardTitle}>Conteo Decimal Andino (1 al 10)</Text>
        <Text style={styles.guideBodyText}>
          El sistema numérico incaico es perfectamente regular, decimal y acumulativo:
        </Text>

        <View style={styles.numbersGrid}>
          {[
            { n: '1', q: 'Huk', es: 'Uno' },
            { n: '2', q: 'Iskay', es: 'Dos' },
            { n: '3', q: 'Kinsa', es: 'Tres' },
            { n: '4', q: 'Tawa', es: 'Cuatro' },
            { n: '5', q: 'Pichqa', es: 'Cinco' },
            { n: '6', q: 'Soqta', es: 'Seis' },
            { n: '7', q: 'Qanchis', es: 'Siete' },
            { n: '8', q: 'Pusaq', es: 'Ocho' },
            { n: '9', q: 'Isqon', es: 'Nueve' },
            { n: '10', q: 'Chunka', es: 'Diez' },
          ].map((num) => (
            <View key={num.n} style={styles.numberItem}>
              <View style={styles.numberDigitBadge}>
                <Text style={styles.numberDigit}>{num.n}</Text>
              </View>
              <Text style={styles.numberQuechua}>{num.q}</Text>
              <Text style={styles.numberEs}>{num.es}</Text>
              <AudioPronounceButton text={num.q} size="small" />
            </View>
          ))}
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>🔢 Construcción de decenas y centenas</Text>
          <Text style={styles.tipDesc}>
            11 es <Text style={styles.boldText}>Chunka hukniyoq</Text>, 20 es <Text style={styles.boldText}>Iskay chunka</Text>,
            100 es <Text style={styles.boldText}>Pachak</Text> y 1000 es <Text style={styles.boldText}>Waranqa</Text>.
          </Text>
        </View>
      </View>

      {/* 2. Ayllu: Familia */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>02</Text>
          <Text style={styles.guideCardTag}>AYLLU • FAMILIA</Text>
        </View>
        <Text style={styles.guideCardTitle}>Parentesco y Comunidad</Text>

        <View style={styles.familyGrid}>
          {[
            { q: 'Tayta', es: 'Padre / Señor', note: 'Respeto al jefe de hogar' },
            { q: 'Mama', es: 'Madre / Señora', note: 'Matriarca andina' },
            { q: 'Wawa', es: 'Bebé / Hijo(a) de mujer', note: 'Hijo dicho por la madre' },
            { q: 'Churi', es: 'Hijo de varón', note: 'Hijo varón de un padre' },
            { q: 'Ususi', es: 'Hija de varón', note: 'Hija mujer de un padre' },
            { q: 'Awicho', es: 'Abuelo', note: 'Sabio anciano de la comunidad' },
            { q: 'Awicha', es: 'Abuela', note: 'Sabia anciana de la comunidad' },
            { q: 'Tura', es: 'Hermano de mujer', note: 'Dicho exclusivamente por la hermana' },
            { q: 'Pana', es: 'Hermana de varón', note: 'Dicho exclusivamente por el hermano' },
          ].map((f, idx) => (
            <View key={idx} style={styles.familyCard}>
              <View style={styles.familyHeader}>
                <Text style={styles.familyQuechua}>{f.q}</Text>
                <AudioPronounceButton text={f.q} size="small" />
              </View>
              <Text style={styles.familyEs}>{f.es}</Text>
              <Text style={styles.familyNote}>{f.note}</Text>
            </View>
          ))}
        </View>
      </View>

    </View>
  );
}

/** Módulo 4: Diálogos Cotidianos */
function renderDialogosGuide() {
  return (
    <View style={styles.guideContentArea}>
      {/* 1. Saludos y Cortesía */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>01</Text>
          <Text style={styles.guideCardTag}>SUMAQ KAWSAY • CORTESÍA</Text>
        </View>
        <Text style={styles.guideCardTitle}>Saludos y Expresiones Andinas</Text>

        <View style={styles.phrasesList}>
          {[
            { q: 'Allinllachu', es: '¿Estás bien? (Saludo formal)', tip: 'La respuesta natural es: Allinmi (Estoy bien)' },
            { q: 'Allin p’unchay', es: 'Buenos días', tip: 'Saludo al iniciar la mañana' },
            { q: 'Allin tuta', es: 'Buenas noches', tip: 'Despedida o saludo nocturno' },
            { q: 'Añay / Sulpayki', es: 'Muchas gracias', tip: 'Agradecimiento sincero de corazón' },
            { q: 'Tupananchiskama', es: 'Hasta que nos volvamos a ver', tip: 'No existe el "adiós" definitivo en el mundo andino' },
          ].map((p, idx) => (
            <View key={idx} style={styles.phraseCard}>
              <View style={styles.phraseHeader}>
                <Text style={styles.phraseQuechua}>{p.q}</Text>
                <AudioPronounceButton text={p.q} size="small" />
              </View>
              <Text style={styles.phraseEs}>{p.es}</Text>
              <Text style={styles.phraseTip}>✦ {p.tip}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 2. Código Ético y Diálogo Modelo */}
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>02</Text>
          <Text style={styles.guideCardTag}>RIMANAKUY • DIÁLOGO MODELO</Text>
        </View>
        <Text style={styles.guideCardTitle}>Conversación Cotidiana en el Ayllu</Text>

        <View style={styles.dialogueBox}>
          <View style={styles.dialogueBubbleA}>
            <View style={styles.dialogueSpeakerRow}>
              <Text style={styles.dialogueSpeaker}>Persona A:</Text>
              <AudioPronounceButton text="Allin p'unchay! Imaynallam kashanki?" size="small" />
            </View>
            <Text style={styles.dialogueQuechua}>Allin p'unchay! Imaynallam kashanki?</Text>
            <Text style={styles.dialogueEs}>¡Buenos días! ¿Cómo estás?</Text>
          </View>

          <View style={styles.dialogueBubbleB}>
            <View style={styles.dialogueSpeakerRow}>
              <Text style={styles.dialogueSpeaker}>Persona B:</Text>
              <AudioPronounceButton text="Allinllami kashani, añay! Qamrí?" size="small" />
            </View>
            <Text style={styles.dialogueQuechua}>Allinllami kashani, añay! Qamrí?</Text>
            <Text style={styles.dialogueEs}>¡Estoy bien, gracias! ¿Y tú?</Text>
          </View>

          <View style={styles.dialogueBubbleA}>
            <View style={styles.dialogueSpeakerRow}>
              <Text style={styles.dialogueSpeaker}>Persona A:</Text>
              <AudioPronounceButton text="Ñoqapas allinllami, tupananchiskama!" size="small" />
            </View>
            <Text style={styles.dialogueQuechua}>Ñoqapas allinllami, tupananchiskama!</Text>
            <Text style={styles.dialogueEs}>¡Yo también bien, hasta que nos volvamos a ver!</Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>👑 Código Ético Ancestral</Text>
          <Text style={styles.tipDesc}>
            <Text style={styles.boldText}>Ama suwa, ama llulla, ama qella</Text> (No seas ladrón, no seas mentiroso, no seas ocioso).
          </Text>
          <View style={{ marginTop: 8 }}>
            <AudioPronounceButton text="Ama suwa, ama llulla, ama qella" size="small" showLabel />
          </View>
        </View>
      </View>

    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ESTILOS VISUALES
   ═══════════════════════════════════════════════════════════════════ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5EE' },
  content: { padding: 14, paddingBottom: 40 },

  /* Tab bar interior */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE3D6',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F3EFE7',
    borderWidth: 1,
    borderColor: '#EAE3D6',
  },
  tabBtnActive: {
    backgroundColor: '#DDF1ED',
    borderColor: '#1B8B8C',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7A6A5A',
  },
  tabTextActive: {
    color: '#0E5A60',
    fontWeight: '900',
  },

  /* Banner de sección */
  sectionBannerContainer: {
    marginBottom: 16,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0F5B62',
    elevation: 3,
    shadowColor: '#1A332E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  sectionBannerBg: { width: '100%' },
  sectionBannerImg: { opacity: 0.4, resizeMode: 'cover' },
  sectionBannerOverlay: {
    backgroundColor: 'rgba(11, 75, 82, 0.82)',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  bannerTag: {
    color: '#FBD46D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 3,
  },
  bannerDesc: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  bannerTextileRibbon: {
    backgroundColor: '#0A3F45',
    paddingVertical: 4,
    marginHorizontal: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textileRibbonText: {
    fontSize: 9,
    color: '#E8B966',
    letterSpacing: 3,
    fontWeight: '700',
  },

  /* Tarjetas de Módulos */
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    overflow: 'hidden',
    padding: 14,
    elevation: 2,
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginRight: 14,
  },
  moduleBody: {
    flex: 1,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2937',
  },
  guidePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  guidePillText: {
    fontSize: 10,
    fontWeight: '900',
  },
  moduleQuechuaSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B8B8C',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  moduleDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 15,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#EAE3D6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A6A5A',
  },

  /* Vista de Guía de Módulo */
  guideWrapper: {
    paddingBottom: 20,
  },
  backToModulesBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    marginBottom: 14,
  },
  backToModulesText: {
    color: '#0E5A60',
    fontSize: 12,
    fontWeight: '800',
  },
  moduleHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  moduleHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  moduleHeroIcon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  moduleHeroText: {
    flex: 1,
  },
  moduleHeroBadge: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  moduleHeroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
  },
  moduleHeroDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  bottomBackBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  bottomBackBtnText: {
    color: '#7A6A5A',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Elementos de contenido de guía */
  guideContentArea: {
    gap: 14,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  guideCardNum: {
    fontSize: 11,
    fontWeight: '900',
    color: TEAL,
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  guideCardTag: {
    fontSize: 10,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 0.5,
  },
  guideCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 6,
  },
  guideBodyText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '800',
    color: '#1F2937',
  },
  highlightTeal: {
    fontWeight: '900',
    color: TEAL,
  },

  /* Vocales */
  vowelRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  vowelItem: {
    flex: 1,
    backgroundColor: '#F8F5EE',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE3D6',
  },
  vowelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  vowelLetter: {
    fontSize: 18,
    fontWeight: '900',
    color: TEAL,
  },
  vowelWord: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2937',
    marginTop: 2,
  },
  vowelTrans: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 1,
  },

  /* Consonantes andinas */
  consonantList: {
    gap: 10,
    marginTop: 4,
  },
  consonantItem: {
    backgroundColor: '#F9F7F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  consonantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  consonantBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consonantLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  consonantInfo: {
    flex: 1,
  },
  consonantName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2937',
  },
  consonantTip: {
    fontSize: 11,
    color: '#6B7280',
  },
  audioExampleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audioExamplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DFD0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  audioExampleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },

  /* Tablas de Pronombres y Conjugación */
  tableList: {
    borderWidth: 1,
    borderColor: '#ECE5D8',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE7',
    backgroundColor: '#FFFFFF',
  },
  rowLeft: {
    flex: 1,
    paddingRight: 8,
  },
  rowQuechua: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0E5A60',
  },
  rowEs: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  rowNote: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  /* Sufijos */
  suffixGrid: {
    gap: 10,
    marginTop: 4,
  },
  suffixCard: {
    backgroundColor: '#F9F7F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  suffixTag: {
    fontSize: 14,
    fontWeight: '900',
    color: ORANGE,
  },
  suffixType: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  suffixDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 15,
  },
  examplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8DFD0',
  },
  exampleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },

  /* Conjugación */
  conjugationWrap: {
    borderWidth: 1,
    borderColor: '#ECE5D8',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
  },
  conjRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFE7',
    backgroundColor: '#FFFFFF',
  },
  conjLeft: {
    flex: 1,
  },
  conjPerson: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  conjVerb: {
    fontSize: 13,
    fontWeight: '900',
    color: ORANGE,
  },
  conjRoot: {
    fontSize: 11,
    color: '#4B5563',
  },

  /* Números */
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  numberItem: {
    width: '48%',
    backgroundColor: '#F9F7F2',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  numberDigitBadge: {
    backgroundColor: TEAL,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  numberDigit: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  numberQuechua: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1F2937',
  },
  numberEs: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },

  /* Familia */
  familyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  familyCard: {
    width: '48%',
    backgroundColor: '#F9F7F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  familyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  familyQuechua: {
    fontSize: 13,
    fontWeight: '900',
    color: TEAL_DARK,
  },
  familyEs: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  familyNote: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 12,
  },

  /* Frases y Diálogos */
  phrasesList: {
    gap: 8,
    marginTop: 4,
  },
  phraseCard: {
    backgroundColor: '#F9F7F2',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  phraseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  phraseQuechua: {
    fontSize: 14,
    fontWeight: '900',
    color: GREEN,
  },
  phraseEs: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  phraseTip: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
  },
  dialogueBox: {
    backgroundColor: '#F8F5EE',
    borderRadius: 14,
    padding: 10,
    gap: 8,
    marginTop: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECE5D8',
  },
  dialogueBubbleA: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
  },
  dialogueBubbleB: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
  },
  dialogueSpeakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dialogueSpeaker: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
  },
  dialogueQuechua: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  dialogueEs: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  /* Tip Box */
  tipBox: {
    backgroundColor: GOLD_LIGHT,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1D28C',
    marginTop: 4,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#7A4D00',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 11,
    color: '#6B4C18',
    lineHeight: 15,
  },

  /* Glosario */
  sectionHeaderBox: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#2A1A0A',
    marginBottom: 12,
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  wordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    elevation: 2,
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  wordMain: {
    flex: 1,
    paddingRight: 8,
  },
  wordQuechua: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0E4D55',
    marginBottom: 2,
  },
  wordSpanish: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  wordPhonetic: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#F3EFE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8DFD0',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7A6A5A',
  },

  /* Historias */
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#ECE5D8',
    elevation: 2,
    shadowColor: '#3A2E26',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  storyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  storyBody: {
    flex: 1,
  },
  storyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DDF1ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 3,
  },
  storyLevel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0E5A60',
    letterSpacing: 0.3,
  },
  storyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 2,
  },
  storyQuechua: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1B8B8C',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  storyDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
  },
});
