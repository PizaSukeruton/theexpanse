import runStandardQuery from './backend/councilTerminal/runStandardQuery.js';

const intentResult = {
  type: "HOW",
  entity: "how does the pad system work",
  entityType: null,
  entityId: null,
  entityData: null
};

const session = { user_id: "test-user", realm: "#F00000" };
const cleanCommand = "how does the pad system work";

const response = await runStandardQuery(intentResult, session, cleanCommand);
console.log('PAD Response:', JSON.stringify(response, null, 2));

process.exit(0);
