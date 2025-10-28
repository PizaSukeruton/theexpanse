class TerminalCore {
  constructor() {
    this.accessLevels = {
      PUBLIC: 0,
      USER: 1,
      SPECIFIC: 2,
      COUNCIL: 3,
      ADMIN: 4
    };
  }
  
  test() {
    return 'Terminal Core loaded';
  }
}

module.exports = TerminalCore;
