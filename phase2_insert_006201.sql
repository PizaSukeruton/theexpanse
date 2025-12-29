INSERT INTO tse_storytelling_lessons (
  lesson_id,
  module_id,
  track_name,
  lesson_name,
  level,
  difficulty,
  knowledge_domain,
  prerequisites,
  character_id,
  unlocks_next_lesson,
  learning_objectives,
  teacher_definition,
  teacher_micro_examples,
  teacher_worked_example
) VALUES (
  '#AF00B8',
  '#006200',
  'storytelling_tanuki_v1',
  'Protagonist, Antagonist, Allies',
  2,
  2,
  'character_basics',
  ARRAY['#005201', '#005202']::text[],
  '#700002',
  NULL,
  ARRAY[
    'Identify the protagonist (main character) in a short story.',
    'Identify the antagonist (force or character that opposes the protagonist).',
    'Recognise allies or helpers and describe their role.'
  ]::text[],
  'A protagonist is the main character the story follows. The antagonist is whatever gets in their way – this might be another character, a situation, or even their own fear. Allies are characters who help the protagonist move toward their goal.',
  ARRAY[
    'In a treasure-hunt story, the kid searching for the treasure is the protagonist, the rival team or the dangerous cave can be the antagonist, and a loyal friend who shares clues is an ally.',
    'In a school story, the new student who wants a friend is the protagonist, their shyness or a bullying classmate can be the antagonist, and a kind teacher or classmate can be an ally.',
    'In a sports story, the runner trying to win the race is the protagonist, a strong rival or an injury can be the antagonist, and a coach who trains them is an ally.'
  ]::text[],
  'Read this short story:

Jade wanted to perform in the school talent show, but her stage fright made her shake every time she imagined stepping on stage. Her best friend Mia stayed after school with her, clapped after each practice song, and promised to stand in the front row on the night of the show.

Protagonist: Jade. The story follows her wish to be in the talent show.
Antagonist: Her stage fright, which tries to stop her from reaching her goal.
Ally: Mia, because she supports Jade, practises with her, and helps her feel braver.

Even though this is short, we can see who the story is about (protagonist), what is in the way (antagonist), and who is helping (ally).'
);
