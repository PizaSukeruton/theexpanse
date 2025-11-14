import dbAdapter from './dbAdapter.js'

let knownNames = []
let knownLocations = []
let knownArcs = []
let knownEvents = []
let loaded = false

async function loadEntities() {
  // Replace these with your actual table and column names
  knownNames = await dbAdapter.getEntityList('characters', 'name')
  knownLocations = await dbAdapter.getEntityList('locations', 'name')
  knownArcs = await dbAdapter.getEntityList('arcs', 'hex_code')
  knownEvents = await dbAdapter.getEntityList('events', 'title')
  loaded = true
}

export default {
  resolveEntity: async function (inputText) {
    if (!loaded) await loadEntities()
    const entities = []

    for (const arc of knownArcs) {
      if (inputText.includes(arc)) entities.push({ type: 'arc', value: arc })
    }
    for (const name of knownNames) {
      if (inputText.includes(name)) entities.push({ type: 'name', value: name })
    }
    for (const loc of knownLocations) {
      if (inputText.includes(loc)) entities.push({ type: 'location', value: loc })
    }
    for (const evt of knownEvents) {
      if (inputText.includes(evt)) entities.push({ type: 'event', value: evt })
    }

    return entities
  }
}
