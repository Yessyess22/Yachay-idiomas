import { deriveLearningPath } from '@/components/yachay/learning-path';

describe('deriveLearningPath', () => {
  it('desbloquea solo la primera lección para un nuevo usuario', () => {
    const path = deriveLearningPath({
      completedLessonIds: [],
      passedLevelIds: new Set(),
    });

    expect(path.nodes[0].completed).toBe(false);
    expect(path.nodes[0].locked).toBe(false);
    expect(path.nodes[0].active).toBe(true);
    expect(path.continueNode.id).toBe(1);

    // La lección 2 debe estar bloqueada
    expect(path.nodes[1].locked).toBe(true);
    // El examen 1 debe estar bloqueado
    expect(path.nodes[2].locked).toBe(true);
  });

  it('desbloquea el examen de nivel 1 cuando se completan las lecciones 1 y 2', () => {
    const path = deriveLearningPath({
      completedLessonIds: [1, 2],
      passedLevelIds: new Set(),
    });

    expect(path.nodes[0].completed).toBe(true);
    expect(path.nodes[1].completed).toBe(true);
    expect(path.nodes[2].locked).toBe(false);
    expect(path.nodes[2].active).toBe(true);
    expect(path.continueNode.type).toBe('exam');
  });

  it('desbloquea el nivel 2 solo cuando se aprueba el examen de nivel 1', () => {
    const path = deriveLearningPath({
      completedLessonIds: [1, 2],
      passedLevelIds: new Set([1]),
    });

    // Nodo 3 (lección 3 - números 1 al 5) debe estar disponible
    const lesson3 = path.nodes.find((n) => n.id === 3);
    expect(lesson3?.locked).toBe(false);
    expect(lesson3?.active).toBe(true);
    expect(path.continueNode.id).toBe(3);
  });

  it('calcula métricas de avance y exámenes aprobados correctamente', () => {
    const path = deriveLearningPath({
      completedLessonIds: [1, 2, 3],
      passedLevelIds: new Set([1]),
    });

    expect(path.completedCount).toBe(3);
    expect(path.totalLessons).toBe(6);
    expect(path.passedExamsCount).toBe(1);
    expect(path.totalExams).toBe(3);
    expect(path.allComplete).toBe(false);
  });
});
