import onboardingOrchestrator from './backend/services/OnboardingOrchestrator.js';

console.log('Testing OnboardingOrchestrator...\n');

console.log('1. Configuration validated:', onboardingOrchestrator.validTransitions);
console.log('\n2. Valid next states from "new":', onboardingOrchestrator.getValidNextStates('new'));
console.log('\n3. Valid next states from "welcomed":', onboardingOrchestrator.getValidNextStates('welcomed'));
console.log('\n4. Valid next states from "onboarded":', onboardingOrchestrator.getValidNextStates('onboarded'));

console.log('\n✅ OnboardingOrchestrator loaded successfully!');
