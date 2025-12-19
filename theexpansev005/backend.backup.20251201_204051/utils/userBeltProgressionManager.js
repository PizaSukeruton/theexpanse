import pool from '../db/pool.js';
import generateHexId from './hexIdGenerator.js';

const USER_BELT_REQUIREMENTS = {
  white_belt: {
    stripe_0: { quizzes: 0, accuracy: 0.00, council_readiness: 0.00 },
    stripe_1: { quizzes: 3, accuracy: 0.60, council_readiness: 0.20 },
    stripe_2: { quizzes: 6, accuracy: 0.65, council_readiness: 0.35 },
    stripe_3: { quizzes: 9, accuracy: 0.70, council_readiness: 0.50 },
    stripe_4: { quizzes: 12, accuracy: 0.75, council_readiness: 0.65 }
  },
  blue_belt: {
    stripe_0: { quizzes: 15, accuracy: 0.75, council_readiness: 0.65 },
    stripe_1: { quizzes: 18, accuracy: 0.78, council_readiness: 0.72 },
    stripe_2: { quizzes: 21, accuracy: 0.80, council_readiness: 0.78 },
    stripe_3: { quizzes: 24, accuracy: 0.82, council_readiness: 0.83 },
    stripe_4: { quizzes: 27, accuracy: 0.84, council_readiness: 0.88 }
  },
  purple_belt: {
    stripe_0: { quizzes: 30, accuracy: 0.85, council_readiness: 0.88 },
    stripe_1: { quizzes: 33, accuracy: 0.86, council_readiness: 0.90 },
    stripe_2: { quizzes: 36, accuracy: 0.87, council_readiness: 0.92 },
    stripe_3: { quizzes: 39, accuracy: 0.88, council_readiness: 0.94 },
    stripe_4: { quizzes: 42, accuracy: 0.89, council_readiness: 0.95 }
  },
  brown_belt: {
    stripe_0: { quizzes: 45, accuracy: 0.90, council_readiness: 0.95 },
    stripe_1: { quizzes: 48, accuracy: 0.91, council_readiness: 0.96 },
    stripe_2: { quizzes: 51, accuracy: 0.92, council_readiness: 0.97 },
    stripe_3: { quizzes: 54, accuracy: 0.93, council_readiness: 0.98 },
    stripe_4: { quizzes: 57, accuracy: 0.94, council_readiness: 0.99 }
  },
  black_belt: {
    stripe_0: { quizzes: 60, accuracy: 0.95, council_readiness: 0.99 },
    stripe_1: { quizzes: 63, accuracy: 0.96, council_readiness: 0.99 },
    stripe_2: { quizzes: 66, accuracy: 0.97, council_readiness: 1.00 },
    stripe_3: { quizzes: 69, accuracy: 0.98, council_readiness: 1.00 },
    stripe_4: { quizzes: 72, accuracy: 0.99, council_readiness: 1.00 }
  }
};

class UserBeltProgressionManager {
  async initializeUserBelt(userId, topicName) {
    const beltId = await generateHexId('conversation_id');
    
    const query = `
      INSERT INTO user_belt_progression (
        belt_id, user_id, topic_name, current_belt, current_stripes,
        total_quizzes, successful_quizzes, current_accuracy,
        advancement_progress, belt_history, council_readiness_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id, topic_name) DO NOTHING
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [
        beltId,
        userId,
        topicName,
        'white_belt',
        0,
        0,
        0,
        0.0,
        {},
        [],
        0.0
      ]);

      if (result.rows.length > 0) {
        console.log(`✓ User belt initialized for ${userId} - topic: ${topicName}`);
        return result.rows[0];
      }
    } catch (error) {
      console.error(`✗ Error initializing user belt:`, error.message);
      throw error;
    }
  }

  async recordQuizAttempt(userId, topicName, quizScore, quizData = {}) {
    const query = `
      SELECT * FROM user_belt_progression 
      WHERE user_id = $1 AND topic_name = $2
    `;

    try {
      let result = await pool.query(query, [userId, topicName]);
      
      if (result.rows.length === 0) {
        await this.initializeUserBelt(userId, topicName);
        result = await pool.query(query, [userId, topicName]);
      }

      const progression = result.rows[0];
      const accuracy = quizScore / 100;

      const updateQuery = `
        UPDATE user_belt_progression
        SET 
          total_quizzes = total_quizzes + 1,
          successful_quizzes = successful_quizzes + $3,
          current_accuracy = (
            (current_accuracy * (total_quizzes - 1)) + $4
          ) / total_quizzes,
          advancement_progress = $5,
          updated_at = NOW()
        WHERE user_id = $1 AND topic_name = $2
        RETURNING *;
      `;

      const newProgress = progression.advancement_progress || {};
      newProgress.last_quiz_score = quizScore;
      newProgress.last_quiz_date = new Date().toISOString();
      newProgress.quizzes_completed = (newProgress.quizzes_completed || 0) + 1;

      const isSuccessful = quizScore >= 70 ? 1 : 0;

      const updateResult = await pool.query(updateQuery, [
        userId,
        topicName,
        isSuccessful,
        accuracy,
        newProgress
      ]);

      console.log(`✓ Quiz recorded for ${userId}: ${topicName} (Score: ${quizScore}%)`);

      await this.checkUserBeltAdvancement(userId, topicName);

      return updateResult.rows[0];
    } catch (error) {
      console.error(`✗ Error recording quiz attempt:`, error.message);
      throw error;
    }
  }

  async checkUserBeltAdvancement(userId, topicName) {
    const query = `
      SELECT * FROM user_belt_progression 
      WHERE user_id = $1 AND topic_name = $2
    `;

    try {
      const result = await pool.query(query, [userId, topicName]);
      if (result.rows.length === 0) return;

      const progression = result.rows[0];
      const currentBelt = progression.current_belt;
      const currentStripes = progression.current_stripes;

      let nextStripe = currentStripes + 1;
      let nextBelt = currentBelt;
      let requirements = USER_BELT_REQUIREMENTS[currentBelt]?.[`stripe_${nextStripe}`];

      if (!requirements) {
        const beltOrder = ['white_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];
        const currentIndex = beltOrder.indexOf(currentBelt);
        if (currentIndex < beltOrder.length - 1) {
          nextBelt = beltOrder[currentIndex + 1];
          nextStripe = 0;
          requirements = USER_BELT_REQUIREMENTS[nextBelt]?.[`stripe_${nextStripe}`];
        }
      }

      if (!requirements) return;

      const quizzesMet = progression.total_quizzes >= requirements.quizzes;
      const accuracyMet = progression.current_accuracy >= requirements.accuracy;
      const councilReadinessMet = progression.council_readiness_score >= requirements.council_readiness;

      if (quizzesMet && accuracyMet && councilReadinessMet) {
        await this.advanceUserBelt(userId, topicName, nextBelt, nextStripe);
      }
    } catch (error) {
      console.error(`✗ Error checking belt advancement:`, error.message);
    }
  }

  async advanceUserBelt(userId, topicName, newBelt, newStripes) {
    const updateQuery = `
      UPDATE user_belt_progression
      SET 
        current_belt = $3,
        current_stripes = $4,
        belt_history = array_append(
          COALESCE(belt_history, '{}'),
          jsonb_build_object(
            'belt', $3,
            'stripes', $4,
            'date', NOW(),
            'topic', $2
          )
        ),
        total_quizzes = 0,
        successful_quizzes = 0,
        advancement_progress = jsonb_build_object(),
        updated_at = NOW()
      WHERE user_id = $1 AND topic_name = $2
      RETURNING *;
    `;

    try {
      const result = await pool.query(updateQuery, [userId, topicName, newBelt, newStripes]);
      console.log(`🥋 ${userId} advanced to ${newBelt} - ${newStripes} stripes on ${topicName}!`);
      return result.rows[0];
    } catch (error) {
      console.error(`✗ Error advancing user belt:`, error.message);
      throw error;
    }
  }

  async getUserBeltStatus(userId, topicName) {
    const query = `
      SELECT * FROM user_belt_progression 
      WHERE user_id = $1 AND topic_name = $2
    `;

    try {
      const result = await pool.query(query, [userId, topicName]);
      if (result.rows.length === 0) return null;

      const progression = result.rows[0];
      return {
        user_id: userId,
        topic: topicName,
        current_belt: progression.current_belt,
        current_stripes: progression.current_stripes,
        total_quizzes: progression.total_quizzes,
        accuracy: `${(progression.current_accuracy * 100).toFixed(1)}%`,
        council_readiness: `${(progression.council_readiness_score * 100).toFixed(1)}%`,
        belt_history: progression.belt_history
      };
    } catch (error) {
      console.error(`✗ Error fetching belt status:`, error.message);
      throw error;
    }
  }
}

export default new UserBeltProgressionManager();
