export type PhoneticGuide = {
  ipa: string;
  /** Transcripción fonética estilo "se pronuncia [pipol]" */
  phoneticSpelling: string;
  articulatoryTip: string;
  exampleWord: string;
  exampleMeaning: string;
  audioText: string;
};

/**
 * Guía fonética oficial para fonemas y palabras en Quechua.
 * Los consejos son cortos y comparativos, estilo "tipo wan para one".
 */
/**
 * Extrae el fonema clave de un texto (si el texto es una descripción larga, devuelve rawText).
 * Útil cuando card.quechua contiene la descripción en lugar de solo la letra.
 */
export function extractCorePhoneme(rawText: string): string {
  const clean = rawText.trim();
  // Short texts are already phonemes
  if (clean.length <= 4) return clean.toLowerCase();

  // 1. Extract letter between any kind of quotes: 'k', "k", ‘k’, “k” etc.
  const quotedMatch = clean.match(/['"‘’“”]([a-záéíóúñü]{1,3})['"‘’“”]/i);
  if (quotedMatch) return quotedMatch[1].toLowerCase();

  // 2. "consonante q", "vocal a", "letra k", "fonema s", "sonido ch"
  const wordMatch = clean.match(/(?:consonante|vocal|letra|fonema|sonido)\s+([a-záéíóúñü]{1,3})/i);
  if (wordMatch) return wordMatch[1].toLowerCase();

  // 3. Si empieza con una letra corta (1-3 chars) seguida de espacio, es el fonema
  const startMatch = clean.match(/^([a-záéíóúñü]{1,3})\s/i);
  if (startMatch) return startMatch[1].toLowerCase();

  // No se pudo extraer — devolver el texto original
  return clean;
}

export function getQuechuaPhoneticGuide(rawText: string): PhoneticGuide {
  const clean = (rawText || '').toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()¡!¿?]/g, '');

  switch (clean) {
    case 'a':
      return {
        ipa: '/a/',
        phoneticSpelling: 'a → se pronuncia [a] (como en "casa")',
        articulatoryTip: 'Boca bien abierta, suena igual que la "a" en español.',
        exampleWord: 'a',
        exampleMeaning: 'Vocal abierta',
        audioText: 'a',
      };
    case 'i':
      return {
        ipa: '/i/',
        phoneticSpelling: 'i → se pronuncia [i] (como en "sí")',
        articulatoryTip: 'Labios estirados hacia los lados, igual que la "i" en español.',
        exampleWord: 'i',
        exampleMeaning: 'Vocal cerrada',
        audioText: 'i',
      };
    case 'u':
      return {
        ipa: '/u/',
        phoneticSpelling: 'u → se pronuncia [u] (como en "luz")',
        articulatoryTip: 'Labios redondeados, igual que la "u" en español.',
        exampleWord: 'u',
        exampleMeaning: 'Vocal posterior',
        audioText: 'u',
      };
    case 'ch':
      return {
        ipa: '/tʃ/',
        phoneticSpelling: 'ch → se pronuncia [ch] (como en "chico")',
        articulatoryTip: 'Igual que la "ch" del español, seca y corta.',
        exampleWord: 'ch',
        exampleMeaning: 'Consonante palatal',
        audioText: 'cha',
      };
    case 'k':
      return {
        ipa: '/k/',
        phoneticSpelling: 'k → se pronuncia [k] (como en "kilo", sin aspirar)',
        articulatoryTip: 'Como la "c" de "casa" pero sin soplo de aire.',
        exampleWord: 'k',
        exampleMeaning: 'Consonante velar',
        audioText: 'ka',
      };
    case 'q':
      return {
        ipa: '/q/',
        phoneticSpelling: 'q → se pronuncia [ka] (gutural profunda andina, no "qua")',
        articulatoryTip: 'Más profunda que la "k" — desde la garganta, similar a "ka" con fuerza.',
        exampleWord: 'q',
        exampleMeaning: 'Consonante posvelar',
        audioText: 'ka',
      };
    case 'p':
      return {
        ipa: '/p/',
        phoneticSpelling: 'p → se pronuncia [p] (como en "papá", sin soplo)',
        articulatoryTip: 'Igual que la "p" española pero sin soplo de aire al soltarla.',
        exampleWord: 'p',
        exampleMeaning: 'Consonante bilabial',
        audioText: 'pa',
      };
    case 't':
      return {
        ipa: '/t/',
        phoneticSpelling: 't → se pronuncia [t] (como en "taza")',
        articulatoryTip: 'Igual que la "t" española, lengua contra los dientes.',
        exampleWord: 't',
        exampleMeaning: 'Consonante dental',
        audioText: 'ta',
      };
    case 'm':
      return {
        ipa: '/m/',
        phoneticSpelling: 'm → se pronuncia [m] (como en "mamá")',
        articulatoryTip: 'Igual que la "m" española, labios cerrados y vibra en la nariz.',
        exampleWord: 'm',
        exampleMeaning: 'Consonante nasal',
        audioText: 'ma',
      };
    case 'n':
      return {
        ipa: '/n/',
        phoneticSpelling: 'n → se pronuncia [n] (como en "noche")',
        articulatoryTip: 'Igual que la "n" española, lengua arriba y resuena en la nariz.',
        exampleWord: 'n',
        exampleMeaning: 'Consonante nasal',
        audioText: 'na',
      };
    case 'ñ':
      return {
        ipa: '/ɲ/',
        phoneticSpelling: 'ñ → se pronuncia [ñ] (como en "niño")',
        articulatoryTip: 'Igual que la "ñ" española, nasal y suave.',
        exampleWord: 'ñ',
        exampleMeaning: 'Nasal palatal',
        audioText: 'ña',
      };
    case 's':
      return {
        ipa: '/s/',
        phoneticSpelling: 's → se pronuncia [s] (como en "sol")',
        articulatoryTip: 'Igual que la "s" española, silbido suave sin voz.',
        exampleWord: 's',
        exampleMeaning: 'Consonante fricativa',
        audioText: 'sa',
      };
    case 'sh':
      return {
        ipa: '/ʃ/',
        phoneticSpelling: 'sh → se pronuncia [sha] (como en inglés "show", no "saa")',
        articulatoryTip: 'Labios hacia adelante, sonido soplado suave "sh".',
        exampleWord: 'sh',
        exampleMeaning: 'Fricativa postalveolar',
        audioText: 'sha',
      };
    case 'w':
      return {
        ipa: '/w/',
        phoneticSpelling: 'w → se pronuncia [u] (semivocal pura, suena tipo "u")',
        articulatoryTip: 'Suena como "u" — labios redondeados y vocal corta.',
        exampleWord: 'w',
        exampleMeaning: 'Semivocal labiovelar',
        audioText: 'u',
      };
    case 'y':
      return {
        ipa: '/j/',
        phoneticSpelling: 'y → se pronuncia [y] (como en "yo")',
        articulatoryTip: 'Igual que la "y" española al inicio de sílaba, rápida y suave.',
        exampleWord: 'y',
        exampleMeaning: 'Semivocal palatal',
        audioText: 'ya',
      };
    case 'r':
      return {
        ipa: '/ɾ/',
        phoneticSpelling: 'r → se pronuncia [r] (como en "pero", un solo golpe)',
        articulatoryTip: 'Como la "r" de "pero", no la "rr" doble — un solo toque de lengua.',
        exampleWord: 'r',
        exampleMeaning: 'Vibrante simple',
        audioText: 'ra',
      };
    case 'l':
      return {
        ipa: '/l/',
        phoneticSpelling: 'l → se pronuncia [l] (como en "luna")',
        articulatoryTip: 'Igual que la "l" española, lengua arriba y fluida.',
        exampleWord: 'l',
        exampleMeaning: 'Consonante lateral',
        audioText: 'la',
      };
    case 'll':
      return {
        ipa: '/ʎ/',
        phoneticSpelling: 'll → se pronuncia [ll] (palatal andina / elle)',
        articulatoryTip: 'Como la "ll" andina — lateral palatal.',
        exampleWord: 'll',
        exampleMeaning: 'Lateral palatal',
        audioText: 'elle',
      };

    // ─── Vocabulario de Saludos y Despedidas ───────────────────
    case 'tupananchiskama':
      return {
        ipa: '/tupanantʃiskama/',
        phoneticSpelling: 'Tupananchiskama → se pronuncia [tu-pa-nan-chis-ka-ma]',
        articulatoryTip: 'Acento en la penúltima sílaba: tu-pa-nan-chis-KA-ma.',
        exampleWord: 'Tupananchiskama',
        exampleMeaning: 'Hasta que nos volvamos a ver',
        audioText: 'tupananchiskama',
      };
    case 'allin p\'unchaw':
    case 'allin punchaw':
      return {
        ipa: '/aʎin puntʃaw/',
        phoneticSpelling: "Allin p'unchaw → se pronuncia [a-llin pún-chao]",
        articulatoryTip: "La comilla (') en p'unchaw indica un corte glotal suave al soltar la 'p'.",
        exampleWord: "Allin p'unchaw",
        exampleMeaning: 'Buenos días',
        audioText: 'allin punchaw',
      };
    case 'allianchu':
      return {
        ipa: '/aʎiantʃu/',
        phoneticSpelling: 'Allianchu → se pronuncia [a-lli-an-chu]',
        articulatoryTip: 'Énfasis en "an": a-lli-AN-chu.',
        exampleWord: 'Allianchu',
        exampleMeaning: '¿Cómo estás?',
        audioText: 'allianchu',
      };
    case 'allillanmi':
      return {
        ipa: '/aʎiʎanmi/',
        phoneticSpelling: 'Allillanmi → se pronuncia [a-lli-llan-mi]',
        articulatoryTip: 'Énfasis en la penúltima sílaba: a-lli-LLAN-mi.',
        exampleWord: 'Allillanmi',
        exampleMeaning: 'Estoy bien',
        audioText: 'allillanmi',
      };
    case 'yupaychani':
      return {
        ipa: '/jupajtʃani/',
        phoneticSpelling: 'Yupaychani → se pronuncia [yu-pay-cha-ni]',
        articulatoryTip: 'Énfasis en "cha": yu-pay-CHA-ni.',
        exampleWord: 'Yupaychani',
        exampleMeaning: 'Gracias',
        audioText: 'yupaychani',
      };

    // ─── Números ──────────────────────────────────────────────
    case 'huk':
      return {
        ipa: '/huk/',
        phoneticSpelling: 'huk → se pronuncia [juk] (con "j" suave y aspirada)',
        articulatoryTip: 'La "h" suena como una "j" suave andina.',
        exampleWord: 'huk',
        exampleMeaning: 'Uno',
        audioText: 'huk',
      };
    case 'iskay':
      return {
        ipa: '/israj/',
        phoneticSpelling: 'iskay → se pronuncia [is-kay]',
        articulatoryTip: 'Acento en la primera sílaba: IS-kay.',
        exampleWord: 'iskay',
        exampleMeaning: 'Dos',
        audioText: 'iskay',
      };
    case 'kimsa':
      return {
        ipa: '/kimsa/',
        phoneticSpelling: 'kimsa → se pronuncia [kim-sa]',
        articulatoryTip: 'Acento en la primera sílaba: KIM-sa.',
        exampleWord: 'kimsa',
        exampleMeaning: 'Tres',
        audioText: 'kimsa',
      };
    case 'tawa':
      return {
        ipa: '/tawa/',
        phoneticSpelling: 'tawa → se pronuncia [ta-wa]',
        articulatoryTip: 'Acento en la primera sílaba: TA-wa.',
        exampleWord: 'tawa',
        exampleMeaning: 'Cuatro',
        audioText: 'tawa',
      };
    case 'pichqa':
      return {
        ipa: '/pitʃqa/',
        phoneticSpelling: 'pichqa → se pronuncia [pich-qa] (con "q" desde la garganta)',
        articulatoryTip: 'Pronuncia la "q" final bien atrás en la garganta.',
        exampleWord: 'pichqa',
        exampleMeaning: 'Cinco',
        audioText: 'pichqa',
      };
    case 'suqta':
      return {
        ipa: '/soqta/',
        phoneticSpelling: 'suqta → se pronuncia [soq-ta] (la "q" abre la "u" a "o")',
        articulatoryTip: 'Junto a la "q", la "u" suena más abierta, similar a "o".',
        exampleWord: 'suqta',
        exampleMeaning: 'Seis',
        audioText: 'suqta',
      };
    case 'qanchis':
      return {
        ipa: '/qantʃis/',
        phoneticSpelling: 'qanchis → se pronuncia [qan-chis]',
        articulatoryTip: 'La "q" inicial nace en la garganta.',
        exampleWord: 'qanchis',
        exampleMeaning: 'Siete',
        audioText: 'qanchis',
      };
    case 'pusaq':
      return {
        ipa: '/pusaq/',
        phoneticSpelling: 'pusaq → se pronuncia [pu-saq]',
        articulatoryTip: 'Termina con la "q" posvelar gutural.',
        exampleWord: 'pusaq',
        exampleMeaning: 'Ocho',
        audioText: 'pusaq',
      };
    case 'isqon':
      return {
        ipa: '/isqon/',
        phoneticSpelling: 'isqon → se pronuncia [is-qon]',
        articulatoryTip: 'La "q" profunda en el centro de la palabra.',
        exampleWord: 'isqon',
        exampleMeaning: 'Nueve',
        audioText: 'isqon',
      };
    case 'chunka':
      return {
        ipa: '/tʃuŋka/',
        phoneticSpelling: 'chunka → se pronuncia [chun-ka]',
        articulatoryTip: 'Acento en la primera sílaba: CHUN-ka.',
        exampleWord: 'chunka',
        exampleMeaning: 'Diez',
        audioText: 'chunka',
      };

    // ─── Familia ──────────────────────────────────────────────
    case 'mama':
      return {
        ipa: '/mama/',
        phoneticSpelling: 'Mama → se pronuncia [ma-ma]',
        articulatoryTip: 'Acento en la primera sílaba: MA-ma.',
        exampleWord: 'Mama',
        exampleMeaning: 'Mamá / Madre',
        audioText: 'mama',
      };
    case 'tayta':
      return {
        ipa: '/tajta/',
        phoneticSpelling: 'Tayta → se pronuncia [tay-ta]',
        articulatoryTip: 'Acento en la primera sílaba: TAY-ta.',
        exampleWord: 'Tayta',
        exampleMeaning: 'Papá / Padre',
        audioText: 'tayta',
      };
    case 'wawqi':
      return {
        ipa: '/wawqi/',
        phoneticSpelling: 'Wawqi → se pronuncia [waw-qi]',
        articulatoryTip: 'La "w" suave y la "q" gutural: waw-QI.',
        exampleWord: 'Wawqi',
        exampleMeaning: 'Hermano (de varón)',
        audioText: 'wawqi',
      };
    case 'pana':
      return {
        ipa: '/pana/',
        phoneticSpelling: 'Pana → se pronuncia [pa-na]',
        articulatoryTip: 'Acento en la primera sílaba: PA-na.',
        exampleWord: 'Pana',
        exampleMeaning: 'Hermana (de varón)',
        audioText: 'pana',
      };
    case 'awicha':
      return {
        ipa: '/awitʃa/',
        phoneticSpelling: 'Awicha → se pronuncia [a-wi-cha]',
        articulatoryTip: 'Acento en la penúltima sílaba: a-WI-cha.',
        exampleWord: 'Awicha',
        exampleMeaning: 'Abuela',
        audioText: 'awicha',
      };

    default: {
      const word = rawText.trim();
      return {
        ipa: `[${word.toLowerCase()}]`,
        phoneticSpelling: `${word} → se pronuncia [${word.toLowerCase()}]`,
        articulatoryTip: 'Pronuncia con énfasis natural en la penúltima sílaba.',
        exampleWord: word,
        exampleMeaning: 'Palabra Quechua',
        audioText: word,
      };
    }
  }
}
