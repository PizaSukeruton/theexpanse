import NaturalLanguageGenerator from './NaturalLanguageGenerator.js';

let instance = null;

export function getNaturalLanguageGenerator() {
    if (!instance) {
        instance = new NaturalLanguageGenerator();
    }
    return instance;
}
