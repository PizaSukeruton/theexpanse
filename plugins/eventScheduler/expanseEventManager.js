import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);class ExpanseEventManager {
  constructor(dataDir) {
    this.dataDir = dataDir || path.join(__dirname, '..', '..', 'data');
    this.eventsFile = path.join(this.dataDir, 'multiverse_events.csv');
    this.charactersFile = path.join(this.dataDir, 'characters.csv');
  }

  async getAllEvents(filters = {}) {
    try {
      const fileContent = await fs.readFile(this.eventsFile, 'utf-8');
      
      const events = await new Promise((resolve, reject) => {
        const results = [];
        const parser = parse(fileContent, {
          columns: true,
          skip_empty_lines: true
        });
        
        parser.on('data', (row) => results.push(row));
        parser.on('end', () => resolve(results));
        parser.on('error', (error) => reject(error));
      });

      // Apply filters for multiverse events
      let filteredEvents = events;
      if (filters.realm) {
        filteredEvents = filteredEvents.filter(e => e.realm === filters.realm);
      }
      if (filters.character_id) {
        filteredEvents = filteredEvents.filter(e => {
          const chars = e.involved_characters ? e.involved_characters.split(',') : [];
          return chars.includes(filters.character_id);
        });
      }
      if (filters.event_type) {
        filteredEvents = filteredEvents.filter(e => e.event_type === filters.event_type);
      }

      return filteredEvents;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async createEvent(eventData) {
    const events = await this.getAllEvents();
    
    const eventId = `#EV${Date.now().toString(16).toUpperCase()}`;
    
    const newEvent = {
      event_id: eventId,
      timestamp: eventData.timestamp || new Date().toISOString(),
      realm: eventData.realm || 'Earth',
      location: eventData.location || 'Unknown',
      description: eventData.description || '',
      event_type: eventData.event_type || 'occurrence', // breach, meeting, battle, discovery
      threat_level: eventData.threat_level || '0',
      involved_characters: Array.isArray(eventData.involved_characters) 
        ? eventData.involved_characters.join(',') 
        : (eventData.involved_characters || ''),
      outcome: eventData.outcome || 'pending',
      archived: eventData.archived || 'false',
      access_level: eventData.access_level || '0',
      narrative_arc_id: eventData.narrative_arc_id || '',
      notes: eventData.notes || ''
    };

    events.push(newEvent);
    await this.saveEvents(events);
    
    return newEvent;
  }

  async saveEvents(events) {
    const csvContent = stringify(events, {
      header: true,
      columns: [
        'event_id', 'timestamp', 'realm', 'location', 'description',
        'event_type', 'threat_level', 'involved_characters', 
        'outcome', 'archived', 'access_level', 'narrative_arc_id', 'notes'
      ]
    });
    await fs.writeFile(this.eventsFile, csvContent, 'utf-8');
  }

  parseMultiverseDate(dateString, referenceDate = new Date()) {
    // Handle multiverse-specific date formats
    const lower = dateString.toLowerCase();
    const ref = referenceDate;
    
    if (lower === 'now') return new Date().toISOString();
    if (lower === 'tonight') {
      const tonight = new Date();
      tonight.setHours(21, 0, 0, 0);
      return tonight.toISOString();
    }
    if (lower.includes('next breach')) {
      const next = new Date();
      next.setDate(next.getDate() + 13); // 13 days for mystical timing
      return next.toISOString();
    }
    
    // Fall back to standard date parsing
    return new Date(dateString).toISOString();
  }
}

export default ExpanseEventManager;
