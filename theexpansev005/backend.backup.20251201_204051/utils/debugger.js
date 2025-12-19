/**
 * System-wide Debugger
 * Tracks all events and logs them to help diagnose issues
 * Can be toggled on/off and displays relevant debug info to users
 */

class SystemDebugger {
  constructor() {
    this.enabled = process.env.DEBUG_MODE === 'true';
    this.events = [];
    this.maxEvents = 100;
    this.filters = {
      'explain-hex': true,
      'socket-emit': true,
      'socket-receive': true,
      'error': true,
      'explain-hex-response': true
    };
  }

  log(category, data, severity = 'info') {
    const timestamp = new Date().toISOString();
    const event = {
      timestamp,
      category,
      data,
      severity
    };

    if (this.enabled) {
      console.log(`[DEBUG ${severity.toUpperCase()}] ${category}:`, data);
    }

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  explainHexRequested(hexId, mode) {
    this.log('explain-hex', {
      event: 'RACCOON_CLICKED',
      hexId,
      mode,
      timestamp: new Date().toISOString()
    }, 'info');
  }

  explainHexProcessing(hexId) {
    this.log('explain-hex', {
      event: 'PROCESSING',
      hexId,
      phase: 'backend_handler_called'
    }, 'info');
  }

  explainHexDatabaseQuery(hexId, table, found) {
    this.log('explain-hex', {
      event: 'DATABASE_QUERY',
      hexId,
      table,
      found: found ? 'YES' : 'NO',
      rowCount: found ? found.length : 0
    }, 'info');
  }

  explainHexResponse(hexId, mode, success, message) {
    this.log('explain-hex-response', {
      event: 'RESPONSE_SENT',
      hexId,
      mode,
      success,
      message: message ? message.substring(0, 100) + '...' : 'N/A'
    }, success ? 'info' : 'error');
  }

  socketEmit(event, data) {
    this.log('socket-emit', {
      event,
      dataKeys: Object.keys(data || {}),
      timestamp: new Date().toISOString()
    }, 'info');
  }

  socketReceive(event, data) {
    this.log('socket-receive', {
      event,
      dataKeys: Object.keys(data || {}),
      timestamp: new Date().toISOString()
    }, 'info');
  }

  error(category, error) {
    this.log('error', {
      category,
      message: error.message,
      stack: error.stack ? error.stack.substring(0, 200) : 'N/A'
    }, 'error');
  }

  getRecentEvents(category = null, limit = 20) {
    let filtered = this.events;
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }
    return filtered.slice(-limit);
  }

  getDebugReport() {
    return {
      enabled: this.enabled,
      totalEvents: this.events.length,
      recentExplainHexEvents: this.getRecentEvents('explain-hex', 10),
      recentErrors: this.getRecentEvents('error', 10),
      allEvents: this.events
    };
  }

  formatForTerminal() {
    const report = this.getDebugReport();
    let output = `
DEBUG REPORT - SYSTEM DEBUGGER
================================

Status: ${report.enabled ? 'ENABLED' : 'DISABLED'}
Total Events Logged: ${report.totalEvents}

RECENT EXPLAIN-HEX EVENTS:
${report.recentExplainHexEvents.map(e => 
  `  [${e.timestamp}] ${e.severity.toUpperCase()}: ${JSON.stringify(e.data, null, 2)}`
).join('\n') || '  No recent events'}

RECENT ERRORS:
${report.recentErrors.map(e => 
  `  [${e.timestamp}] ${e.severity.toUpperCase()}: ${e.data.message}`
).join('\n') || '  No recent errors'}

================================`;
    return output;
  }
}

export default new SystemDebugger();
