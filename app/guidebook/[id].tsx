import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AudioPronounceButton } from '@/components/yachay/audio-pronounce-button';
import { clearAudioCache } from '@/src/services/voiceService';

const TEAL = '#1B8B8C';
const TEAL_DARK = '#136566';
const TEAL_LIGHT = '#E0F2F1';
const GOLD = '#D48B0A';
const GOLD_LIGHT = '#FFF9E6';
const CREAM_BG = '#FAF7F2';
const TEXT_MAIN = '#2A1A0A';
const TEXT_MUTED = '#6B7280';
const CARD_BG = '#FFFFFF';
const BORDER_COLOR = '#E8E2D9';

export default function GuidebookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    clearAudioCache();
  }, []);

  return (
    <View style={styles.container}>
      {/* Barra superior delgada fija para navegación cómoda sin tapar el contenido */}
      <View style={styles.slimTopBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.slimBackBtn} activeOpacity={0.7}>
          <Text style={styles.slimBackText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.slimBarTitle}>Guía Gramatical y Fonética</Text>
        <View style={styles.slimPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Hero que hace scroll natural con el contenido */}
        <View style={styles.heroHeader}>
          <Text style={styles.heroSubtitle}>YACHAY SIMI • GUÍA COMPLETA</Text>
          <Text style={styles.heroTitle}>Gramática y Fonética Quechua</Text>
        </View>

        {/* Banner Introductorio */}
        <View style={styles.introBanner}>
          <Text style={styles.introEmoji}>🏔️</Text>
          <View style={styles.introTextWrap}>
            <Text style={styles.introTitle}>Runasimi Chanca y Cusco-Collao</Text>
            <Text style={styles.introDesc}>
              El Quechua es un idioma aglutinante, expresivo y musical. Toca cualquier botón de audio 🔊 para escuchar la pronunciación auténtica generada por el motor Yachay.
            </Text>
          </View>
        </View>

        {/* 1. Fonética Achahala y Vocales */}
        <View style={styles.sectionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.sectionNumber}>01</Text>
            <Text style={styles.sectionBadge}>FONÉTICA ACHAHALA</Text>
          </View>
          <Text style={styles.sectionTitle}>Sistema Trivocálico Quechua</Text>
          <Text style={styles.bodyText}>
            En el Quechua oficial contemporáneo solo existen <Text style={styles.bold}>3 vocales fonémicas</Text>: <Text style={styles.highlight}>A</Text>, <Text style={styles.highlight}>I</Text> y <Text style={styles.highlight}>U</Text>. Las vocales 'E' y 'O' aparecen únicamente como alófonos en contacto con la consonante posvelar 'Q'.
          </Text>

          <View style={styles.vowelGrid}>
            <View style={styles.vowelCard}>
              <View style={styles.vowelTop}>
                <Text style={styles.vowelLetter}>A</Text>
                <AudioPronounceButton text="Allin" size="small" />
              </View>
              <Text style={styles.vowelQuechua}>Allin</Text>
              <Text style={styles.vowelEs}>Bueno / Bien</Text>
            </View>

            <View style={styles.vowelCard}>
              <View style={styles.vowelTop}>
                <Text style={styles.vowelLetter}>I</Text>
                <AudioPronounceButton text="Inti" size="small" />
              </View>
              <Text style={styles.vowelQuechua}>Inti</Text>
              <Text style={styles.vowelEs}>Sol sagrado</Text>
            </View>

            <View style={styles.vowelCard}>
              <View style={styles.vowelTop}>
                <Text style={styles.vowelLetter}>U</Text>
                <AudioPronounceButton text="Urpi" size="small" />
              </View>
              <Text style={styles.vowelQuechua}>Urpi</Text>
              <Text style={styles.vowelEs}>Paloma / Amor</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Sonido especial: La consonante Q</Text>
            <Text style={styles.tipDesc}>
              La letra <Text style={styles.bold}>Q</Text> es una oclusiva posvelar (garganta profunda, similar a carraspear suavemente).
              Ejemplo: <Text style={styles.bold}>Qosqo</Text> (Cusco), <Text style={styles.bold}>Quri</Text> (Oro).
            </Text>
            <View style={styles.inlineAudio}>
              <AudioPronounceButton text="Qosqo" size="small" showLabel />
            </View>
          </View>
        </View>

        {/* 2. Pronombres Personales */}
        <View style={styles.sectionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionBadge}>RUNAKUNA • PRONOMBRES</Text>
          </View>
          <Text style={styles.sectionTitle}>Pronombres Personales</Text>
          <Text style={styles.bodyText}>
            El Quechua distingue dos formas de "nosotros": uno inclusivo (tú y yo juntos) y otro exclusivo (nosotros pero no tú).
          </Text>

          <View style={styles.tableList}>
            {[
              { q: 'Ñoqa', es: 'Yo', note: 'Primera persona singular' },
              { q: 'Qam', es: 'Tú / Usted', note: 'Segunda persona singular' },
              { q: 'Pay', es: 'Él / Ella', note: 'Tercera persona singular (sin género)' },
              { q: 'Ñoqanchik', es: 'Nosotros (Inclusivo)', note: 'Incluye a la persona con quien hablas' },
              { q: 'Ñoqayku', es: 'Nosotros (Exclusivo)', note: 'Excluye al oyente' },
              { q: 'Qamkuna', es: 'Ustedes', note: 'Segunda persona plural (-kuna)' },
              { q: 'Paykuna', es: 'Ellos / Ellas', note: 'Tercera persona plural' },
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

        {/* 3. Sufijos Esenciales */}
        <View style={styles.sectionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionBadge}>SIMI T’AQAKUNA • SUFIJOS</Text>
          </View>
          <Text style={styles.sectionTitle}>Estructura Aglutinante</Text>
          <Text style={styles.bodyText}>
            No existen artículos independientes ("el", "la", "los"). En su lugar, se adhieren sufijos directamente al final de la raíz léxica:
          </Text>

          <View style={styles.suffixGrid}>
            <View style={styles.suffixCard}>
              <View style={styles.suffixHead}>
                <Text style={styles.suffixTag}>-mi / -n</Text>
                <Text style={styles.suffixType}>Validador Testimonial</Text>
              </View>
              <Text style={styles.suffixExplain}>
                Indica certeza absoluta vivida en persona ("me consta"). Si la palabra termina en vocal se usa -mi, en consonante -n.
              </Text>
              <View style={styles.examplePill}>
                <Text style={styles.exampleText}>Allinmi (¡Estoy bien de verdad!)</Text>
                <AudioPronounceButton text="Allinmi" size="small" />
              </View>
            </View>

            <View style={styles.suffixCard}>
              <View style={styles.suffixHead}>
                <Text style={styles.suffixTag}>-chu</Text>
                <Text style={styles.suffixType}>Pregunta o Negación</Text>
              </View>
              <Text style={styles.suffixExplain}>
                Convierte la frase en pregunta cerrada (¿sí o no?), o junto a 'Mana' formula una negación.
              </Text>
              <View style={styles.examplePill}>
                <Text style={styles.exampleText}>Allinllachu? (¿Estás bien?)</Text>
                <AudioPronounceButton text="Allinllachu" size="small" />
              </View>
            </View>

            <View style={styles.suffixCard}>
              <View style={styles.suffixHead}>
                <Text style={styles.suffixTag}>-kuna</Text>
                <Text style={styles.suffixType}>Pluralizador Universal</Text>
              </View>
              <Text style={styles.suffixExplain}>
                Se agrega a cualquier sustantivo para pluralizarlo.
              </Text>
              <View style={styles.examplePill}>
                <Text style={styles.exampleText}>Wasikuna (Casas) [Wasi = Casa]</Text>
                <AudioPronounceButton text="Wasikuna" size="small" />
              </View>
            </View>

            <View style={styles.suffixCard}>
              <View style={styles.suffixHead}>
                <Text style={styles.suffixTag}>-manta</Text>
                <Text style={styles.suffixType}>Procedencia / Origen</Text>
              </View>
              <Text style={styles.suffixExplain}>
                Equivale a "de", "desde" o "acerca de".
              </Text>
              <View style={styles.examplePill}>
                <Text style={styles.exampleText}>Qosqomanta kani (Soy de Cusco)</Text>
                <AudioPronounceButton text="Qosqomanta kani" size="small" />
              </View>
            </View>
          </View>
        </View>

        {/* 4. Conjugación en Presente */}
        <View style={styles.sectionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.sectionNumber}>04</Text>
            <Text style={styles.sectionBadge}>RUWAY • CONJUGACIÓN</Text>
          </View>
          <Text style={styles.sectionTitle}>Presente Indicativo (Rimay = Hablar)</Text>
          <Text style={styles.bodyText}>
            Para conjugar un verbo en Quechua, se retira la terminación infinitiva <Text style={styles.bold}>-y</Text> y se agrega la desinencia del pronombre:
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

        {/* 5. Números Quechua */}
        <View style={styles.sectionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.sectionNumber}>05</Text>
            <Text style={styles.sectionBadge}>YUPAYKUNA • NÚMEROS</Text>
          </View>
          <Text style={styles.sectionTitle}>Los Números del 1 al 10 y Decimales</Text>
          <Text style={styles.bodyText}>
            El sistema numérico andino es perfectamente regular y decimal:
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
              <View key={num.n} style={styles.numberCard}>
                <View style={styles.numberBadge}>
                  <Text style={styles.numberDigit}>{num.n}</Text>
                </View>
                <Text style={styles.numberQ}>{num.q}</Text>
                <Text style={styles.numberEs}>{num.es}</Text>
                <AudioPronounceButton text={num.q} size="small" />
              </View>
            ))}
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>🔢 ¿Cómo formar números mayores?</Text>
            <Text style={styles.tipDesc}>
              Diez + uno se construye diciendo <Text style={styles.bold}>Chunka hukniyoq</Text> (11), <Text style={styles.bold}>Iskay chunka</Text> (20), <Text style={styles.bold}>Pachak</Text> (100) y <Text style={styles.bold}>Waranqa</Text> (1000).
            </Text>
          </View>
        </View>

        {/* 6. Frases de Convivencia y Cortesía */}
        <View style={styles.sectionCard}>
          <View style={styles.badgeRow}>
            <Text style={styles.sectionNumber}>06</Text>
            <Text style={styles.sectionBadge}>SUMAQ KAWSAY • CORTESÍA</Text>
          </View>
          <Text style={styles.sectionTitle}>Saludos y Principios Andinos</Text>

          <View style={styles.phrasesList}>
            {[
              { q: 'Allinllachu', es: '¿Estás bien? (Saludo formal)', tip: 'La respuesta es: Allinmi (Estoy bien)' },
              { q: 'Allin p’unchay', es: 'Buenos días', tip: 'Saludo al iniciar la mañana' },
              { q: 'Allin tuta', es: 'Buenas noches', tip: 'Despedida o saludo nocturno' },
              { q: 'Añay / Sulpayki', es: 'Muchas gracias', tip: 'Agradecimiento sincero' },
              { q: 'Tupananchiskama', es: 'Hasta que nos volvamos a ver', tip: 'No existe el "adiós" definitivo' },
              { q: 'Ama suwa, ama llulla, ama qella', es: 'No seas ladrón, ni mentiroso, ni ocioso', tip: 'Código ético ancestral' },
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

        {/* Pie de página motivacional */}
        <View style={styles.footerNote}>
          <Text style={styles.footerEmoji}>✨</Text>
          <Text style={styles.footerText}>
            ¡Sigue avanzando en tu camino! Cada lección en Yachay fortalece la identidad de nuestras raíces andinas.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM_BG,
  },
  slimTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: TEAL,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: TEAL_DARK,
    zIndex: 10,
  },
  slimBackBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  slimBackText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  slimBarTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  slimPlaceholder: {
    width: 65,
  },
  heroHeader: {
    backgroundColor: TEAL,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: TEAL_DARK,
    shadowColor: TEAL_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  heroSubtitle: {
    color: '#B2DFDB',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  introBanner: {
    flexDirection: 'row',
    backgroundColor: GOLD_LIGHT,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#F1D28C',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  introEmoji: {
    fontSize: 34,
  },
  introTextWrap: {
    flex: 1,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#7A4D00',
    marginBottom: 4,
  },
  introDesc: {
    fontSize: 13,
    color: '#6B4C18',
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sectionNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: TEAL,
    backgroundColor: TEAL_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: GOLD,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: TEXT_MAIN,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '800',
    color: TEXT_MAIN,
  },
  highlight: {
    fontWeight: '900',
    color: TEAL,
  },
  vowelGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  vowelCard: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#D4EAD6',
    alignItems: 'center',
  },
  vowelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
  },
  vowelLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: TEAL_DARK,
  },
  vowelQuechua: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXT_MAIN,
  },
  vowelEs: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
    textAlign: 'center',
  },
  tipBox: {
    backgroundColor: '#F3F8F8',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: TEAL,
    marginTop: 8,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TEAL_DARK,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  inlineAudio: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  tableList: {
    gap: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  rowLeft: {
    flex: 1,
  },
  rowQuechua: {
    fontSize: 16,
    fontWeight: '900',
    color: TEAL_DARK,
  },
  rowEs: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MAIN,
    marginTop: 1,
  },
  rowNote: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  suffixGrid: {
    gap: 12,
  },
  suffixCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFE9DE',
  },
  suffixHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  suffixTag: {
    fontSize: 16,
    fontWeight: '900',
    color: GOLD,
    backgroundColor: GOLD_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  suffixType: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_MUTED,
  },
  suffixExplain: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  examplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  exampleText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MAIN,
    flex: 1,
  },
  conjugationWrap: {
    gap: 8,
  },
  conjRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  conjLeft: {
    flex: 1,
  },
  conjPerson: {
    fontSize: 11,
    fontWeight: '800',
    color: GOLD,
    textTransform: 'uppercase',
  },
  conjVerb: {
    fontSize: 16,
    fontWeight: '900',
    color: TEAL_DARK,
  },
  conjRoot: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  numberCard: {
    width: '48%',
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: 'center',
    gap: 4,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberDigit: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  numberQ: {
    fontSize: 15,
    fontWeight: '900',
    color: TEXT_MAIN,
  },
  numberEs: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  phrasesList: {
    gap: 10,
  },
  phraseCard: {
    backgroundColor: '#FAF9F6',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  phraseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  phraseQuechua: {
    fontSize: 16,
    fontWeight: '900',
    color: TEAL_DARK,
    flex: 1,
  },
  phraseEs: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_MAIN,
    marginBottom: 4,
  },
  phraseTip: {
    fontSize: 11,
    color: GOLD,
    fontStyle: 'italic',
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 6,
  },
  footerEmoji: {
    fontSize: 24,
  },
  footerText: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
});
