import React, { useMemo, useState } from 'react';
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
import {
  CATEGORY_PILLS,
  CategoryFilter,
  LIBRARY_ITEMS,
  LIBRARY_STORIES,
} from '@/src/content/libraryData';

const TEAL = '#00C853';
const TEAL_DARK = '#009624';
const TEAL_LIGHT = '#E8F8F0';
const GOLD = '#FFB300';
const GOLD_LIGHT = '#FFF8E1';
const GOLD_DARK = '#C67C00';
const BLUE = '#00B0FF';
const ORANGE = '#FF6D00';
const GREEN = '#00C853';
const CREAM = '#FAF7F2';
const CARD_BG = '#FFFFFF';
const BORDER = '#E2E8F0';
const TEXT_DARK = '#0F172A';
const TEXT_MUTED = '#64748B';

type GuideModuleId = 'fonetica' | 'gramatica' | 'vocabulario' | 'dialogos';

interface StudyModule {
  id: GuideModuleId;
  title: string;
  quechuaTitle: string;
  description: string;
  accentColor: string;
  icon: any;
}

const GUIDE_MODULES: StudyModule[] = [
  {
    id: 'fonetica',
    title: 'Fonética & Habla',
    quechuaTitle: 'Achahala Simi T\'uqyay',
    description: 'Sistema trivocálico, fonemas posvelares y acentuación andina.',
    accentColor: BLUE,
    icon: require('@/assets/images/categorias/cat_pronunciacion.png'),
  },
  {
    id: 'gramatica',
    title: 'Estructura Gramatical',
    quechuaTitle: 'Simi Kamachikuy',
    description: 'Lengua aglutinante, sufijos de certeza, pronombres y conjugación.',
    accentColor: ORANGE,
    icon: require('@/assets/images/categorias/cat_gramatica.png'),
  },
  {
    id: 'vocabulario',
    title: 'Vocabulario Andino',
    quechuaTitle: 'Yupaykuna & Ayllu',
    description: 'Números sagrados del 1 al 10, familia, naturaleza y hogar.',
    accentColor: TEAL,
    icon: require('@/assets/images/categorias/cat_vocabulario.png'),
  },
  {
    id: 'dialogos',
    title: 'Diálogos Cotidianos',
    quechuaTitle: 'Sumaq Kawsay Rimay',
    description: 'Saludos tradicionales, fórmulas de cortesía y código ético andino.',
    accentColor: GREEN,
    icon: require('@/assets/images/categorias/cat_dialogos.png'),
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuideModule, setSelectedGuideModule] = useState<GuideModuleId | null>(null);

  // Filtrado de Historias
  const filteredStories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return LIBRARY_STORIES;
    return LIBRARY_STORIES.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.quechuaTitle.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtrado de Elementos Culturales
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LIBRARY_ITEMS.filter((item) => {
      const matchesCategory =
        selectedFilter === 'all' || item.category === selectedFilter;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        item.qu.toLowerCase().includes(q) ||
        item.es.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.subCategory.toLowerCase().includes(q) ||
        (item.culturalNote && item.culturalNote.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedFilter]);

  const showStories =
    selectedFilter === 'all' || selectedFilter === 'historias';
  const showItems =
    selectedFilter === 'all' ||
    selectedFilter === 'cultura' ||
    selectedFilter === 'cotidiano' ||
    selectedFilter === 'naturaleza' ||
    selectedFilter === 'curiosidades';
  const showGuides = selectedFilter === 'guias';

  const hasAnyResults =
    (showStories && filteredStories.length > 0) ||
    (showItems && filteredItems.length > 0) ||
    showGuides;

  function openTranslatorWithText(text: string) {
    router.push({
      pathname: '/(tabs)/translator',
      params: { text, lang: 'qu' },
    });
  }

  function openStory(slug: string) {
    router.push(`/story/${slug}` as any);
  }

  return (
    <View style={styles.container}>
      <YachayTopBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Hero: La Biblioteca Andina */}
        <View style={styles.heroBannerWrap}>
          <ImageBackground
            source={require('@/assets/images/cards/tarjeta_montana.png')}
            style={styles.heroBannerBg}
            imageStyle={styles.heroBannerImg}
          >
            <View style={styles.heroBannerOverlay}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>ESTANTERÍA ABIERTA • YACHAY WASI</Text>
                </View>
                <Text style={styles.heroSymbol}>❖ 🏔️ ❖</Text>
              </View>
              <Text style={styles.heroTitle}>La Biblioteca Andina</Text>
              <Text style={styles.heroSubtitle}>
                Explora relatos ancestrales, tradiciones, gastronomía y modismos quechuas con total libertad: sin vidas, niveles ni exámenes.
              </Text>
              <View style={styles.textileRibbon}>
                <Text style={styles.textileRibbonText}>▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼ ❖ ◆ ❖ ◆ ▲▼▲▼</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Buscador Universal */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Busca palabras, tradiciones, historias..."
              placeholderTextColor="#9B8B7A"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Barra de Filtros / Pastillas Temáticas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
        >
          {CATEGORY_PILLS.map((pill) => {
            const isActive = selectedFilter === pill.key;
            return (
              <TouchableOpacity
                key={pill.key}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                onPress={() => {
                  setSelectedFilter(pill.key);
                  setSelectedGuideModule(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.pillIcon}>{pill.icon}</Text>
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {pill.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Indicador de hallazgos activos si hay búsqueda */}
        {searchQuery.trim().length > 0 && (
          <View style={styles.searchStatsRow}>
            <Text style={styles.searchStatsText}>
              Resultados para &quot;<Text style={styles.boldText}>{searchQuery}</Text>&quot;: {filteredStories.length + filteredItems.length} encontrados
            </Text>
          </View>
        )}

        {/* Estado Sin Resultados */}
        {!hasAnyResults && (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateIcon}>🔎🏔️</Text>
            <Text style={styles.emptyStateTitle}>No encontramos resultados</Text>
            <Text style={styles.emptyStateSubtitle}>
              Prueba con otro término o consulta tu duda directamente en el Traductor fonético.
            </Text>
            <TouchableOpacity
              style={styles.emptyStateBtn}
              onPress={() => openTranslatorWithText(searchQuery)}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyStateBtnText}>Consultar en Traductor 🔄</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── SECCIÓN 1: CUENTOS DEL AYLLU (Historias Ancestrales) ── */}
        {showStories && filteredStories.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionCategoryTag}>NARRATIVA ANDINA</Text>
                <Text style={styles.sectionMainTitle}>📖 Cuentos del Ayllu</Text>
              </View>
              <View style={styles.sectionPillCount}>
                <Text style={styles.sectionPillCountText}>
                  {filteredStories.length} {filteredStories.length === 1 ? 'relato' : 'relatos'}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesCarousel}
            >
              {filteredStories.map((story) => (
                <View key={story.id} style={styles.storyShelfCard}>
                  <View style={styles.storyCardTop}>
                    <Text style={styles.storyIconCircle}>{story.icon}</Text>
                    <View style={styles.storyTagBadge}>
                      <Text style={styles.storyTagText}>{story.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.storyCardTitle}>{story.title}</Text>
                  <Text style={styles.storyCardQuechua}>{story.quechuaTitle}</Text>
                  <Text style={styles.storyCardDesc} numberOfLines={3}>
                    {story.description}
                  </Text>
                  <TouchableOpacity
                    style={styles.storyActionBtn}
                    onPress={() => openStory(story.slug)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.storyActionBtnText}>Leer Diálogo con Yachi 📖</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── SECCIÓN 2: ESTANTERÍAS CULTURALES (Items) ── */}
        {showItems && filteredItems.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionCategoryTag}>ESTANTERÍA DE SABERES</Text>
                <Text style={styles.sectionMainTitle}>
                  {selectedFilter === 'cultura' && '🏔️ Cultura, Gastronomía & Arte'}
                  {selectedFilter === 'cotidiano' && '💬 Quechua para la Vida Real'}
                  {selectedFilter === 'naturaleza' && '🦙 Fauna Sagrada & Plantas Medicinales'}
                  {selectedFilter === 'curiosidades' && '💡 Secretos Lingüísticos'}
                  {selectedFilter === 'all' && '📚 Saberes & Expresiones Andinas'}
                </Text>
              </View>
              <View style={styles.sectionPillCount}>
                <Text style={styles.sectionPillCountText}>{filteredItems.length} entradas</Text>
              </View>
            </View>

            <View style={styles.itemsGrid}>
              {filteredItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  {/* Cabecera del Item */}
                  <View style={styles.itemTopRow}>
                    <View style={styles.itemCategoryBadge}>
                      <Text style={styles.itemEmoji}>{item.icon || '✨'}</Text>
                      <Text style={styles.itemCategoryBadgeText}>{item.subCategory}</Text>
                    </View>
                    <View style={styles.itemActionsRow}>
                      <AudioPronounceButton text={item.qu} size="small" />
                      <TouchableOpacity
                        style={styles.quickTranslateBtn}
                        onPress={() => openTranslatorWithText(item.qu)}
                        activeOpacity={0.7}
                        accessibilityLabel="Traducir en traductor"
                      >
                        <Text style={styles.quickTranslateIcon}>🔄</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Textos Principales */}
                  <View style={styles.itemTitlesWrap}>
                    <Text style={styles.itemQuechua}>{item.qu}</Text>
                    {item.phonetic && (
                      <Text style={styles.itemPhonetic}>[{item.phonetic}]</Text>
                    )}
                    <Text style={styles.itemSpanish}>{item.es}</Text>
                  </View>

                  <Text style={styles.itemDesc}>{item.description}</Text>

                  {/* Nota Cultural / Sabiduría */}
                  {item.culturalNote && (
                    <View style={styles.itemCulturalNoteBox}>
                      <Text style={styles.culturalNoteTag}>💡 SABIDURÍA ANCESTRAL</Text>
                      <Text style={styles.culturalNoteText}>{item.culturalNote}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── SECCIÓN 3: GUÍAS LINGÜÍSTICAS (Módulos Pedagógicos) ── */}
        {(showGuides || selectedFilter === 'all') && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionCategoryTag}>GUÍAS FONÉTICAS & GRAMATICALES</Text>
                <Text style={styles.sectionMainTitle}>📜 Guías Lingüísticas del Quechua</Text>
              </View>
              {selectedGuideModule && (
                <TouchableOpacity
                  style={styles.closeGuideBtn}
                  onPress={() => setSelectedGuideModule(null)}
                >
                  <Text style={styles.closeGuideText}>✕ Cerrar Guía</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Selector de los 4 módulos de guía */}
            {!selectedGuideModule ? (
              <View style={styles.modulesGrid}>
                {GUIDE_MODULES.map((mod) => (
                  <TouchableOpacity
                    key={mod.id}
                    style={styles.moduleMiniCard}
                    onPress={() => setSelectedGuideModule(mod.id)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.moduleAccentStrip, { backgroundColor: mod.accentColor }]} />
                    <Image source={mod.icon} style={styles.moduleMiniIcon} />
                    <View style={styles.moduleMiniBody}>
                      <Text style={styles.moduleMiniTitle}>{mod.title}</Text>
                      <Text style={styles.moduleMiniQuechua}>{mod.quechuaTitle}</Text>
                      <Text style={styles.moduleMiniDesc} numberOfLines={2}>
                        {mod.description}
                      </Text>
                      <View style={styles.moduleReadMoreRow}>
                        <Text style={[styles.moduleReadMoreText, { color: mod.accentColor }]}>
                          Ver Guía con Audios →
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.activeGuideContainer}>
                {/* Cabecera del módulo activo */}
                {(() => {
                  const mod = GUIDE_MODULES.find((m) => m.id === selectedGuideModule);
                  if (!mod) return null;
                  return (
                    <View style={[styles.activeGuideHero, { borderColor: mod.accentColor }]}>
                      <View style={styles.activeGuideHeroTop}>
                        <Image source={mod.icon} style={styles.activeGuideHeroIcon} />
                        <View style={styles.activeGuideHeroTitles}>
                          <Text style={[styles.activeGuideBadge, { color: mod.accentColor }]}>
                            {mod.quechuaTitle.toUpperCase()}
                          </Text>
                          <Text style={styles.activeGuideTitle}>{mod.title}</Text>
                        </View>
                      </View>
                      <Text style={styles.activeGuideDesc}>{mod.description}</Text>
                    </View>
                  );
                })()}

                {/* Renderizado de la guía pedagógica seleccionada */}
                {selectedGuideModule === 'fonetica' && renderFoneticaGuide()}
                {selectedGuideModule === 'gramatica' && renderGramaticaGuide()}
                {selectedGuideModule === 'vocabulario' && renderVocabularioGuide()}
                {selectedGuideModule === 'dialogos' && renderDialogosGuide()}

                <TouchableOpacity
                  style={styles.bottomCloseGuideBtn}
                  onPress={() => setSelectedGuideModule(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bottomCloseGuideText}>↑ Volver al listado de guías</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Puente Virtuoso hacia el Traductor */}
        <View style={styles.translatorBannerWrap}>
          <View style={styles.translatorBanner}>
            <View style={styles.translatorBannerTextWrap}>
              <Text style={styles.translatorBannerTag}>🔄 DICCIONARIO & VOZ DE BOLSILLO</Text>
              <Text style={styles.translatorBannerTitle}>
                ¿Tienes una frase que quieras escuchar o traducir?
              </Text>
              <Text style={styles.translatorBannerDesc}>
                Usa el traductor con audio fonético Meta MMS y práctica de micrófono.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.translatorBannerBtn}
              onPress={() => router.push('/(tabs)/translator')}
              activeOpacity={0.85}
            >
              <Text style={styles.translatorBannerBtnText}>Abrir Traductor 🎙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GUÍAS PEDAGÓGICAS (FONÉTICA, GRAMÁTICA, VOCABULARIO, DIÁLOGOS)
   ═══════════════════════════════════════════════════════════════════ */

function renderFoneticaGuide() {
  return (
    <View style={styles.guideContentArea}>
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>01</Text>
          <Text style={styles.guideCardTag}>FONÉTICA ACHAHALA</Text>
        </View>
        <Text style={styles.guideCardTitle}>Sistema Trivocálico Quechua</Text>
        <Text style={styles.guideBodyText}>
          En el Quechua estándar solo existen <Text style={styles.boldText}>3 vocales fonémicas</Text>:{' '}
          <Text style={styles.highlightTeal}>A</Text>, <Text style={styles.highlightTeal}>I</Text> y{' '}
          <Text style={styles.highlightTeal}>U</Text>. Las vocales &apos;E&apos; y &apos;O&apos; son alófonos
          que surgen al articularse cerca de la consonante posvelar &apos;Q&apos;.
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

      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>02</Text>
          <Text style={styles.guideCardTag}>CONSONANTES ANDINAS</Text>
        </View>
        <Text style={styles.guideCardTitle}>Fonemas Característicos</Text>

        <View style={styles.consonantList}>
          <View style={styles.consonantItem}>
            <View style={styles.consonantHeader}>
              <View style={styles.consonantBadge}>
                <Text style={styles.consonantLetter}>Q</Text>
              </View>
              <View style={styles.consonantInfo}>
                <Text style={styles.consonantName}>Oclusiva Posvelar</Text>
                <Text style={styles.consonantTip}>Garganta profunda, carraspeo suave tipo &quot;ka&quot;</Text>
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

          <View style={styles.consonantItem}>
            <View style={styles.consonantHeader}>
              <View style={styles.consonantBadge}>
                <Text style={styles.consonantLetter}>SH</Text>
              </View>
              <View style={styles.consonantInfo}>
                <Text style={styles.consonantName}>Fricativa Palatal</Text>
                <Text style={styles.consonantTip}>Suave como en inglés &quot;shine&quot; o &quot;sha&quot;</Text>
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
        </View>
      </View>
    </View>
  );
}

function renderGramaticaGuide() {
  return (
    <View style={styles.guideContentArea}>
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>01</Text>
          <Text style={styles.guideCardTag}>RUNAKUNA • PRONOMBRES</Text>
        </View>
        <Text style={styles.guideCardTitle}>Pronombres y Dualidad Inclusiva</Text>
        <Text style={styles.guideBodyText}>
          El Quechua distingue dos formas de &quot;nosotros&quot;: el <Text style={styles.boldText}>Inclusivo</Text>{' '}
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

      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>02</Text>
          <Text style={styles.guideCardTag}>SIMI T’AQAKUNA • SUFIJOS</Text>
        </View>
        <Text style={styles.guideCardTitle}>Estructura Aglutinante</Text>
        <Text style={styles.guideBodyText}>
          No existen artículos independientes como &quot;el&quot; o &quot;la&quot;. Se adhieren sufijos directamente a la raíz léxica:
        </Text>

        <View style={styles.suffixGrid}>
          <View style={styles.suffixCard}>
            <Text style={styles.suffixTag}>-mi / -n</Text>
            <Text style={styles.suffixType}>Validador Testimonial</Text>
            <Text style={styles.suffixDesc}>Indica certeza vivida en persona (&quot;me consta&quot;).</Text>
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
        </View>
      </View>
    </View>
  );
}

function renderVocabularioGuide() {
  return (
    <View style={styles.guideContentArea}>
      <View style={styles.guideCard}>
        <View style={styles.guideCardHeader}>
          <Text style={styles.guideCardNum}>01</Text>
          <Text style={styles.guideCardTag}>YUPAYKUNA • NÚMEROS</Text>
        </View>
        <Text style={styles.guideCardTitle}>Conteo Decimal Andino (1 al 10)</Text>

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
      </View>

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
            { q: 'Awicho', es: 'Abuelo', note: 'Sabio anciano de la comunidad' },
            { q: 'Awicha', es: 'Abuela', note: 'Sabia anciana de la comunidad' },
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

function renderDialogosGuide() {
  return (
    <View style={styles.guideContentArea}>
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
            { q: 'Añay', es: 'Muchas gracias', tip: 'Palabra sagrada de agradecimiento' },
            { q: 'Tupananchiskama', es: 'Hasta volver a vernos', tip: 'En los Andes no hay adiós definitivo' },
          ].map((p, idx) => (
            <View key={idx} style={styles.phraseRow}>
              <View style={styles.phraseLeft}>
                <Text style={styles.phraseQ}>{p.q}</Text>
                <Text style={styles.phraseEs}>{p.es}</Text>
                <Text style={styles.phraseTip}>💡 {p.tip}</Text>
              </View>
              <AudioPronounceButton text={p.q} size="small" />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ESTILOS VISUALES PREMIUM CON PALETA ANDINA
   ═══════════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Hero Banner */
  heroBannerWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroBannerBg: {
    width: '100%',
  },
  heroBannerImg: {
    borderRadius: 20,
  },
  heroBannerOverlay: {
    backgroundColor: 'rgba(14, 77, 85, 0.88)',
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroBadge: {
    backgroundColor: 'rgba(212, 139, 10, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GOLD,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFE29A',
    letterSpacing: 0.8,
  },
  heroSymbol: {
    color: '#FFE29A',
    fontSize: 14,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E0F2F1',
    lineHeight: 19,
    marginBottom: 10,
  },
  textileRibbon: {
    marginTop: 4,
    opacity: 0.5,
  },
  textileRibbonText: {
    color: '#FFD700',
    fontSize: 11,
    letterSpacing: 2,
  },

  /* Buscador Universal */
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
    fontWeight: '600',
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: '700',
  },
  searchStatsRow: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 2,
  },
  searchStatsText: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  boldText: {
    fontWeight: '800',
  },

  /* Pastillas Temáticas (Filtros) */
  pillsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: BORDER,
    gap: 6,
  },
  pillBtnActive: {
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },

  /* Bloque de Sección General */
  sectionBlock: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionCategoryTag: {
    fontSize: 10,
    fontWeight: '900',
    color: TEAL,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionMainTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  sectionPillCount: {
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionPillCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: TEAL_DARK,
  },

  /* Cuentos del Ayllu (Carrusel Horizontal) */
  storiesCarousel: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 6,
  },
  storyShelfCard: {
    width: 250,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  storyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  storyIconCircle: {
    fontSize: 26,
  },
  storyTagBadge: {
    backgroundColor: GOLD_LIGHT,
    borderColor: GOLD,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  storyTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: GOLD_DARK,
  },
  storyCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  storyCardQuechua: {
    fontSize: 12,
    fontWeight: '700',
    color: TEAL,
    marginBottom: 6,
  },
  storyCardDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 17,
    marginBottom: 14,
  },
  storyActionBtn: {
    backgroundColor: TEAL,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  storyActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Grid de Elementos Culturales */
  itemsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  itemCard: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  itemEmoji: {
    fontSize: 13,
  },
  itemCategoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: TEAL_DARK,
  },
  itemActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickTranslateBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTranslateIcon: {
    fontSize: 14,
  },
  itemTitlesWrap: {
    marginBottom: 8,
  },
  itemQuechua: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  itemPhonetic: {
    fontSize: 12,
    color: TEAL,
    fontWeight: '600',
    marginVertical: 2,
  },
  itemSpanish: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD_DARK,
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  itemCulturalNoteBox: {
    backgroundColor: '#FFFDF5',
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    padding: 10,
    borderRadius: 8,
  },
  culturalNoteTag: {
    fontSize: 10,
    fontWeight: '900',
    color: GOLD_DARK,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  culturalNoteText: {
    fontSize: 12,
    color: '#605030',
    lineHeight: 17,
  },

  /* Módulos de Guía Lingüística */
  closeGuideBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  closeGuideText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
  },
  modulesGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  moduleMiniCard: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    overflow: 'hidden',
  },
  moduleAccentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  moduleMiniIcon: {
    width: 48,
    height: 48,
    marginLeft: 4,
    marginRight: 12,
  },
  moduleMiniBody: {
    flex: 1,
  },
  moduleMiniTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  moduleMiniQuechua: {
    fontSize: 12,
    fontWeight: '700',
    color: TEAL,
    marginBottom: 2,
  },
  moduleMiniDesc: {
    fontSize: 11,
    color: TEXT_MUTED,
    lineHeight: 15,
    marginBottom: 4,
  },
  moduleReadMoreRow: {
    marginTop: 2,
  },
  moduleReadMoreText: {
    fontSize: 12,
    fontWeight: '800',
  },

  /* Vista de Guía Activa */
  activeGuideContainer: {
    paddingHorizontal: 16,
  },
  activeGuideHero: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    borderWidth: 2,
    marginBottom: 14,
  },
  activeGuideHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeGuideHeroIcon: {
    width: 44,
    height: 44,
    marginRight: 12,
  },
  activeGuideHeroTitles: {
    flex: 1,
  },
  activeGuideBadge: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  activeGuideTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: TEXT_DARK,
  },
  activeGuideDesc: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  bottomCloseGuideBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  bottomCloseGuideText: {
    fontSize: 13,
    fontWeight: '800',
    color: TEAL_DARK,
  },

  /* Guías Internas */
  guideContentArea: {
    gap: 12,
  },
  guideCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  guideCardNum: {
    fontSize: 12,
    fontWeight: '900',
    color: TEAL,
  },
  guideCardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: TEXT_MUTED,
    letterSpacing: 0.8,
  },
  guideCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: TEXT_DARK,
    marginBottom: 6,
  },
  guideBodyText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  highlightTeal: {
    color: TEAL,
    fontWeight: '900',
  },
  vowelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  vowelItem: {
    flex: 1,
    backgroundColor: TEAL_LIGHT,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#C2E7E2',
  },
  vowelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vowelLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: TEAL_DARK,
  },
  vowelWord: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  vowelTrans: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  consonantList: {
    gap: 10,
  },
  consonantItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  consonantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consonantBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  consonantLetter: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  consonantInfo: {
    flex: 1,
  },
  consonantName: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  consonantTip: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  audioExampleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  audioExamplePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  audioExampleText: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  tableList: {
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
  },
  rowLeft: {
    flex: 1,
  },
  rowQuechua: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  rowEs: {
    fontSize: 12,
    color: GOLD_DARK,
    fontWeight: '700',
  },
  rowNote: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  suffixGrid: {
    gap: 8,
  },
  suffixCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suffixTag: {
    fontSize: 14,
    fontWeight: '900',
    color: ORANGE,
  },
  suffixType: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  suffixDesc: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  examplePill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exampleText: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  numberItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  numberQuechua: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  numberEs: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  familyGrid: {
    gap: 8,
  },
  familyCard: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  familyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  familyQuechua: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  familyEs: {
    fontSize: 12,
    color: TEAL_DARK,
    fontWeight: '700',
  },
  familyNote: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  phrasesList: {
    gap: 8,
  },
  phraseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  phraseLeft: {
    flex: 1,
    paddingRight: 8,
  },
  phraseQ: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_DARK,
  },
  phraseEs: {
    fontSize: 12,
    color: GREEN,
    fontWeight: '700',
    marginBottom: 2,
  },
  phraseTip: {
    fontSize: 10,
    color: TEXT_MUTED,
  },

  /* Empty State */
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BORDER,
    marginTop: 20,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: TEXT_DARK,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyStateBtn: {
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptyStateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Banner Inferior Puente hacia el Traductor */
  translatorBannerWrap: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  translatorBanner: {
    backgroundColor: TEAL_DARK,
    borderRadius: 18,
    padding: 18,
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  translatorBannerTextWrap: {
    marginBottom: 12,
  },
  translatorBannerTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#A7F3D0',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  translatorBannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  translatorBannerDesc: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 17,
  },
  translatorBannerBtn: {
    backgroundColor: GOLD,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  translatorBannerBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
