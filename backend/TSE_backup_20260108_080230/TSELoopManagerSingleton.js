import TSELoopManager from './TSELoopManager.js';

let instance = null;

export function getTSELoopManager() {
    if (!instance) {
        instance = new TSELoopManager();
    }
    return instance;
}
