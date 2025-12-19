import generateHexId from '../utils/hexIdGenerator.js';

async function run() {
  try {
    const id = await generateHexId('speech_act_category_id');
    console.log(id);
  } catch (err) {
    console.error('Error generating speech_act_category_id');
    console.error(err);
    process.exitCode = 1;
  }
}

run();
