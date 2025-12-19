#!/bin/bash

cp cotwQueryEngine.js cotwQueryEngine.js.backup.$(date +%s)

sed -i '' '238,245c\
  async handleWhere(entityData, realm) {\
    const { entity_name, search_context, category } = entityData;\
    \
    let message = `${entity_name}`;\
    \
    if (search_context && search_context.toLowerCase().includes("realm")) {\
      message += ` - ${search_context}`;\
    } else if (category) {\
      message += ` is currently active in this realm as ${category}.`;\
    } else {\
      message += ` exists in Realm ${realm}.`;\
    }\
    \
    return {\
      success: true,\
      message,\
      data: entityData,\
      realm\
    };\
  }' cotwQueryEngine.js

sed -i '' '272,280c\
  async handleHow(entityData, realm) {\
    const { entity_name, search_context, entity_type } = entityData;\
    \
    let message = `${entity_name}`;\
    \
    if (search_context) {\
      message += `: ${search_context}`;\
    } else {\
      message += ` is a ${entity_type.toLowerCase()} in this realm.`;\
    }\
    \
    return {\
      success: true,\
      message,\
      data: entityData,\
      realm\
    };\
  }' cotwQueryEngine.js

sed -i '' '226,233c\
  async handleWhen(entityData, realm) {\
    const { entity_name, created_at, search_context } = entityData;\
    \
    let message = `${entity_name}`;\
    \
    if (created_at) {\
      const date = new Date(created_at);\
      message += ` was first recorded ${date.toLocaleDateString()}.`;\
    }\
    \
    if (search_context) {\
      message += `\\n${search_context}`;\
    }\
    \
    return {\
      success: true,\
      message,\
      data: entityData,\
      realm\
    };\
  }' cotwQueryEngine.js

echo "User query improvements complete!"
