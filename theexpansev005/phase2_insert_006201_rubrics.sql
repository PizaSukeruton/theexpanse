INSERT INTO tse_storytelling_rubrics (
  rubric_id,
  task_type_id,
  features,
  total_possible_score,
  grade_mapping
) VALUES
(
  '#D10005',
  '#AF00B9',
  '[
    {
      "feature_id": "protagonist_identified",
      "description": "Is the protagonist (main character) correctly identified?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Chosen character is not the main focus of the story or is clearly wrong.",
        "1": "Partly correct (for example, mentions group but not the specific main character).",
        "2": "Correctly identifies the main character the story follows."
      }
    },
    {
      "feature_id": "antagonist_identified",
      "description": "Is the main source of opposition correctly identified as the antagonist?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Answer is unrelated or not actually blocking the goal.",
        "1": "Partly right but missing detail (for example, says ''problems'' instead of naming the key problem).",
        "2": "Clearly and specifically identifies the person, force, or situation that blocks the protagonist."
      }
    },
    {
      "feature_id": "ally_identified",
      "description": "Is an ally correctly identified, or ''none'' used appropriately when there is no ally?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Names an ally when none exists, or chooses something that does not help the protagonist.",
        "1": "Chooses a character that helps, but the description is vague or mixed up.",
        "2": "Clearly names a helper who supports the protagonist’s goal, or correctly writes ''none'' when there is no helper."
      }
    }
  ]'::jsonb,
  6,
  '[
    { "min_score": 0, "max_score": 1, "fsrs_grade": 1 },
    { "min_score": 2, "max_score": 3, "fsrs_grade": 2 },
    { "min_score": 4, "max_score": 5, "fsrs_grade": 3 },
    { "min_score": 6, "max_score": 6, "fsrs_grade": 4 }
  ]'::jsonb
),
(
  '#D10006',
  '#AF00BA',
  '[
    {
      "feature_id": "correct_choice",
      "description": "Does the student choose the option that truly represents the antagonist?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Chosen letter does not represent the real source of opposition.",
        "1": "Correct letter plus extra letters or uncertainty (for example, ''A and B'').",
        "2": "Exactly the correct letter is chosen."
      }
    },
    {
      "feature_id": "reasoning_opposition_focus",
      "description": "Does the reason explain how that choice opposes the protagonist’s goal?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Reason does not mention blocking the goal or causing a problem.",
        "1": "Reason is vague but hints at a problem.",
        "2": "Reason clearly shows the chosen option gets in the protagonist’s way."
      }
    }
  ]'::jsonb,
  4,
  '[
    { "min_score": 0, "max_score": 1, "fsrs_grade": 1 },
    { "min_score": 2, "max_score": 2, "fsrs_grade": 2 },
    { "min_score": 3, "max_score": 3, "fsrs_grade": 3 },
    { "min_score": 4, "max_score": 4, "fsrs_grade": 4 }
  ]'::jsonb
),
(
  '#D10007',
  '#AF00BB',
  '[
    {
      "feature_id": "three_roles_present",
      "description": "Does the student clearly name a protagonist, antagonist, and ally?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Only one role given or labels missing.",
        "1": "Two roles are clear, the third is vague or missing.",
        "2": "All three roles are present and labelled."
      }
    },
    {
      "feature_id": "roles_consistent_with_story",
      "description": "Do the named roles match how they act in the story text?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Roles are mixed up (for example, ally acts like an antagonist).",
        "1": "Some confusion, but main pattern is mostly right.",
        "2": "Protagonist has clear goal, antagonist opposes, ally helps, all consistent."
      }
    },
    {
      "feature_id": "story_coherence",
      "description": "Is the short story clear and connected to the roles?",
      "score_range": [0, 2],
      "scoring_rules": {
        "0": "Story is very hard to follow or not related to the roles.",
        "1": "Story mostly makes sense but has gaps or unclear links.",
        "2": "Story is easy to follow; the conflict and help are clear."
      }
    }
  ]'::jsonb,
  6,
  '[
    { "min_score": 0, "max_score": 1, "fsrs_grade": 1 },
    { "min_score": 2, "max_score": 3, "fsrs_grade": 2 },
    { "min_score": 4, "max_score": 5, "fsrs_grade": 3 },
    { "min_score": 6, "max_score": 6, "fsrs_grade": 4 }
  ]'::jsonb
);
