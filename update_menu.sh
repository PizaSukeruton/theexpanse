#!/bin/bash

sed -i '' '30,54d' public/admin-menu.js

sed -i '' '29a\
  const menuItems = [\
    {\
      title: '"'"'CHARACTERS'"'"',\
      items: ['"'"'View All'"'"', '"'"'Create New'"'"', '"'"'Edit'"'"', '"'"'Delete'"'"', '"'"'Categories'"'"', '"'"'Traits'"'"', '"'"'Relationships'"'"', '"'"'Import/Export'"'"', '"'"'Search'"'"']\
    },\
    {\
      title: '"'"'EVENTS'"'"',\
      items: ['"'"'Timeline'"'"', '"'"'Create Event'"'"', '"'"'Edit Event'"'"', '"'"'Delete Event'"'"', '"'"'Event Types'"'"', '"'"'Link Characters'"'"', '"'"'Multiverse'"'"', '"'"'Search'"'"']\
    },\
    {\
      title: '"'"'STORY ARCS'"'"',\
      items: ['"'"'View Arcs'"'"', '"'"'Create Arc'"'"', '"'"'Edit Arc'"'"', '"'"'Delete Arc'"'"', '"'"'Arc Participants'"'"', '"'"'Progression'"'"', '"'"'Templates'"'"', '"'"'Search'"'"']\
    },\
    {\
      title: '"'"'NARRATIVES'"'"',\
      items: ['"'"'View All'"'"', '"'"'Create New'"'"', '"'"'Edit'"'"', '"'"'Delete'"'"', '"'"'Path Editor'"'"', '"'"'Link to Arc'"'"', '"'"'Templates'"'"', '"'"'Search'"'"']\
    },\
    {\
      title: '"'"'KNOWLEDGE'"'"',\
      items: ['"'"'AOK Entries'"'"', '"'"'Create Entry'"'"', '"'"'Edit Entry'"'"', '"'"'Delete Entry'"'"', '"'"'Transfers'"'"', '"'"'Domains'"'"', '"'"'Review Queue'"'"', '"'"'Search'"'"']\
    },\
    {\
      title: '"'"'MEDIA'"'"',\
      items: ['"'"'Upload New'"'"', '"'"'Edit'"'"', '"'"'Create Info'"'"', '"'"'Hex Code ID'"'"', '"'"'Metadata'"'"', '"'"'View Gallery'"'"', '"'"'Delete'"'"', '"'"'Search'"'"']\
    },\
    {\
      title: '"'"'SYSTEM'"'"',\
      items: ['"'"'Database Status'"'"', '"'"'Users'"'"', '"'"'Hex Registry'"'"', '"'"'Terminal Logs'"'"', '"'"'Backup/Restore'"'"', '"'"'Settings'"'"', '"'"'Security'"'"', '"'"'API Keys'"'"']\
    }\
  ];
' public/admin-menu.js

echo "Menu updated!"
