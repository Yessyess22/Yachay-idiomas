/**
 * Contenido estático del "Modo Historia": diálogos cortos e interactivos.
 * Se usan solo frases ya presentes y vetted en el contenido de la app
 * (ver supabase/seed.sql y src/utils/phoneticGuide.ts) para no introducir
 * gramática Quechua nueva sin revisión lingüística.
 */

export type StoryTurn =
  | { speaker: 'yachi'; quechua: string; spanish: string }
  | {
      speaker: 'user';
      prompt: string;
      options: { text: string; correct: boolean }[];
    };

export type Story = {
  slug: string;
  title: string;
  turns: StoryTurn[];
};

export const STORIES: Record<string, Story> = {
  numeros: {
    slug: 'numeros',
    title: 'Contando con Yachi',
    turns: [
      { speaker: 'yachi', quechua: 'Huk, iskay, kimsa!', spanish: '¡Uno, dos, tres!' },
      {
        speaker: 'user',
        prompt: '¿Cuánto es "iskay"?',
        options: [
          { text: 'Dos', correct: true },
          { text: 'Uno', correct: false },
          { text: 'Tres', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Tawa, pichqa!', spanish: '¡Cuatro, cinco!' },
      {
        speaker: 'user',
        prompt: '¿Cómo se dice "cinco" en Quechua?',
        options: [
          { text: 'Pichqa', correct: true },
          { text: 'Tawa', correct: false },
          { text: 'Kimsa', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Allinmi!', spanish: '¡Muy bien!' },
    ],
  },
  abecedario: {
    slug: 'abecedario',
    title: 'Una casa quechua',
    turns: [
      { speaker: 'yachi', quechua: 'Wasi!', spanish: '¡Casa!' },
      {
        speaker: 'user',
        prompt: '¿Qué significa "Wasi"?',
        options: [
          { text: 'Casa', correct: true },
          { text: 'Oro', correct: false },
          { text: 'Dulce', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Mishki!', spanish: '¡Dulce!' },
      {
        speaker: 'user',
        prompt: '¿Cómo se dice "bueno" en Quechua?',
        options: [
          { text: 'Allin', correct: true },
          { text: 'Wasi', correct: false },
          { text: 'Quri', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Allinmi!', spanish: '¡Muy bien!' },
    ],
  },
  palabras: {
    slug: 'palabras',
    title: 'Un saludo con Yachi',
    turns: [
      { speaker: 'yachi', quechua: "Allin p'unchaw!", spanish: '¡Buenos días!' },
      {
        speaker: 'user',
        prompt: '¿Qué significa lo que dijo Yachi?',
        options: [
          { text: 'Buenos días', correct: true },
          { text: 'Buenas noches', correct: false },
          { text: 'Hasta luego', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Allianchu?', spanish: '¿Cómo estás?' },
      {
        speaker: 'user',
        prompt: 'Responde "Estoy bien" en Quechua:',
        options: [
          { text: 'Allillanmi', correct: true },
          { text: 'Tupananchiskama', correct: false },
          { text: 'Yupaychani', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Yupaychani!', spanish: '¡Gracias!' },
      {
        speaker: 'user',
        prompt: '¿Qué significa "Yupaychani"?',
        options: [
          { text: 'Gracias', correct: true },
          { text: 'Adiós', correct: false },
          { text: 'Amigo', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Tupananchiskama!', spanish: '¡Hasta que nos volvamos a ver!' },
    ],
  },
  'el-zorro-y-el-condor': {
    slug: 'el-zorro-y-el-condor',
    title: 'El Zorro y el Cóndor',
    turns: [
      { speaker: 'yachi', quechua: 'Atoqqa Kunturwan hanan pachaman rirqan.', spanish: 'El zorro fue con el cóndor al mundo celestial.' },
      {
        speaker: 'user',
        prompt: '¿Quién viajó con el Cóndor (Kuntur)?',
        options: [
          { text: 'El Zorro (Atoq)', correct: true },
          { text: 'El Puma', correct: false },
          { text: 'La Llama', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Hanan pachapi mikhuymanta sarata mikhurqan!', spanish: '¡En las alturas comió el maíz sagrado!' },
      {
        speaker: 'user',
        prompt: '¿Cómo se dice "maíz" en Quechua?',
        options: [
          { text: 'Sara', correct: true },
          { text: 'Papa', correct: false },
          { text: 'Kinwa', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Chayrayku kay allpaman mikhuykuna chayamurqan!', spanish: '¡Por eso las semillas llegaron a la tierra!' },
      {
        speaker: 'user',
        prompt: '¿Qué nos enseña este cuento tradicional andino?',
        options: [
          { text: 'El origen de los alimentos en la tierra', correct: true },
          { text: 'Cómo construir casas de piedra', correct: false },
          { text: 'Cómo viajar en balsa', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Allillamanta yachanchis! Añay!', spanish: '¡Poco a poco aprendemos! ¡Gracias!' },
    ],
  },
  'manco-capac': {
    slug: 'manco-capac',
    title: 'Manco Cápac y Mama Ocllo',
    turns: [
      { speaker: 'yachi', quechua: 'Inti taytanchismi runakunata yanapanapaq kachamurqan.', spanish: 'El padre Sol los envió para ayudar y enseñar al pueblo.' },
      {
        speaker: 'user',
        prompt: '¿Quién envió a Manco Cápac y Mama Ocllo?',
        options: [
          { text: 'Inti (El Sol)', correct: true },
          { text: 'Killa (La Luna)', correct: false },
          { text: 'Mayu (El Río)', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Titiqaqa quchamanta lluqsimurqanku.', spanish: 'Emergieron del sagrado lago Titicaca.' },
      {
        speaker: 'user',
        prompt: '¿De dónde emergieron según la leyenda?',
        options: [
          { text: 'Titiqaqa quchamanta (Del Lago Titicaca)', correct: true },
          { text: 'Quri wasimanta (De la casa de oro)', correct: false },
          { text: 'Urpimanta (De la paloma)', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Quri tawrnata allpaman sat\'irqanku Qusqupi!', spanish: '¡Hundieron la vara de oro en Cusco!' },
      {
        speaker: 'user',
        prompt: '¿Qué significa la palabra "Quri"?',
        options: [
          { text: 'Oro', correct: true },
          { text: 'Plata', correct: false },
          { text: 'Tierra', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Chaypi hatun Tawantinsuyu paqarirqan!', spanish: '¡Allí nació el gran Tawantinsuyu!' },
    ],
  },
  'sumaq-kawsay': {
    slug: 'sumaq-kawsay',
    title: 'El Buen Vivir (Sumaq Kawsay)',
    turns: [
      { speaker: 'yachi', quechua: 'Sumaq Kawsayqa Pachamamawan allin kawsaymi.', spanish: 'El Buen Vivir es convivir en armonía con la Madre Tierra.' },
      {
        speaker: 'user',
        prompt: '¿Qué significa "Pachamama"?',
        options: [
          { text: 'Madre Tierra / Naturaleza', correct: true },
          { text: 'Casa hermosa', correct: false },
          { text: 'Gran río', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Ayni: Paqarin qanpaq, mincha ñuqaqpaw.', spanish: 'Ayni: Hoy por ti, mañana por mí.' },
      {
        speaker: 'user',
        prompt: '¿Qué principio andino representa el "Ayni"?',
        options: [
          { text: 'Reciprocidad y ayuda mutua comunitaria', correct: true },
          { text: 'Competencia individual', correct: false },
          { text: 'Comercio internacional', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Ama suwa, ama llulla, ama qilla: allin runa kay!', spanish: '¡No seas ladrón, ni mentiroso, ni ocioso: sé una persona honorable!' },
      {
        speaker: 'user',
        prompt: '¿Cuál es el código moral tripartito incaico?',
        options: [
          { text: 'Ama suwa, ama llulla, ama qilla', correct: true },
          { text: 'Inti, Killa, Ch\'aska', correct: false },
          { text: 'Huk, Iskay, Kimsa', correct: false },
        ],
      },
      { speaker: 'yachi', quechua: 'Kawsachun Runasimi! Tupananchiskama!', spanish: '¡Que viva el Quechua! ¡Hasta volver a vernos!' },
    ],
  },
};
