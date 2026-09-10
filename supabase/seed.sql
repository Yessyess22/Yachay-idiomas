-- ============================================================
-- YACHAY IDIOMAS — Seed de datos de quechua
-- Sprint 1 — Tarea S1-T06
-- Contenido: 3 categorías, 2 lecciones por categoría,
--            5+ preguntas por lección con opciones reales
-- ============================================================

-- ============================================================
-- CATEGORÍAS
-- ============================================================
INSERT INTO categories (name, slug, icon_url, sort_order) VALUES
  ('Abecedario', 'abecedario', NULL, 1),
  ('Números',    'numeros',    NULL, 2),
  ('Palabras',   'palabras',   NULL, 3);

-- ============================================================
-- LECCIONES — Abecedario (category_id = 1)
-- ============================================================
INSERT INTO lessons (category_id, title, description, sort_order) VALUES
  (1, 'Vocales del Quechua',   'Aprende las 5 vocales del alfabeto quechua y su pronunciación', 1),
  (1, 'Consonantes Básicas',   'Consonantes más comunes: p, t, k, m, n, s, w, y',              2);

-- ============================================================
-- LECCIONES — Números (category_id = 2)
-- ============================================================
INSERT INTO lessons (category_id, title, description, sort_order) VALUES
  (2, 'Números del 1 al 5',  'Aprende a contar del uno al cinco en quechua', 1),
  (2, 'Números del 6 al 10', 'Continúa contando del seis al diez en quechua', 2);

-- ============================================================
-- LECCIONES — Palabras (category_id = 3)
-- ============================================================
INSERT INTO lessons (category_id, title, description, sort_order) VALUES
  (3, 'Saludos y Despedidas', 'Las frases de saludo más usadas en quechua',   1),
  (3, 'Familia',              'Aprende los nombres de los miembros de tu familia en quechua', 2);

-- ============================================================
-- PREGUNTAS — Lección 1: Vocales del Quechua (lesson_id = 1)
-- ============================================================
INSERT INTO questions (lesson_id, prompt, question_type) VALUES
  (1, '¿Cuál es la vocal "a" en el alfabeto quechua?',              'multiple_choice'),
  (1, '¿Cómo se escribe la vocal "i" en quechua?',                  'multiple_choice'),
  (1, '¿Cuántas vocales tiene el quechua estándar?',                 'multiple_choice'),
  (1, '¿Cuál de estas NO es una vocal del quechua estándar?',        'multiple_choice'),
  (1, '¿Qué vocal quechua suena igual que la "u" del español?',      'multiple_choice');

-- Opciones — Pregunta 1 (¿Cuál es la vocal "a"?)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (1, 'a', TRUE),
  (1, 'e', FALSE),
  (1, 'o', FALSE),
  (1, 'u', FALSE);

-- Opciones — Pregunta 2 (vocal "i")
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (2, 'i', TRUE),
  (2, 'e', FALSE),
  (2, 'a', FALSE),
  (2, 'o', FALSE);

-- Opciones — Pregunta 3 (¿Cuántas vocales?)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (3, '3 (a, i, u)', TRUE),
  (3, '5 (a, e, i, o, u)', FALSE),
  (3, '4 (a, i, u, e)', FALSE),
  (3, '6', FALSE);

-- Opciones — Pregunta 4 (¿Cuál NO es vocal quechua?)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (4, 'e', TRUE),
  (4, 'a', FALSE),
  (4, 'i', FALSE),
  (4, 'u', FALSE);

-- Opciones — Pregunta 5 (vocal "u")
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (5, 'u', TRUE),
  (5, 'a', FALSE),
  (5, 'i', FALSE),
  (5, 'o', FALSE);

-- ============================================================
-- PREGUNTAS — Lección 2: Consonantes Básicas (lesson_id = 2)
-- ============================================================
INSERT INTO questions (lesson_id, prompt, question_type) VALUES
  (2, '¿Cómo suena la consonante "q" en quechua?',                  'multiple_choice'),
  (2, '¿Cuál es la consonante que representa el sonido "sh"?',       'multiple_choice'),
  (2, '¿Qué consonante quechua NO existe en español?',               'multiple_choice'),
  (2, '"ll" en quechua suena como:',                                 'multiple_choice'),
  (2, '¿Cuál de estas letras SÍ existe en el quechua estándar?',     'multiple_choice');

-- Opciones — Pregunta 6
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (6, 'Como la "k" pero desde la garganta', TRUE),
  (6, 'Igual que la "k" del español', FALSE),
  (6, 'Como la "q" del inglés', FALSE),
  (6, 'No se pronuncia', FALSE);

-- Opciones — Pregunta 7
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (7, 'ch''', FALSE),
  (7, 'sh', TRUE),
  (7, 'x', FALSE),
  (7, 'z', FALSE);

-- Opciones — Pregunta 8
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (8, 'q (uvular)', TRUE),
  (8, 'p', FALSE),
  (8, 'm', FALSE),
  (8, 'n', FALSE);

-- Opciones — Pregunta 9
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (9, 'Como "y" consonante', TRUE),
  (9, 'Como "ll" del español rioplatense', FALSE),
  (9, 'No existe en quechua', FALSE),
  (9, 'Como "l" doble', FALSE);

-- Opciones — Pregunta 10
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (10, 'w', TRUE),
  (10, 'f', FALSE),
  (10, 'v', FALSE),
  (10, 'b', FALSE);

-- ============================================================
-- PREGUNTAS — Lección 3: Números del 1 al 5 (lesson_id = 3)
-- ============================================================
INSERT INTO questions (lesson_id, prompt, question_type) VALUES
  (3, '¿Cómo se dice "uno" en quechua?',   'multiple_choice'),
  (3, '¿Cuánto es "iskay" en español?',    'multiple_choice'),
  (3, '¿Cómo se dice "tres" en quechua?',  'multiple_choice'),
  (3, '"Tawa" significa:',                  'multiple_choice'),
  (3, '¿Cómo se dice "cinco" en quechua?', 'multiple_choice');

-- Opciones — Pregunta 11 (uno)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (11, 'huk',   TRUE),
  (11, 'iskay', FALSE),
  (11, 'kimsa', FALSE),
  (11, 'tawa',  FALSE);

-- Opciones — Pregunta 12 (iskay)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (12, 'Dos',    TRUE),
  (12, 'Uno',    FALSE),
  (12, 'Tres',   FALSE),
  (12, 'Cuatro', FALSE);

-- Opciones — Pregunta 13 (tres)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (13, 'kimsa',  TRUE),
  (13, 'huk',    FALSE),
  (13, 'iskay',  FALSE),
  (13, 'pichqa', FALSE);

-- Opciones — Pregunta 14 (tawa)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (14, 'Cuatro', TRUE),
  (14, 'Tres',   FALSE),
  (14, 'Cinco',  FALSE),
  (14, 'Dos',    FALSE);

-- Opciones — Pregunta 15 (cinco)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (15, 'pichqa', TRUE),
  (15, 'tawa',   FALSE),
  (15, 'kimsa',  FALSE),
  (15, 'suqta',  FALSE);

-- ============================================================
-- PREGUNTAS — Lección 4: Números del 6 al 10 (lesson_id = 4)
-- ============================================================
INSERT INTO questions (lesson_id, prompt, question_type) VALUES
  (4, '¿Cómo se dice "seis" en quechua?',  'multiple_choice'),
  (4, '"Qanchis" significa:',               'multiple_choice'),
  (4, '¿Cómo se dice "ocho" en quechua?',  'multiple_choice'),
  (4, '"Isqon" es el número:',              'multiple_choice'),
  (4, '¿Cómo se dice "diez" en quechua?',  'multiple_choice');

-- Opciones — Pregunta 16 (seis)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (16, 'suqta',   TRUE),
  (16, 'qanchis', FALSE),
  (16, 'pusaq',   FALSE),
  (16, 'isqon',   FALSE);

-- Opciones — Pregunta 17 (qanchis)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (17, 'Siete',  TRUE),
  (17, 'Seis',   FALSE),
  (17, 'Ocho',   FALSE),
  (17, 'Nueve',  FALSE);

-- Opciones — Pregunta 18 (ocho)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (18, 'pusaq',   TRUE),
  (18, 'suqta',   FALSE),
  (18, 'qanchis', FALSE),
  (18, 'chunka',  FALSE);

-- Opciones — Pregunta 19 (isqon)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (19, 'Nueve',  TRUE),
  (19, 'Ocho',   FALSE),
  (19, 'Diez',   FALSE),
  (19, 'Siete',  FALSE);

-- Opciones — Pregunta 20 (diez)
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (20, 'chunka',  TRUE),
  (20, 'isqon',   FALSE),
  (20, 'pusaq',   FALSE),
  (20, 'suqta',   FALSE);

-- ============================================================
-- PREGUNTAS — Lección 5: Saludos y Despedidas (lesson_id = 5)
-- ============================================================
INSERT INTO questions (lesson_id, prompt, question_type) VALUES
  (5, '¿Cómo se dice "buenos días" en quechua?',    'multiple_choice'),
  (5, '"Allianchu" significa:',                      'multiple_choice'),
  (5, '¿Cómo se dice "gracias" en quechua?',        'multiple_choice'),
  (5, '"Tupananchiskama" es una forma de decir:',    'multiple_choice'),
  (5, '¿Cómo se responde a "¿Allianchu?"?',         'multiple_choice');

-- Opciones — Pregunta 21
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (21, 'Allin p''unchaw',   TRUE),
  (21, 'Tupananchiskama',   FALSE),
  (21, 'Yupaychani',        FALSE),
  (21, 'Mana',              FALSE);

-- Opciones — Pregunta 22
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (22, '¿Cómo estás?',   TRUE),
  (22, 'Gracias',         FALSE),
  (22, 'Hasta luego',     FALSE),
  (22, 'Buenos días',     FALSE);

-- Opciones — Pregunta 23
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (23, 'Yupaychani',       TRUE),
  (23, 'Allianchu',        FALSE),
  (23, 'Mana',             FALSE),
  (23, 'Arí',              FALSE);

-- Opciones — Pregunta 24
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (24, 'Hasta que nos veamos', TRUE),
  (24, 'Buenos días',           FALSE),
  (24, 'Gracias',               FALSE),
  (24, 'Sí',                    FALSE);

-- Opciones — Pregunta 25
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (25, 'Allillanmi', TRUE),
  (25, 'Yupaychani', FALSE),
  (25, 'Mana',       FALSE),
  (25, 'Arí',        FALSE);

-- ============================================================
-- PREGUNTAS — Lección 6: Familia (lesson_id = 6)
-- ============================================================
INSERT INTO questions (lesson_id, prompt, question_type) VALUES
  (6, '¿Cómo se dice "mamá" en quechua?',           'multiple_choice'),
  (6, '"Tayta" significa:',                           'multiple_choice'),
  (6, '¿Cómo se dice "hermano" (de hombre) en quechua?', 'multiple_choice'),
  (6, '"Pana" significa (dicho por un hombre):',     'multiple_choice'),
  (6, '¿Cómo se dice "abuela" en quechua?',          'multiple_choice');

-- Opciones — Pregunta 26
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (26, 'Mama',    TRUE),
  (26, 'Tayta',   FALSE),
  (26, 'Wawa',    FALSE),
  (26, 'Pana',    FALSE);

-- Opciones — Pregunta 27
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (27, 'Padre / Papá',  TRUE),
  (27, 'Madre / Mamá',  FALSE),
  (27, 'Hermano',        FALSE),
  (27, 'Abuelo',         FALSE);

-- Opciones — Pregunta 28
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (28, 'Tura',    TRUE),
  (28, 'Pana',    FALSE),
  (28, 'Mama',    FALSE),
  (28, 'Wawa',    FALSE);

-- Opciones — Pregunta 29
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (29, 'Hermana',  TRUE),
  (29, 'Hermano',  FALSE),
  (29, 'Madre',    FALSE),
  (29, 'Abuela',   FALSE);

-- Opciones — Pregunta 30
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
  (30, 'Awicha',  TRUE),
  (30, 'Awki',    FALSE),
  (30, 'Mama',    FALSE),
  (30, 'Tayta',   FALSE);

-- ============================================================
-- NIVELES Y EXÁMENES
-- (Un nivel por categoría, con examen de cierre)
-- ============================================================
INSERT INTO levels (category_id, title, level_number) VALUES
  (1, 'Nivel 1 — Abecedario Básico', 1),
  (2, 'Nivel 1 — Números Básicos',   1),
  (3, 'Nivel 1 — Palabras Básicas',  1);

INSERT INTO exams (level_id, title, pass_threshold) VALUES
  (1, 'Examen de Abecedario', 70),
  (2, 'Examen de Números',    70),
  (3, 'Examen de Palabras',   70);

-- Examen Abecedario usa preguntas de lecciones 1 y 2 (ids 1–10)
INSERT INTO exam_questions (exam_id, question_id) VALUES
  (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
  (1, 6), (1, 7), (1, 8), (1, 9), (1, 10);

-- Examen Números usa preguntas de lecciones 3 y 4 (ids 11–20)
INSERT INTO exam_questions (exam_id, question_id) VALUES
  (2, 11), (2, 12), (2, 13), (2, 14), (2, 15),
  (2, 16), (2, 17), (2, 18), (2, 19), (2, 20);

-- Examen Palabras usa preguntas de lecciones 5 y 6 (ids 21–30)
INSERT INTO exam_questions (exam_id, question_id) VALUES
  (3, 21), (3, 22), (3, 23), (3, 24), (3, 25),
  (3, 26), (3, 27), (3, 28), (3, 29), (3, 30);
