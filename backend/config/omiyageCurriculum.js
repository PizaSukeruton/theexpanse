export const omiyageLevel1Spec = {
  module_code: "omiyage_level_1",
  cycle_type: "knowledge_learning",
  learning_objectives: [
    "understand_omiyage_reduces_invisible_pressure",
    "see_omiyage_as_group_harmony_tool",
    "recognize_omiyage_as_modest_consumable",
    "connect_omiyage_to_place_meibutsu",
    "see_omiyage_as_preemptive_care"
  ],
  questions: [
    {
      id: 1,
      text: "Omiyage is mainly about keeping relationships smooth after you have been away, not about paying a debt back.",
      correct_answer: "true"
    },
    {
      id: 2,
      text: "Omiyage is often given to a whole group with the same small gift, so nobody feels left out.",
      correct_answer: "true"
    },
    {
      id: 3,
      text: "Good Omiyage is usually modest and often something you can use or eat, not a big permanent reward.",
      correct_answer: "true"
    },
    {
      id: 4,
      text: "Real Omiyage usually carries a piece of place, like a specialty from where someone visited.",
      correct_answer: "true"
    },
    {
      id: 5,
      text: "Omiyage is given before anyone complains, to prevent tension, not only after a problem appears.",
      correct_answer: "true"
    }
  ],
  evaluation_rule: {
    required_correct: 3,
    total_questions: 5
  },
  stripe_award_rule: {
    can_award_stripe: true,
    stripes_awarded_on_pass: 1
  }
};
