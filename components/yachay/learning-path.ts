export type PathNodeType = 'lesson' | 'exam';

export interface LearningPathNode {
  key: string;
  id: number;
  type: PathNodeType;
  title: string;
  subtitle: string;
  objective: string;
  categorySlug: string;
  levelNumber: 1 | 2 | 3;
  lessonId?: number;
  levelId?: number;
  completed: boolean;
  active: boolean;
  locked: boolean;
  reason: string;
}

export interface LearningPathState {
  nodes: LearningPathNode[];
  continueNode: LearningPathNode;
  completedCount: number;
  totalLessons: number;
  passedExamsCount: number;
  totalExams: number;
  allComplete: boolean;
}

export function deriveLearningPath({
  completedLessonIds = [],
  passedLevelIds = new Set<number>(),
}: {
  completedLessonIds?: number[] | Set<number>;
  passedLevelIds?: Set<number>;
}): LearningPathState {
  const completedSet =
    completedLessonIds instanceof Set
      ? completedLessonIds
      : new Set<number>(Array.isArray(completedLessonIds) ? completedLessonIds : []);
  const passedSet =
    passedLevelIds instanceof Set
      ? passedLevelIds
      : new Set<number>();

  const isL1Done = completedSet.has(1);
  const isL2Done = completedSet.has(2);
  const isExam1Done = passedSet.has(1);

  const isL3Done = completedSet.has(3);
  const isL4Done = completedSet.has(4);
  const isExam2Done = passedSet.has(2);

  const isL5Done = completedSet.has(5);
  const isL6Done = completedSet.has(6);
  const isExam3Done = passedSet.has(3);

  const rawNodes: Omit<LearningPathNode, 'active'>[] = [
    // ── NIVEL 1 ──────────────────────────────────────────────
    {
      key: 'lesson-1',
      id: 1,
      type: 'lesson',
      lessonId: 1,
      title: 'Vocales del Runasimi',
      subtitle: 'Nivel 1 · Lección 1',
      objective: 'Aprende las 3 vocales básicas (A, I, U) y su pronunciación.',
      categorySlug: 'abecedario',
      levelNumber: 1,
      completed: isL1Done,
      locked: false,
      reason: 'Disponible para comenzar.',
    },
    {
      key: 'lesson-2',
      id: 2,
      type: 'lesson',
      lessonId: 2,
      title: 'Consonantes y Fonética',
      subtitle: 'Nivel 1 · Lección 2',
      objective: 'Reconoce y pronuncia sonidos clave como Q, K y LL.',
      categorySlug: 'abecedario',
      levelNumber: 1,
      completed: isL2Done,
      locked: !isL1Done,
      reason: isL1Done ? 'Disponible.' : 'Completa la lección de Vocales primero.',
    },
    {
      key: 'exam-1',
      id: 101,
      type: 'exam',
      levelId: 1,
      title: 'Examen de Abecedario',
      subtitle: 'Evaluación Sumativa · Nivel 1',
      objective: 'Demuestra tu dominio de vocales y consonantes para avanzar.',
      categorySlug: 'abecedario',
      levelNumber: 1,
      completed: isExam1Done,
      locked: !(isL1Done && isL2Done),
      reason: isL1Done && isL2Done
        ? 'Listo para certificar el Nivel 1.'
        : 'Completa las 2 lecciones de fonética para desbloquear.',
    },

    // ── NIVEL 2 ──────────────────────────────────────────────
    {
      key: 'lesson-3',
      id: 3,
      type: 'lesson',
      lessonId: 3,
      title: 'Números del 1 al 5',
      subtitle: 'Nivel 2 · Lección 1',
      objective: 'Aprende a contar de Huk (1) a Pichqa (5).',
      categorySlug: 'numeros',
      levelNumber: 2,
      completed: isL3Done,
      locked: !isExam1Done,
      reason: isExam1Done ? 'Disponible.' : 'Aprueba el Examen de Nivel 1 primero.',
    },
    {
      key: 'lesson-4',
      id: 4,
      type: 'lesson',
      lessonId: 4,
      title: 'Números del 6 al 10',
      subtitle: 'Nivel 2 · Lección 2',
      objective: 'Aprende a contar de Soqta (6) a Chunka (10).',
      categorySlug: 'numeros',
      levelNumber: 2,
      completed: isL4Done,
      locked: !(isExam1Done && isL3Done),
      reason: isExam1Done && isL3Done
        ? 'Disponible.'
        : 'Completa la lección de Números del 1 al 5 primero.',
    },
    {
      key: 'exam-2',
      id: 102,
      type: 'exam',
      levelId: 2,
      title: 'Examen de Números',
      subtitle: 'Evaluación Sumativa · Nivel 2',
      objective: 'Demuestra que sabes contar y ordenar los números del 1 al 10.',
      categorySlug: 'numeros',
      levelNumber: 2,
      completed: isExam2Done,
      locked: !(isExam1Done && isL3Done && isL4Done),
      reason: isExam1Done && isL3Done && isL4Done
        ? 'Listo para certificar el Nivel 2.'
        : 'Completa las 2 lecciones de números para desbloquear.',
    },

    // ── NIVEL 3 ──────────────────────────────────────────────
    {
      key: 'lesson-5',
      id: 5,
      type: 'lesson',
      lessonId: 5,
      title: 'Saludos y Expresiones',
      subtitle: 'Nivel 3 · Lección 1',
      objective: 'Aprende cortesía andina: Allillanchu, Añay y Tupananchiskama.',
      categorySlug: 'palabras',
      levelNumber: 3,
      completed: isL5Done,
      locked: !isExam2Done,
      reason: isExam2Done ? 'Disponible.' : 'Aprueba el Examen de Nivel 2 primero.',
    },
    {
      key: 'lesson-6',
      id: 6,
      type: 'lesson',
      lessonId: 6,
      title: 'Familia Andina',
      subtitle: 'Nivel 3 · Lección 2',
      objective: 'Aprende los lazos familiares: Tayta, Mama, Wawa y Awicha.',
      categorySlug: 'palabras',
      levelNumber: 3,
      completed: isL6Done,
      locked: !(isExam2Done && isL5Done),
      reason: isExam2Done && isL5Done
        ? 'Disponible.'
        : 'Completa la lección de Saludos primero.',
    },
    {
      key: 'exam-3',
      id: 103,
      type: 'exam',
      levelId: 3,
      title: 'Examen de Vocabulario y Familia',
      subtitle: 'Evaluación Sumativa · Nivel 3',
      objective: 'Certifica tu capacidad para saludar y reconocer a la familia.',
      categorySlug: 'palabras',
      levelNumber: 3,
      completed: isExam3Done,
      locked: !(isExam2Done && isL5Done && isL6Done),
      reason: isExam2Done && isL5Done && isL6Done
        ? 'Listo para certificar el Nivel 3.'
        : 'Completa las 2 lecciones de vocabulario para desbloquear.',
    },
  ];

  // Encontrar el primer nodo desbloqueado que no esté completado
  let activeFound = false;
  const nodes: LearningPathNode[] = rawNodes.map((node) => {
    const isActive = !activeFound && !node.locked && !node.completed;
    if (isActive) {
      activeFound = true;
    }
    return { ...node, active: isActive };
  });

  const continueNode =
    nodes.find((node) => node.active) ||
    nodes.find((node) => !node.locked && !node.completed) ||
    nodes[0];

  const totalLessons = 6;
  const completedLessons = [1, 2, 3, 4, 5, 6].filter((id) => completedSet.has(id)).length;
  const totalExams = 3;
  const passedExams = [1, 2, 3].filter((id) => passedSet.has(id)).length;
  const allComplete = completedLessons === totalLessons && passedExams === totalExams;

  return {
    nodes,
    continueNode,
    completedCount: completedLessons,
    totalLessons,
    passedExamsCount: passedExams,
    totalExams,
    allComplete,
  };
}
