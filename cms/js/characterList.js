class CharacterList {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.characters = [];
  }

  async loadCharacters() {
    try {
      const response = await fetch('/api/cms/characters');
      const data = await response.json();
      
      if (data.success) {
        this.characters = data.characters;
        this.render();
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  }

  render() {
    const html = this.characters.map(char => `
      <div class="character-item" onclick="selectCharacter('${char.hex_id}')">
        <div class="character-name">${char.name}</div>
        <div class="character-category">${char.category || 'Unknown'}</div>
      </div>
    `).join('');

    this.container.innerHTML = html;
  }
}

window.characterList = new CharacterList('left-window-inner');
characterList.loadCharacters();

function selectCharacter(hexId) {
  console.log('Selected:', hexId);
}
