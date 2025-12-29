import pg from 'pg';
import generateHexId from './hexIdGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SQL_QUERIES = {
    getAllTables: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    `,
    
    getColumns: `
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
    `,
    
    getPrimaryKeys: `
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
        ORDER BY kcu.ordinal_position
    `,
    
    getOutboundForeignKeys: `
        SELECT DISTINCT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS referenced_table,
            ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_name = kcu.table_name
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public'
          AND kcu.table_schema = 'public'
          AND kcu.table_name = $1
          AND tc.constraint_type = 'FOREIGN KEY'
    `,
    
    getInboundForeignKeys: `
        SELECT DISTINCT
            kcu.table_name AS referencing_table,
            kcu.column_name AS referencing_column,
            ccu.column_name AS referenced_column
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_schema = 'public'
          AND kcu.table_schema = 'public'
          AND ccu.table_schema = 'public'
          AND ccu.table_name = $1
          AND tc.constraint_type = 'FOREIGN KEY'
        ORDER BY kcu.table_name, kcu.column_name
    `,
    
    getIndexes: `
        SELECT 
            indexname,
            indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = $1
        ORDER BY indexname
    `,
    
    getConstraints: `
        SELECT 
            constraint_name,
            constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY constraint_name
    `,
    
    getRowCount: `
        SELECT n_live_tup::integer FROM pg_stat_user_tables WHERE relname = $1
    `
};

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class SystemConceptGenerator {
    constructor(config) {
        this.config = config;
        this.dbPool = null;
        this.tables = [];
        this.concepts = [];
        this.grepCache = {};
        this.startTime = Date.now();
    }

    async initializePool() {
        try {
            const connectionString = this.config.connectionString;
            this.dbPool = new pg.Pool({
                connectionString,
                ssl: { rejectUnauthorized: false },
                max: 10,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000
            });

            await this.dbPool.query('SELECT 1');
            console.log(`✅ Connected via connectionString`);
            return true;
        } catch (error) {
            console.error('❌ Pool initialization failed:', error.message);
            throw error;
        }
    }

    async getAllTables() {
        try {
            const result = await this.dbPool.query(SQL_QUERIES.getAllTables);
            this.tables = result.rows.map(row => row.table_name);
            console.log(`📊 Found ${this.tables.length} tables\n`);
            return this.tables;
        } catch (error) {
            console.error('❌ Error fetching tables:', error.message);
            throw error;
        }
    }

    async getTableSchema(tableName) {
        try {
            const [columns, pks, outboundFks, inboundFks, indexes, constraints, rowCount] = await Promise.all([
                this.getColumns(tableName),
                this.getPrimaryKeys(tableName),
                this.getOutboundForeignKeys(tableName),
                this.getInboundForeignKeys(tableName),
                this.getIndexes(tableName),
                this.getConstraints(tableName),
                this.getRowCount(tableName)
            ]);

            return {
                table_name: tableName,
                row_count: rowCount || 0,
                row_count_estimated: true,
                columns,
                primary_keys: pks,
                outbound_foreign_keys: outboundFks,
                inbound_foreign_keys: this.deduplicateForeignKeys(inboundFks),
                indexes,
                constraints
            };
        } catch (error) {
            console.error(`❌ Error getting schema for ${tableName}:`, error.message);
            throw error;
        }
    }

    deduplicateForeignKeys(fks) {
        const seen = new Set();
        return fks.filter(fk => {
            const key = `${fk.referencing_table}|${fk.referencing_column}|${fk.referenced_column}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    async getColumns(tableName) {
        const result = await this.dbPool.query(SQL_QUERIES.getColumns, [tableName]);
        return result.rows.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            default: col.column_default,
            max_length: col.character_maximum_length,
            precision: col.numeric_precision,
            scale: col.numeric_scale
        }));
    }

    async getPrimaryKeys(tableName) {
        const result = await this.dbPool.query(SQL_QUERIES.getPrimaryKeys, [tableName]);
        return result.rows.map(row => row.column_name);
    }

    async getOutboundForeignKeys(tableName) {
        const result = await this.dbPool.query(SQL_QUERIES.getOutboundForeignKeys, [tableName]);
        return result.rows.map(row => ({
            constraint_name: row.constraint_name,
            column: row.column_name,
            references_table: row.referenced_table,
            references_column: row.referenced_column
        }));
    }

    async getInboundForeignKeys(tableName) {
        const result = await this.dbPool.query(SQL_QUERIES.getInboundForeignKeys, [tableName]);
        return result.rows.map(row => ({
            referencing_table: row.referencing_table,
            referencing_column: row.referencing_column,
            referenced_column: row.referenced_column
        }));
    }

    async getIndexes(tableName) {
        const result = await this.dbPool.query(SQL_QUERIES.getIndexes, [tableName]);
        return result.rows.map(row => ({
            name: row.indexname,
            definition: row.indexdef
        }));
    }

    async getConstraints(tableName) {
        const result = await this.dbPool.query(SQL_QUERIES.getConstraints, [tableName]);
        return result.rows.map(row => ({
            name: row.constraint_name,
            type: row.constraint_type
        }));
    }

    async getRowCount(tableName) {
        try {
            const result = await this.dbPool.query(SQL_QUERIES.getRowCount, [tableName]);
            return result.rows.length > 0 ? result.rows[0].n_live_tup : 0;
        } catch (error) {
            console.warn(`⚠️  Could not fetch row count for ${tableName}`);
            return 0;
        }
    }

    async grepCodebase(tableName) {
        if (this.grepCache[tableName]) {
            return this.grepCache[tableName];
        }

        const searchPaths = ['backend', 'scripts', 'cron', 'jobs', 'server.js', 'cms', 'councilTerminal', 'psychic-engine'];
        const results = {
            module_reads: [],
            module_writes: [],
            module_references: []
        };

        const safeTable = escapeRegex(tableName);

        const sqlPatterns = [
            { regex: `\\bFROM\\s+${safeTable}\\b`, type: 'read' },
            { regex: `\\bJOIN\\s+${safeTable}\\b`, type: 'read' },
            { regex: `\\bLEFT\\s+JOIN\\s+${safeTable}\\b`, type: 'read' },
            { regex: `\\bINNER\\s+JOIN\\s+${safeTable}\\b`, type: 'read' },
            { regex: `\\bINSERT\\s+INTO\\s+${safeTable}\\b`, type: 'write' },
            { regex: `\\bUPDATE\\s+${safeTable}\\b`, type: 'write' },
            { regex: `\\bDELETE\\s+FROM\\s+${safeTable}\\b`, type: 'write' },
            { regex: `${safeTable}`, type: 'other' }
        ];

        try {
            for (const searchPath of searchPaths) {
                if (!fs.existsSync(searchPath)) continue;

                for (const pattern of sqlPatterns) {
                    try {
                        const { stdout } = await execAsync(
                            `rg -P '${pattern.regex}' ${searchPath} --type js --type mjs -n 2>/dev/null || true`,
                            { maxBuffer: 50 * 1024 * 1024, timeout: 60000 }
                        );

                        if (stdout) {
                            const lines = stdout.split('\n').filter(l => l.trim());
                            for (const line of lines) {
                                const match = line.match(/^([^:]+):(\d+):(.*)/);
                                if (!match) continue;

                                const [, file, lineNum, content] = match;
                                const confidence = (content.includes(`'`) || content.includes(`"`) || content.includes('`')) ? 'high' : 'medium';

                                const entry = {
                                    file: file.replace(/^\.(\/)?/, ''),
                                    line: parseInt(lineNum),
                                    content: content.trim().substring(0, 120),
                                    confidence
                                };

                                if (pattern.type === 'read') {
                                    results.module_reads.push(entry);
                                } else if (pattern.type === 'write') {
                                    results.module_writes.push(entry);
                                } else if (pattern.type === 'other') {
                                    results.module_references.push(entry);
                                }
                            }
                        }
                    } catch (error) {
                    }
                }
            }
        } catch (error) {
            console.warn(`⚠️  Codebase search error for ${tableName}:`, error.message);
        }

        this.grepCache[tableName] = results;
        return results;
    }

    async generateConcept(tableName, index) {
        try {
            const hexId = await generateHexId('database_table_concept');
            const schema = await this.getTableSchema(tableName);
            const modules = await this.grepCodebase(tableName);

            const concept = {
                concept_id: hexId,
                concept_name: tableName,
                type: 'database_table',
                category: 'database_schema',

                metadata: {
                    table_name: tableName,
                    table_schema: 'public',
                    row_count: schema.row_count,
                    row_count_estimated: schema.row_count_estimated,
                    column_count: schema.columns.length,
                    last_audited: new Date().toISOString(),
                    auto_generated: true,
                    needs_curation: true,
                    generation_method: 'system_introspection'
                },

                schema: {
                    columns: schema.columns,
                    primary_key: schema.primary_keys,
                    outbound_foreign_keys: schema.outbound_foreign_keys,
                    inbound_foreign_keys: schema.inbound_foreign_keys,
                    indexes: schema.indexes,
                    constraints: schema.constraints
                },

                dependencies: {
                    table_level: {
                        depends_on: schema.outbound_foreign_keys.map(fk => ({
                            type: 'foreign_key',
                            table: fk.references_table,
                            my_column: fk.column,
                            their_column: fk.references_column,
                            meaning: 'This table depends on referenced table'
                        })),
                        depended_on_by: schema.inbound_foreign_keys.map(ifk => ({
                            type: 'foreign_key',
                            table: ifk.referencing_table,
                            their_column: ifk.referencing_column,
                            my_column: ifk.referenced_column,
                            meaning: 'Other table depends on this table'
                        }))
                    },
                    module_level: {
                        module_reads: modules.module_reads.slice(0, 50),
                        module_writes: modules.module_writes.slice(0, 50),
                        module_references: modules.module_references.slice(0, 20),
                        total_reads: modules.module_reads.length,
                        total_writes: modules.module_writes.length,
                        total_references: modules.module_references.length
                    }
                },

                purpose: `Core data table for ${tableName}. Contains ${schema.row_count} rows across ${schema.columns.length} columns.`,

                audit: {
                    last_audited_by: 'generateSystemConcepts',
                    audit_method: 'automated_introspection',
                    next_audit_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    audit_frequency_days: 7,
                    notes: []
                }
            };

            return concept;
        } catch (error) {
            console.error(`❌ Error generating concept for ${tableName}:`, error.message);
            throw error;
        }
    }

    async generate() {
        try {
            console.log('🚀 Starting system concept generation...\n');
            
            await this.getAllTables();
            console.log(`⏳ Processing ${this.tables.length} tables with optimized queries...\n`);
            
            for (let i = 0; i < this.tables.length; i++) {
                const table = this.tables[i];
                process.stdout.write(`\r  [${String(i + 1).padStart(3, ' ')}/${this.tables.length}] ${table.padEnd(40)}`);
                
                const concept = await this.generateConcept(table, i);
                this.concepts.push(concept);
            }

            console.log('\n\n✅ Generation complete!\n');
            return this.concepts;
        } catch (error) {
            console.error('\n❌ Generation failed:', error.message);
            throw error;
        }
    }

    async saveOutput(concepts) {
        try {
            const outputDir = this.config.output;
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('Z')[0];
            const filename = `system_concepts_${this.config.database}_${timestamp}.json`;
            const filepath = path.join(outputDir, filename);

            const output = {
                generated_at: new Date().toISOString(),
                database: this.config.database,
                total_concepts: concepts.length,
                generation_duration_ms: Date.now() - this.startTime,
                concepts
            };

            fs.writeFileSync(filepath, JSON.stringify(output, null, 2));
            
            const fileSizeMB = (fs.statSync(filepath).size / (1024 * 1024)).toFixed(2);
            console.log(`📁 Output saved to:\n   ${filepath}`);
            console.log(`📊 File size: ${fileSizeMB} MB\n`);
            return filepath;
        } catch (error) {
            console.error('❌ Error saving output:', error.message);
            throw error;
        }
    }

    async cleanup() {
        if (this.dbPool) {
            await this.dbPool.end();
        }
    }
}

function parseArgs() {
    const args = {};
    for (let i = 2; i < process.argv.length; i++) {
        if (process.argv[i].startsWith('--')) {
            const key = process.argv[i].substring(2);
            const value = process.argv[i + 1];
            
            if (value && !value.startsWith('--')) {
                args[key] = value;
                i++;
            } else {
                args[key] = true;
            }
        }
    }
    return args;
}

function validateArgs(args) {
    const required = ['connectionString', 'database'];
    const missing = required.filter(key => !args[key]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required arguments:', missing.join(', '));
        console.error('\nUsage:');
        console.error('  node generateSystemConcepts.js \\');
        console.error('    --connectionString postgresql://user:pass@host:5432/dbname \\');
        console.error('    --database <dbname> \\');
        console.error('    --output ./output\n');
        process.exit(1);
    }
}

async function main() {
    const generator = new SystemConceptGenerator({});
    
    try {
        const args = parseArgs();
        validateArgs(args);

        const config = {
            connectionString: args.connectionString,
            database: args.database,
            output: args.output || './backend/scripts/output'
        };

        Object.assign(generator.config, config);

        await generator.initializePool();
        const concepts = await generator.generate();
        await generator.saveOutput(concepts);

        console.log(`🎉 Success! Generated ${concepts.length} system concepts.`);
        console.log(`⏱️  Total time: ${((Date.now() - generator.startTime) / 1000).toFixed(2)}s\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Fatal error:', error.message);
        process.exit(1);
    } finally {
        await generator.cleanup();
    }
}

main();
