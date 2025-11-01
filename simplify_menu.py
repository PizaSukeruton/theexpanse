import re

with open('public/admin-menu.js', 'r') as f:
    content = f.read()

new_menu_items = """  const menuItems = [
    {
      title: 'CHARACTERS',
      items: ['View All', 'Create New', 'Edit', 'Delete']
    },
    {
      title: 'EVENTS',
      items: ['Timeline', 'Create Event', 'Multiverse']
    },
    {
      title: 'STORY ARCS',
      items: ['View Arcs', 'Create Arc', 'Progression']
    },
    {
      title: 'NARRATIVES',
      items: ['View All', 'Create New', 'Path Editor']
    },
    {
      title: 'KNOWLEDGE',
      items: ['AOK Entries', 'Transfers', 'Domains']
    },
    {
      title: 'MEDIA',
      items: ['Upload New', 'View Gallery']
    },
    {
      title: 'SYSTEM',
      items: ['Users', 'Hex Registry', 'Terminal Logs']
    }
  ];"""

pattern = r'  const menuItems = \[.*?\];'
content = re.sub(pattern, new_menu_items, content, flags=re.DOTALL)

with open('public/admin-menu.js', 'w') as f:
    f.write(content)

print("Menu simplified!")
