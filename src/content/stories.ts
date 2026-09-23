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
};
