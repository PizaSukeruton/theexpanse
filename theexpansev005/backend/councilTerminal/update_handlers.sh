#!/bin/bash

cp cotwQueryEngine.js cotwQueryEngine.js.before_update

sed -i '' '226s/.*/      message: `I found ${entityData.entity_name}. ${entityData.created_at ? "First recorded on " + new Date(entityData.created_at).toLocaleDateString() : "Timeline data not available."} ${entityData.search_context ? entityData.search_context : ""}`,/' cotwQueryEngine.js

sed -i '' '241s/.*/      message: `${entityData.entity_name} ${entityData.category ? "is currently active as " + entityData.category : "exists"} in Realm ${realm}. ${entityData.search_context || ""}`,/' cotwQueryEngine.js

sed -i '' '275s/.*/      message: `${entityData.entity_name}: ${entityData.search_context || "Process details not available for this " + entityData.entity_type.toLowerCase()}.`,/' cotwQueryEngine.js

echo "Handler messages updated!"
