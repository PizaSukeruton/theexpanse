/*
 * REQUIRED DATABASE INDEXES:
 * 
 * CREATE INDEX idx_character_traits_lookup ON character_trait_scores 
 * (character_hex_id, trait_hex_color);
 * 
 * CREATE INDEX idx_character_inventory_lookup ON character_inventory 
 * (character_id, slot_hex);
 * 
 * CREATE INDEX idx_character_knowledge_lookup ON character_claimed_knowledge_slots 
 * (character_id, slot_trait_hex_id);
 * 
 * CREATE INDEX idx_characteristics_hex ON characteristics (hex_color);
 * 
 * CREATE INDEX idx_knowledge_domains_id ON knowledge_domains (domain_id);
 * 
 * Without these indexes, loadCharacter() will be slow (>500ms) at scale.
 */

// backend/engines/CharacterEngine.js
// Core Character Engine - Production Grade V2
// Manages all 370 slots with event broadcasting and full error handling

import pool from '../db/pool.js';
import { EventEmitter } from 'events';

class CharacterEngine extends EventEmitter {
    // Constants for all magic values
    static CONSTANTS = {
        SLOT_CATEGORIES: {
            EMOTIONAL: 'Emotional',
            COGNITIVE: 'Cognitive', 
            SOCIAL: 'Social',
            BEHAVIORAL: 'Behavioral',
            SPECIALIZED: 'Specialized',
            INVENTORY: 'Inventory',
            KNOWLEDGE: 'Knowledge',
            BLANK: 'Blank Slot'
        },
        EVENTS: {
            CHARACTER_LOADED: 'character:loaded',
            MODULE_REGISTERED: 'module:registered',
            MODULE_EXECUTED: 'module:executed',
            INTERACTION_DETECTED: 'interaction:detected',
            ERROR: 'engine:error'
        },
        INTERACTION_THRESHOLDS: {
            TRAIT_CONFLICT: 70,
            TRAIT_EXTREME_CONFLICT: 85,
            DEFAULT_SCORE: 50,
            TRIGGER_MINIMUM: 60
        },
        // Valid category mappings for validation
        VALID_CATEGORY_MAPPINGS: {
            'inventory': 'inventory',
            'knowledge': 'knowledge', 
            'blank_slot': 'blank',
            'emotional': 'trait',
            'cognitive': 'trait',
            'social': 'trait',
            'behavioral': 'trait',
            'specialized': 'trait'
        }
    };

    constructor(characterId, context = {}) {
        super();
        
        if (!characterId || !characterId.match(/^#[0-9A-F]{6}$/i)) {
            throw new Error('Invalid character ID format. Expected #XXXXXX');
        }
        
        this.characterId = characterId;
        this.traits = new Map();
        this.inventory = new Map();
        this.knowledge = new Map();
        this.blankSlots = new Map();
        this.modules = new Map();
        this.isLoaded = false;
        this.metadata = {};
        
        // Engine context for modules
        this.context = {
            logger: context.logger || console,
            seed: context.seed || this.generateSeed(),
            pool: pool,
            eventBus: this,
            ...context
        };
        
        // Module registration state
        this.moduleInitQueue = [];
        this.isInitializing = false;
        
        // Performance metrics
        this.metrics = {
            loadTime: 0,
            moduleExecutions: 0,
            interactionChecks: 0,
            avgModuleTime: 0
        };
    }
    
    generateSeed() {
        // Deterministic seed from character ID
        let hash = 0;
        for (let i = 0; i < this.characterId.length; i++) {
            const char = this.characterId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    async loadCharacter() {
        const startTime = Date.now();
        
        if (this.isLoaded) {
            this.context.logger.warn(`[CharacterEngine] Character ${this.characterId} already loaded`);
            return this.exportSummary();
        }

        const client = await pool.connect();
        try {
            // NO TRANSACTION for reads - they're all SELECT queries
            
            // Load character metadata (no lock needed for read)
            const characterQuery = `
                SELECT character_id, character_name, description, category as character_type, 
                       created_at, updated_at
                FROM character_profiles
                WHERE character_id = $1
            `;
            
            const characterResult = await client.query(characterQuery, [this.characterId]);
            
            if (characterResult.rows.length === 0) {
                throw new Error(`Character ${this.characterId} not found`);
            }
            
            this.metadata = { ...characterResult.rows[0], name: characterResult.rows[0].character_name };

            // Prepare all queries
            const slotsQuery = `
                SELECT 
                    cts.trait_hex_color as slot_hex,
                    cts.percentile_score,
                    c.trait_name,
                    c.category
                FROM character_trait_scores cts
                INNER JOIN characteristics c ON cts.trait_hex_color = c.hex_color
                WHERE cts.character_hex_id = $1
                ORDER BY c.hex_color
            `;
            
            const inventoryQuery = `
                SELECT slot_hex, item_name, item_description, item_properties
                FROM character_inventory
                WHERE character_id = $1
            `;
            
            const knowledgeQuery = `
                SELECT 
                    ccks.slot_trait_hex_id,
                    kd.domain_name,
                    kd.domain_id,
                    kd.description,
                    cks.current_retrievability,
                    cks.stability
                FROM character_claimed_knowledge_slots ccks
                INNER JOIN knowledge_domains kd ON ccks.domain_id = kd.domain_id
                LEFT JOIN character_knowledge_state cks 
                    ON cks.character_id = ccks.character_id 
                    AND cks.knowledge_id = kd.domain_id
                WHERE ccks.character_id = $1
            `;
            
            // Load all slots data in PARALLEL for speed
            const [slotsResult, inventoryResult, knowledgeResult] = await Promise.all([
                client.query(slotsQuery, [this.characterId]),
                client.query(inventoryQuery, [this.characterId]),
                client.query(knowledgeQuery, [this.characterId])
            ]);
            
            // Process slots with proper validation
            for (const slot of slotsResult.rows) {
                const slotData = {
                    hex: slot.slot_hex,
                    name: slot.trait_name,
                    score: parseFloat(slot.percentile_score) || 0,
                    category: slot.category.trim(),
                    timestamp: Date.now()
                };

                const category = slotData.category.toLowerCase().replace(/\s+/g, '_');
                const categoryType = CharacterEngine.CONSTANTS.VALID_CATEGORY_MAPPINGS[category];
                
                if (!categoryType) {
                    this.context.logger.error(`[CharacterEngine] Unknown category: ${slotData.category} for slot ${slotData.hex}`);
                    continue; // Skip this slot entirely
                }
                
                if (categoryType === 'inventory') {
                    this.inventory.set(slotData.hex, slotData);
                } else if (categoryType === 'knowledge') {
                    this.knowledge.set(slotData.hex, slotData);
                } else if (categoryType === 'blank') {
                    this.blankSlots.set(slotData.hex, slotData);
                } else {
                    this.traits.set(slotData.hex, slotData);
                }
            }

            // Process inventory items
            for (const item of inventoryResult.rows) {
                if (this.inventory.has(item.slot_hex)) {
                    this.inventory.get(item.slot_hex).item = {
                        name: item.item_name,
                        description: item.item_description,
                        properties: item.item_properties || {}
                    };
                }
            }

            // Process knowledge domains
            for (const domain of knowledgeResult.rows) {
                if (this.knowledge.has(domain.slot_trait_hex_id)) {
                    this.knowledge.get(domain.slot_trait_hex_id).domain = {
                        id: domain.domain_id,
                        name: domain.domain_name,
                        description: domain.description,
                        retrievability: domain.current_retrievability || 0.5,
                        stability: domain.stability || 0.5
                    };
                }
            }
            
            this.isLoaded = true;
            this.metrics.loadTime = Date.now() - startTime;
            
            // Process any queued module registrations
            await this.processModuleQueue();
            
            const summary = this.exportSummary();
            
            this.context.logger.info(`[CharacterEngine] Loaded ${this.characterId} in ${this.metrics.loadTime}ms:`, {
                traits: this.traits.size,
                inventory: this.inventory.size,
                knowledge: this.knowledge.size,
                blank: this.blankSlots.size
            });
            
            // Fire event asynchronously (non-blocking)
            this.emit(CharacterEngine.CONSTANTS.EVENTS.CHARACTER_LOADED, summary);
            
            return summary;

        } catch (error) {
            // No ROLLBACK needed - no transaction
            this.context.logger.error(`[CharacterEngine] Error loading character ${this.characterId}:`, error);
            this.emit(CharacterEngine.CONSTANTS.EVENTS.ERROR, error);
            throw error;
        } finally {
            client.release();
        }
    }

    async registerModule(name, moduleInstance) {
        if (!name || typeof name !== 'string') {
            throw new Error('Module name must be a non-empty string');
        }
        
        if (!moduleInstance || typeof moduleInstance !== 'object') {
            throw new Error('Module instance must be an object');
        }
        
        // Queue if not loaded yet
        if (!this.isLoaded) {
            this.moduleInitQueue.push({ name, instance: moduleInstance });
            this.context.logger.info(`[CharacterEngine] Module ${name} queued for registration`);
            return;
        }
        
        // Initialize module
        if (typeof moduleInstance.initialize === 'function') {
            try {
                await moduleInstance.initialize({
                    traits: new Map(this.traits),
                    inventory: new Map(this.inventory),
                    knowledge: new Map(this.knowledge),
                    blankSlots: new Map(this.blankSlots),
                    metadata: { ...this.metadata },
                    context: this.context,
                    characterId: this.characterId
                });
            } catch (error) {
                this.context.logger.error(`[CharacterEngine] Failed to initialize module ${name}:`, error);
                throw error;
            }
        }
        
        this.modules.set(name, moduleInstance);
        this.context.logger.info(`[CharacterEngine] Registered module: ${name}`);
        this.emit(CharacterEngine.CONSTANTS.EVENTS.MODULE_REGISTERED, { name, characterId: this.characterId });
    }
    
    async processModuleQueue() {
        if (this.isInitializing || this.moduleInitQueue.length === 0) {
            return;
        }
        
        this.isInitializing = true;
        
        while (this.moduleInitQueue.length > 0) {
            const { name, instance } = this.moduleInitQueue.shift();
            try {
                await this.registerModule(name, instance);
            } catch (error) {
                this.context.logger.error(`[CharacterEngine] Failed to register queued module ${name}:`, error);
            }
        }
        
        this.isInitializing = false;
    }

    async executeModule(moduleName, action, ...args) {
        if (!this.modules.has(moduleName)) {
            throw new Error(`Module ${moduleName} not registered for character ${this.characterId}`);
        }
        
        const module = this.modules.get(moduleName);
        
        if (typeof module[action] !== 'function') {
            throw new Error(`Action ${action} not found in module ${moduleName}`);
        }
        
        try {
            const startTime = Date.now();
            const result = await module[action](...args);
            const duration = Date.now() - startTime;
            
            // Update metrics
            this.metrics.moduleExecutions++;
            this.metrics.avgModuleTime = 
                (this.metrics.avgModuleTime * (this.metrics.moduleExecutions - 1) + duration) / 
                this.metrics.moduleExecutions;
            
            this.emit(CharacterEngine.CONSTANTS.EVENTS.MODULE_EXECUTED, {
                module: moduleName,
                action,
                duration,
                characterId: this.characterId
            });
            
            return result;
            
        } catch (error) {
            this.context.logger.error(`[CharacterEngine] Module execution failed:`, {
                module: moduleName,
                action,
                error: error.message
            });
            throw error;
        }
    }

    async checkInteractionTriggers(otherEngine) {
        if (!otherEngine || !otherEngine.isLoaded) {
            throw new Error('Other character must be loaded');
        }
        
        this.metrics.interactionChecks++;
        
        const triggers = [];
        const constants = CharacterEngine.CONSTANTS.INTERACTION_THRESHOLDS;
        
        // Inventory-Knowledge matching with sophisticated content analysis
        for (const [invHex, invSlot] of this.inventory) {
            if (!invSlot.item) continue;
            
            for (const [knowHex, knowSlot] of otherEngine.knowledge) {
                if (!knowSlot.domain) continue;
                
                const relevance = this.calculateContentRelevance(
                    invSlot.item.name,
                    knowSlot.domain.name
                );
                
                if (relevance > constants.TRIGGER_MINIMUM) {
                    triggers.push({
                        type: 'inventory_knowledge_match',
                        strength: relevance,
                        source: {
                            character: this.characterId,
                            slot: invHex,
                            item: invSlot.item.name,
                            score: invSlot.score
                        },
                        target: {
                            character: otherEngine.characterId,
                            slot: knowHex,
                            domain: knowSlot.domain.name,
                            retrievability: knowSlot.domain.retrievability
                        }
                    });
                }
            }
        }
        
        // Trait interactions
        for (const [traitHex, trait] of this.traits) {
            const otherTrait = otherEngine.traits.get(traitHex);
            
            if (otherTrait) {
                const difference = Math.abs(trait.score - otherTrait.score);
                
                if (difference > constants.TRAIT_CONFLICT) {
                    triggers.push({
                        type: 'trait_contrast',
                        trait: trait.name,
                        hex: traitHex,
                        difference,
                        potential: difference > constants.TRAIT_EXTREME_CONFLICT ? 'conflict' : 'tension',
                        scores: {
                            self: trait.score,
                            other: otherTrait.score
                        }
                    });
                }
                
                // Complementary traits (one high, one low)
                if ((trait.score > 80 && otherTrait.score < 20) ||
                    (trait.score < 20 && otherTrait.score > 80)) {
                    triggers.push({
                        type: 'trait_complement',
                        trait: trait.name,
                        hex: traitHex,
                        potential: 'synergy',
                        scores: {
                            self: trait.score,
                            other: otherTrait.score
                        }
                    });
                }
            }
        }
        
        if (triggers.length > 0) {
            this.emit(CharacterEngine.CONSTANTS.EVENTS.INTERACTION_DETECTED, {
                source: this.characterId,
                target: otherEngine.characterId,
                triggers
            });
        }
        
        return triggers;
    }

    calculateContentRelevance(itemName, domainName) {
        if (!itemName || !domainName) return 0;
        
        const item = itemName.toLowerCase();
        const domain = domainName.toLowerCase();
        
        // Direct match
        if (item === domain) return 100;
        
        // Contains match
        if (item.includes(domain) || domain.includes(item)) return 85;
        
        // Word overlap
        const itemWords = new Set(item.split(/\s+/));
        const domainWords = new Set(domain.split(/\s+/));
        const intersection = new Set([...itemWords].filter(x => domainWords.has(x)));
        
        if (intersection.size > 0) {
            const union = new Set([...itemWords, ...domainWords]);
            return Math.round((intersection.size / union.size) * 100);
        }
        
        // Semantic matching (can be enhanced with word vectors later)
        const semanticPairs = [
            ['pokemon', 'creature'],
            ['card', 'collectible'],
            ['cheese', 'dairy'],
            ['sword', 'weapon'],
            ['book', 'knowledge']
        ];
        
        for (const [word1, word2] of semanticPairs) {
            if ((item.includes(word1) && domain.includes(word2)) ||
                (item.includes(word2) && domain.includes(word1))) {
                return 70;
            }
        }
        
        return 0;
    }

    // Utility methods
    getSlot(hexId) {
        return this.traits.get(hexId) || 
               this.inventory.get(hexId) || 
               this.knowledge.get(hexId) || 
               this.blankSlots.get(hexId) || 
               null;
    }
    
    getTrait(identifier) {
        if (identifier.startsWith('#')) {
            return this.traits.get(identifier);
        }
        
        for (const [hex, trait] of this.traits) {
            if (trait.name.toLowerCase() === identifier.toLowerCase()) {
                return trait;
            }
        }
        
        return null;
    }
    
    getTraitScore(identifier) {
        const trait = this.getTrait(identifier);
        return trait ? trait.score : 0;
    }
    
    hasTrait(identifier) {
        return this.getTrait(identifier) !== null;
    }
    
    getTraitsByCategory(category) {
        const normalizedCategory = category.toLowerCase();
        const categoryTraits = [];
        
        for (const [hex, trait] of this.traits) {
            if (trait.category.toLowerCase() === normalizedCategory) {
                categoryTraits.push(trait);
            }
        }
        
        return categoryTraits;
    }
    
    getAllSlots() {
        const allSlots = new Map();
        
        this.traits.forEach((v, k) => allSlots.set(k, { ...v, type: 'trait' }));
        this.inventory.forEach((v, k) => allSlots.set(k, { ...v, type: 'inventory' }));
        this.knowledge.forEach((v, k) => allSlots.set(k, { ...v, type: 'knowledge' }));
        this.blankSlots.forEach((v, k) => allSlots.set(k, { ...v, type: 'blank' }));
        
        return allSlots;
    }
    
    exportSummary() {
        return {
            characterId: this.characterId,
            metadata: this.metadata,
            slotCounts: {
                traits: this.traits.size,
                inventory: this.inventory.size,
                knowledge: this.knowledge.size,
                blank: this.blankSlots.size,
                total: this.traits.size + this.inventory.size + 
                       this.knowledge.size + this.blankSlots.size
            },
            metrics: this.getMetrics()
        };
    }
    
    exportProfile() {
        return {
            characterId: this.characterId,
            metadata: this.metadata,
            traits: Array.from(this.traits.values()),
            inventory: Array.from(this.inventory.values()),
            knowledge: Array.from(this.knowledge.values()),
            blankSlots: Array.from(this.blankSlots.values()),
            modules: Array.from(this.modules.keys())
        };
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
    
    listModules() {
        return Array.from(this.modules.keys());
    }
    
    async unregisterModule(name) {
        if (this.modules.has(name)) {
            const module = this.modules.get(name);
            
            if (typeof module.cleanup === 'function') {
                try {
                    await module.cleanup();
                } catch (error) {
                    this.context.logger.error(`[CharacterEngine] Error cleaning up module ${name}:`, error);
                }
            }
            
            this.modules.delete(name);
            this.context.logger.info(`[CharacterEngine] Unregistered module: ${name}`);
        }
    }
    
    async cleanup() {
        this.context.logger.info(`[CharacterEngine] Starting cleanup for ${this.characterId}`);
        
        // Cleanup all modules
        const cleanupPromises = [];
        for (const [name, module] of this.modules) {
            if (typeof module.cleanup === 'function') {
                cleanupPromises.push(
                    module.cleanup()
                        .catch(err => this.context.logger.error(`Module ${name} cleanup failed:`, err))
                );
            }
        }
        
        await Promise.all(cleanupPromises);
        
        // Clear all maps
        this.modules.clear();
        this.traits.clear();
        this.inventory.clear();
        this.knowledge.clear();
        this.blankSlots.clear();
        this.moduleInitQueue = [];
        this.isLoaded = false;
        
        // Remove all event listeners
        this.removeAllListeners();
        
        this.context.logger.info(`[CharacterEngine] Cleanup complete for ${this.characterId}`);
    }
}

export default CharacterEngine;
