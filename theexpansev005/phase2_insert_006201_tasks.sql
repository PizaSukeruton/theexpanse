INSERT INTO tse_storytelling_task_types (
  task_type_id,
  lesson_id,
  task_name,
  difficulty,
  prompt_template,
  expected_output_format,
  input_pool
) VALUES
(
  '#AF00B9',
  '#AF00B8',
  'Identify Protagonist, Antagonist, Ally',
  2,
  'Read the story:

{text_story}

Answer in this format:
Protagonist: [...]
Antagonist: [...]
Ally: [...] (write ''none'' if there is no clear ally).',
  'Protagonist: [name or short description]
Antagonist: [name / force / situation]
Ally: [name / description / ''none'']',
  '[
    {
      "text_story": "Arin wanted to finish his project on the school computer, but an older kid kept cutting in front of him every time he joined the line. At last, the librarian noticed what was happening and made the older kid wait their turn so Arin could use the computer."
    },
    {
      "text_story": "Mila wanted to reach the top of the hill, but the path was steep and she slipped more than once. Her older brother walked beside her, held her hand when she wobbled, and told her they could rest whenever she needed."
    },
    {
      "text_story": "Ken hoped to fix his broken bike before the weekend trip. The broken chain made it impossible to ride, and the store was nearly out of parts, but a neighbour who knew about bikes offered to help him repair it."
    }
  ]'::jsonb
),
(
  '#AF00BA',
  '#AF00B8',
  'Which One Is the Antagonist?',
  2,
  'Read the short story:

{text_story}

Who or what is the antagonist in this story – the main thing that stands in the way of the protagonist’s goal?

A) {optionA}
B) {optionB}
C) {optionC}

Answer with one letter and a short reason.',
  'Answer: [A/B/C]
Reason: [one sentence explaining why this is the main source of opposition]',
  '[
    {
      "text_story": "Riya wanted to sit at the busy lunch table where the kids were laughing, but every time she stood up, her stomach twisted and she sat back down. She watched them from far away and picked at her food.",
      "optionA": "Riya''s shyness and fear of going over",
      "optionB": "The kids at the table",
      "optionC": "The food on Riya''s tray"
    },
    {
      "text_story": "Jamal trained hard for the school race, but heavy rain on the day of the event turned the track into slippery mud. He wondered if he should even try to run.",
      "optionA": "Jamal''s love of running",
      "optionB": "The muddy track and bad weather",
      "optionC": "The cheering crowd"
    },
    {
      "text_story": "Lena wanted to finish her painting for the art wall, but her little brother kept running into her room and bumping her desk. She had to keep starting over.",
      "optionA": "Lena''s paintbrushes",
      "optionB": "Lena''s little brother who keeps bumping the desk",
      "optionC": "The art wall at school"
    }
  ]'::jsonb
),
(
  '#AF00BB',
  '#AF00B8',
  'Create Protagonist, Antagonist, Ally',
  3,
  'Create a very short story setup (2–4 sentences) that clearly includes:

- A protagonist (main character)
- An antagonist (who or what is in their way)
- An ally (someone or something that helps)

Follow this format:

Protagonist: [...]
Antagonist: [...]
Ally: [...]
Story: [2–4 sentences describing the situation]',
  'Protagonist: [short description or name]
Antagonist: [short description or name or situation]
Ally: [short description or name]
Story: [2–4 sentences]',
  '[
    { "topic": "trying to rescue a lost pet" },
    { "topic": "preparing for a school performance" },
    { "topic": "fixing a big mistake with a friend" }
  ]'::jsonb
);
