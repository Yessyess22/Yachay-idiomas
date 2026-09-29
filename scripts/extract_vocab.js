const fs = require('fs');
const path = require('path');

// 1. Official 25 Quechua Phonemes (Achahala)
const ACHAHALA_LETTERS = [
  { letter: 'A', spoken: 'a', slug: 'letter_a' },
  { letter: 'CH', spoken: 'cha', slug: 'letter_cha' },
  { letter: "CH'", spoken: 'cha', slug: 'letter_ch_glottal' },
  { letter: 'H', spoken: 'ja', slug: 'letter_h' },
  { letter: 'I', spoken: 'i', slug: 'letter_i' },
  { letter: 'K', spoken: 'ka', slug: 'letter_k' },
  { letter: 'KH', spoken: 'kha', slug: 'letter_kh' },
  { letter: "K'", spoken: 'ka', slug: 'letter_k_glottal' },
  { letter: 'L', spoken: 'la', slug: 'letter_l' },
  { letter: 'LL', spoken: 'elle', slug: 'letter_ll' },
  { letter: 'M', spoken: 'ma', slug: 'letter_m' },
  { letter: 'N', spoken: 'na', slug: 'letter_n' },
  { letter: 'Ñ', spoken: 'ña', slug: 'letter_nn' },
  { letter: 'P', spoken: 'pa', slug: 'letter_p' },
  { letter: 'PH', spoken: 'pha', slug: 'letter_ph' },
  { letter: "P'", spoken: 'pa', slug: 'letter_p_glottal' },
  { letter: 'Q', spoken: 'qa', slug: 'letter_q' },
  { letter: 'QH', spoken: 'qha', slug: 'letter_qh' },
  { letter: "Q'", spoken: 'qa', slug: 'letter_q_glottal' },
  { letter: 'R', spoken: 'ra', slug: 'letter_r' },
  { letter: 'S', spoken: 'sa', slug: 'letter_s' },
  { letter: 'T', spoken: 'ta', slug: 'letter_t' },
  { letter: "T'", spoken: 'ta', slug: 'letter_t_glottal' },
  { letter: 'U', spoken: 'u', slug: 'letter_u' },
  { letter: 'W', spoken: 'wa', slug: 'letter_w' },
  { letter: 'Y', spoken: 'ya', slug: 'letter_y' },
];

function normalizeKey(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_'`~()¿?¡!\\"]/g, '')
    .replace(/\s+/g, ' ');
}

function slugify(text) {
  return normalizeKey(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 45);
}

// Clean text for MMS-TTS synthesis:
// Strip glottal stop apostrophes (Q'omer -> qomer, Ch'aska -> chaska) because Meta MMS
// produces corrupted sounds or errors when encountering punctuation inside Quechua words.
function cleanForTTS(text) {
  return text
    .replace(/['"`\\]/g, '')
    .replace(/[¿?¡!.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mapeo fonético para palabras que sufren distorsión en el sintetizador Meta MMS aislado
const PHONETIC_TTS_OVERRIDES = {
  'inti': 'yinti', // Meta MMS genera "sino ri" con "inti", pero "inti" perfecto (99% conf) con "yinti"
  'hatun': 'jatun', // En quechua la 'h' es [x] ("ja"); "jatun" produce "hatun" auténtico (98% conf en STT)
  'huk': 'juk',     // "juk" produce "huk" auténtico
};

const entries = new Map(); // key -> { key, slug, spokenText, isLetter?: boolean }

function addAudioEntry(keyText, spokenText, customSlug) {
  const cleanKey = normalizeKey(keyText);
  if (!cleanKey) return;
  // Ignore Spanish headers / emojis
  if (/[\u{1F300}-\u{1F9FF}]/u.test(cleanKey)) return;
  if (/^\d+$/.test(cleanKey)) return;
  if (cleanKey.includes('alfabeto') || cleanKey.includes('oficial')) return;

  const baseTtsText = cleanForTTS(spokenText);
  const slug = customSlug || slugify(baseTtsText);
  if (!slug) return;

  const ttsText = PHONETIC_TTS_OVERRIDES[baseTtsText.toLowerCase()] || baseTtsText;

  if (!entries.has(cleanKey)) {
    entries.set(cleanKey, { key: cleanKey, slug, spokenText: ttsText });
  }
}

// 1. Add Achahala letters
for (const item of ACHAHALA_LETTERS) {
  addAudioEntry(item.letter, item.spoken, item.slug);
  addAudioEntry(item.letter.toLowerCase(), item.spoken, item.slug);
}

// 2. Read lessonContent.ts
const lessonContentPath = path.join(__dirname, '..', 'src', 'content', 'lessonContent.ts');
const lessonContent = fs.readFileSync(lessonContentPath, 'utf8');

// Match `quechua:` values safely (handles single and double quotes)
const quechuaRegex = /quechua:\s*(["'])([\s\S]*?)\1/g;
let match;
while ((match = quechuaRegex.exec(lessonContent)) !== null) {
  const raw = match[2].trim();
  if (raw.startsWith('📖') || raw.includes('Alfabeto')) continue;

  // Format: "LETTER (Word)" e.g. "Q' (Q'omer)" or "CH (Chaki)"
  const parenMatch = raw.match(/^([A-Za-zÑñ'\s]{1,6})\s*\((.+?)\)/);
  if (parenMatch) {
    const letter = parenMatch[1].trim();
    const word = parenMatch[2].trim();
    // Add the word inside parenthesis (e.g. "q'omer" -> spoken "qomer")
    addAudioEntry(word, word);
    addAudioEntry(raw, word); // also map the full "Q' (Q'omer)" key
  } else {
    // Regular word e.g. "Allillanchu", "Inti"
    addAudioEntry(raw, raw);
  }
}

// 3. Read stories from src/content/stories.ts
const storiesPath = path.join(__dirname, '..', 'src', 'content', 'stories.ts');
if (fs.existsSync(storiesPath)) {
  const storiesContent = fs.readFileSync(storiesPath, 'utf8');
  // Match Yachi turns: speaker: 'yachi', quechua: '...'
  const yachiRegex = /speaker:\s*['"]yachi['"],\s*quechua:\s*(["'])([\s\S]*?)\1/g;
  while ((match = yachiRegex.exec(storiesContent)) !== null) {
    const quechuaSentence = match[2].trim();
    if (quechuaSentence) {
      const slug = `story_${slugify(quechuaSentence)}`;
      addAudioEntry(quechuaSentence, quechuaSentence, slug);
    }
  }
}

// 4. Read examService.ts listening words
const examServicePath = path.join(__dirname, '..', 'src', 'services', 'examService.ts');
if (fs.existsSync(examServicePath)) {
  const examContent = fs.readFileSync(examServicePath, 'utf8');
  const audioWordRegex = /audioWord:\s*(["'])([\s\S]*?)\1/g;
  while ((match = audioWordRegex.exec(examContent)) !== null) {
    const word = match[2].trim();
    if (word) addAudioEntry(word, word);
  }
}

console.log(`Total clean Quechua audio items: ${entries.size}`);
const sample = Array.from(entries.values()).slice(0, 35);
sample.forEach(e => console.log(`[${e.slug}] key="${e.key}" -> spoken="${e.spokenText}"`));

module.exports = {
  getAudioEntries: () => Array.from(entries.values()),
  ACHAHALA_LETTERS,
};
