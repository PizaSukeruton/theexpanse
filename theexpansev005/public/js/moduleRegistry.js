// public/js/moduleRegistry.js
// Simple module registration system

const _modules = new Map();

export function registerModule(id, definition) {
  if (_modules.has(id)) {
    console.warn(`[ModuleRegistry] Module "${id}" is already registered. Overwriting.`);
  }
  _modules.set(id, definition);
  console.log(`[ModuleRegistry] Registered module: ${id}`);
}

export function getModule(id) {
  const mod = _modules.get(id);
  if (!mod) {
    console.warn(`[ModuleRegistry] Module "${id}" not found`);
  }
  return mod;
}

export const ModuleRegistry = {
  register: registerModule,
  get: getModule
};
ModuleRegistry.define = registerModule;

ModuleRegistry._modules = _modules;
window.ModuleRegistry = ModuleRegistry;
export default ModuleRegistry;
window.ModuleRegistry = ModuleRegistry;
