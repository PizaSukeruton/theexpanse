import padEstimator from '../services/padEstimator.js';
import ngramSurprisal from '../services/ngramSurprisal.js';
import metaphorDetector from '../services/metaphorDetector.js';
import pool from '../db/pool.js';

async function trainAllModels() {
  console.log('='.repeat(60));
  console.log('TRAINING INTERNAL MODELS FROM LTLM CORPUS');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    const padResults = await padEstimator.train();
    console.log('PAD Estimator:', padResults);
    console.log('');
    
    const ngramResults = await ngramSurprisal.train();
    console.log('N-gram Surprisal:', ngramResults);
    console.log('');
    
    const metaphorResults = await metaphorDetector.train();
    console.log('Metaphor Detector:', metaphorResults);
    console.log('');
    
    console.log('='.repeat(60));
    console.log('ALL MODELS TRAINED SUCCESSFULLY');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('[Training Error]', error);
    throw error;
  } finally {
    await pool.end();
  }
}

trainAllModels();
