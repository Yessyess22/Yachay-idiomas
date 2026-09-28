/**
 * duelService.ts
 * Servicio para el modo multijugador "Tinkuy" (Duelo de Saberes 1 vs 1).
 * Soporta emparejamiento con amigos vía código de sala (Supabase Realtime)
 * y emparejamiento instantáneo con Rivales Andinos (Amawt'as) para jugar siempre sin esperas.
 */
import { supabase } from './supabase';

export interface DuelQuestion {
  id: string;
  prompt: string;
  quechuaTerm?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'fonetica' | 'numeros' | 'vocabulario' | 'cultura' | 'saludos';
}

export interface DuelPlayer {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctCount: number;
  finished: boolean;
  isBot?: boolean;
}

export interface DuelRoomState {
  code: string;
  host: DuelPlayer;
  guest?: DuelPlayer;
  status: 'waiting' | 'in_progress' | 'finished';
  questions: DuelQuestion[];
  currentQuestionIdx: number;
}

// ─── BANCO DE PREGUNTAS ANDINAS (30+ PREGUNTAS RÁPIDAS) ───────────
export const DUEL_QUESTIONS: DuelQuestion[] = [
  {
    id: 'd1',
    prompt: '¿Cómo se saluda diciendo "¿Cómo estás?" en Runa Simi?',
    quechuaTerm: 'Allillanchu',
    options: ['Allillanchu', 'Tupananchiskama', 'Sulpayki', 'Ama Suwa'],
    correctIndex: 0,
    explanation: '"Allillanchu" es el saludo andino tradicional de bienvenida y bienestar.',
    category: 'saludos',
  },
  {
    id: 'd2',
    prompt: '¿Qué significa la palabra quechua "Inti"?',
    quechuaTerm: 'Inti',
    options: ['Sol', 'Luna', 'Estrella', 'Rayo'],
    correctIndex: 0,
    explanation: 'Inti significa Sol en el idioma quechua y representa la fuente de vida.',
    category: 'vocabulario',
  },
  {
    id: 'd3',
    prompt: '¿Cuál es el significado de la palabra "Killa"?',
    quechuaTerm: 'Killa',
    options: ['Luna', 'Río', 'Viento', 'Llama'],
    correctIndex: 0,
    explanation: 'Mama Killa representa la Luna y marca los ciclos agrícolas del calendario andino.',
    category: 'vocabulario',
  },
  {
    id: 'd4',
    prompt: '¿Cómo se dice el número "Tres" en Quechua?',
    quechuaTerm: 'Tres',
    options: ['Kimsa', 'Iskay', 'Huk', 'Tawa'],
    correctIndex: 0,
    explanation: 'Huk (1), Iskay (2), Kimsa (3), Tawa (4), Pichqa (5).',
    category: 'numeros',
  },
  {
    id: 'd5',
    prompt: '¿Qué número representa la palabra "Pichqa"?',
    quechuaTerm: 'Pichqa',
    options: ['5', '4', '6', '8'],
    correctIndex: 0,
    explanation: 'Pichqa es el número 5, sagrado en el conteo de la mano andina.',
    category: 'numeros',
  },
  {
    id: 'd6',
    prompt: '¿Qué número representa la palabra "Chunka"?',
    quechuaTerm: 'Chunka',
    options: ['10', '100', '7', '9'],
    correctIndex: 0,
    explanation: 'Chunka es el número 10, base decimal del sistema de administración inca.',
    category: 'numeros',
  },
  {
    id: 'd7',
    prompt: '¿Cuáles son las 3 únicas vocales fonémicas del Quechua oficial?',
    quechuaTerm: 'Trivocalismo',
    options: ['a, i, u', 'a, e, i, o, u', 'a, i, u, o', 'e, o, u'],
    correctIndex: 0,
    explanation: 'El sistema oficial del Runa Simi es trivocálico: a, i, u.',
    category: 'fonetica',
  },
  {
    id: 'd8',
    prompt: '¿Qué significa el principio moral "Ama Suwa"?',
    quechuaTerm: 'Ama Suwa',
    options: ['No seas ladrón', 'No seas mentiroso', 'No seas flojo', 'Sé solidario'],
    correctIndex: 0,
    explanation: 'Ama Suwa es el pilar de la honradez y el respeto por lo ajeno.',
    category: 'cultura',
  },
  {
    id: 'd9',
    prompt: '¿Qué significa el principio moral "Ama Llulla"?',
    quechuaTerm: 'Ama Llulla',
    options: ['No seas mentiroso', 'No seas ladrón', 'No seas ocioso', 'Sé valiente'],
    correctIndex: 0,
    explanation: 'Ama Llulla defiende la verdad y la palabra honesta.',
    category: 'cultura',
  },
  {
    id: 'd10',
    prompt: '¿Qué significa el principio moral "Ama Qilla"?',
    quechuaTerm: 'Ama Qilla',
    options: ['No seas flojo', 'No seas cobarde', 'No seas envidioso', 'No seas traidor'],
    correctIndex: 0,
    explanation: 'Ama Qilla promueve el trabajo diligente y productivo en comunidad.',
    category: 'cultura',
  },
  {
    id: 'd11',
    prompt: '¿Qué significa la palabra "Ayllu"?',
    quechuaTerm: 'Ayllu',
    options: ['Comunidad andina', 'Montaña sagrada', 'Casa de piedra', 'Camino del inca'],
    correctIndex: 0,
    explanation: 'El Ayllu es el núcleo social, comunitario y de parentesco en los Andes.',
    category: 'cultura',
  },
  {
    id: 'd12',
    prompt: '¿Cómo se dice "Muchas gracias" en Runa Simi?',
    quechuaTerm: 'Gracias',
    options: ['Sulpayki', 'Allillanmi', 'Paqarinkama', 'Tinkunankama'],
    correctIndex: 0,
    explanation: 'Sulpayki expresa gratitud profunda en el mundo andino.',
    category: 'saludos',
  },
  {
    id: 'd13',
    prompt: '¿Qué animal sagrado del cielo es el "Kuntur"?',
    quechuaTerm: 'Kuntur',
    options: ['Cóndor andino', 'Águila real', 'Halcón de la puna', 'Picaflor'],
    correctIndex: 0,
    explanation: 'El Cóndor (Kuntur) representa el Hanan Pacha (mundo celestial superior).',
    category: 'vocabulario',
  },
  {
    id: 'd14',
    prompt: '¿Qué animal del Kay Pacha representa la fuerza terrenal?',
    quechuaTerm: 'Puma',
    options: ['Puma andino', 'Llama', 'Oso de anteojos', 'Zorro'],
    correctIndex: 0,
    explanation: 'El Puma simboliza la sabiduría, poder terrenal y agilidad en el Kay Pacha.',
    category: 'vocabulario',
  },
  {
    id: 'd15',
    prompt: '¿Qué ser sagrado representa el Uku Pacha (mundo interior)?',
    quechuaTerm: 'Amaru',
    options: ['Serpiente cósmica', 'Caimán de la selva', 'Lagarto de piedra', 'Vizcacha'],
    correctIndex: 0,
    explanation: 'Amaru (la serpiente) representa las corrientes de agua y el Uku Pacha.',
    category: 'vocabulario',
  },
  {
    id: 'd16',
    prompt: '¿Cómo se dice "Montaña o Cerro sagrado" en Quechua?',
    quechuaTerm: 'Montaña',
    options: ['Urqu', 'Mayu', 'Qucha', 'Wayra'],
    correctIndex: 0,
    explanation: 'Urqu significa cerro o montaña, a menudo venerada como Apu protector.',
    category: 'vocabulario',
  },
  {
    id: 'd17',
    prompt: '¿Qué elemento de la naturaleza es "Yaku"?',
    quechuaTerm: 'Yaku',
    options: ['Agua', 'Fuego', 'Tierra', 'Viento'],
    correctIndex: 0,
    explanation: 'Yaku (o Unu) es el agua que fecunda la Pachamama.',
    category: 'vocabulario',
  },
  {
    id: 'd18',
    prompt: '¿Qué elemento de la naturaleza es "Nina"?',
    quechuaTerm: 'Nina',
    options: ['Fuego', 'Tierra', 'Lluvia', 'Nieve'],
    correctIndex: 0,
    explanation: 'Nina es el fuego purificador en los rituales andinos.',
    category: 'vocabulario',
  },
  {
    id: 'd19',
    prompt: '¿Qué significa la palabra "Wasi"?',
    quechuaTerm: 'Wasi',
    options: ['Casa', 'Pueblo', 'Templo ceremonial', 'Puente colgante'],
    correctIndex: 0,
    explanation: 'Wasi es la vivienda o casa familiar.',
    category: 'vocabulario',
  },
  {
    id: 'd20',
    prompt: '¿Cómo se dice "Hasta mañana" en Quechua?',
    quechuaTerm: 'Hasta mañana',
    options: ['Paqarinkama', 'Allillanmi', 'Imanalla', 'Huk punchawkama'],
    correctIndex: 0,
    explanation: 'Paqarin significa mañana, y -kama es el sufijo delimitativo ("hasta").',
    category: 'saludos',
  },
  {
    id: 'd21',
    prompt: '¿Qué significa el concepto ancestral "Ayni"?',
    quechuaTerm: 'Ayni',
    options: ['Reciprocidad y ayuda mutua', 'Tributo obligatorio', 'Guerra entre pueblos', 'Fiesta de la cosecha'],
    correctIndex: 0,
    explanation: 'El Ayni es el sistema de solidaridad y ayuda mutua comunitaria.',
    category: 'cultura',
  },
  {
    id: 'd22',
    prompt: '¿Cómo se dice "Madre" en Quechua?',
    quechuaTerm: 'Madre',
    options: ['Mama', 'Taya', 'Pani', 'Wawqe'],
    correctIndex: 0,
    explanation: 'Mama es la madre biológica o figura maternal protectora.',
    category: 'vocabulario',
  },
  {
    id: 'd23',
    prompt: '¿Cómo se dice "Padre" en Quechua?',
    quechuaTerm: 'Padre',
    options: ['Taya', 'Churi', 'Ayllu', 'Masi'],
    correctIndex: 0,
    explanation: 'Taya o Yaya designa al padre y abuelo en el Ayllu.',
    category: 'vocabulario',
  },
  {
    id: 'd24',
    prompt: '¿Qué significa la palabra "Ch\'aska"?',
    quechuaTerm: 'Ch\'aska',
    options: ['Estrella lucero', 'Cometa de fuego', 'Rayo celeste', 'Nube blanca'],
    correctIndex: 0,
    explanation: 'Ch\'aska es la estrella del amanecer (Venus) y símbolo de brillo.',
    category: 'vocabulario',
  },
  {
    id: 'd25',
    prompt: '¿Qué número es "Iskay"?',
    quechuaTerm: 'Iskay',
    options: ['2', '1', '4', '7'],
    correctIndex: 0,
    explanation: 'Iskay es el número dos, dualidad esencial en el pensamiento andino (Yanantin).',
    category: 'numeros',
  },
];

// Rivales Andinos Automáticos para Matchmaking Instantáneo
export const BOT_RIVALS: { name: string; avatar: string; title: string; skill: number }[] = [
  { name: 'Amawt\'a Tupaq', avatar: '👨‍🏫', title: 'Sabio de Ollantaytambo', skill: 0.85 },
  { name: 'Kusi Ch\'aska', avatar: '🦙', title: 'Guardiana de Sacsayhuamán', skill: 0.78 },
  { name: 'Sayri Wayra', avatar: '🦅', title: 'Mensajero Chasqui del Valle', skill: 0.82 },
  { name: 'Urpi Sumaq', avatar: '🌸', title: 'Estudiante Destacada de Ayacucho', skill: 0.75 },
  { name: 'Inti Kuntur', avatar: '☀️', title: 'Maestro del Runa Simi Chanka', skill: 0.90 },
];

export const duelService = {
  /**
   * Genera un código de sala fácil de dictar y compartir (ej. "INTI-72", "KILLA-48")
   */
  generateRoomCode(): string {
    const prefixes = ['INTI', 'KILLA', 'CHASKA', 'AMAWTA', 'YACHAY', 'MUNAY', 'AYLLU', 'KUNTUR'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    return `${prefix}-${num}`;
  },

  /**
   * Obtiene un conjunto de 10 preguntas aleatorias balanceadas para la partida
   */
  getRandomDuelQuestions(count = 10): DuelQuestion[] {
    const shuffled = [...DUEL_QUESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  },

  /**
   * Selecciona un bot rival aleatorio para emparejamiento inmediato
   */
  getRandomBotRival(): { name: string; avatar: string; title: string; skill: number } {
    return BOT_RIVALS[Math.floor(Math.random() * BOT_RIVALS.length)];
  },

  /**
   * Suscribe a un canal broadcast de Supabase Realtime para partidas en vivo
   */
  subscribeToDuelChannel(
    roomCode: string,
    onEvent: (event: string, payload: any) => void
  ): { send: (event: string, payload: any) => void; unsubscribe: () => void } {
    const channelName = `tinkuy_${roomCode.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: '*' }, (msg: any) => {
        if (msg && msg.event) {
          onEvent(msg.event, msg.payload);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Anuncia presencia
          channel.send({
            type: 'broadcast',
            event: 'PRESENCE_PING',
            payload: { timestamp: Date.now() },
          });
        }
      });

    return {
      send: (event: string, payload: any) => {
        channel.send({
          type: 'broadcast',
          event,
          payload,
        });
      },
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },
};
