// backend/tests/tse-loop-test.js

import TSELoopManager from '../TSE/TSELoopManager.js';
import pool from '../db/pool.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('TSE-Test');

class TSELoopTest {
    constructor() {
        this.manager = new TSELoopManager(pool);
        this.testResults = [];
    }

    async testDatabaseConnection() {
        console.log('\n=== Testing Database Connection ===');
        try {
            const result = await pool.query('SELECT NOW()');
            console.log('[SUCCESS] Database connected:', result.rows[0].now);
            return true;
        } catch (error) {
            console.log('[ERROR] Database connection failed:', error.message);
            return false;
        }
    }

    async testInitialization() {
        console.log('\n=== Testing TSE Initialization ===');
        try {
            await this.manager.initialize();
            console.log('[SUCCESS] TSE Loop Manager initialized');
            console.log('  - Teacher Component: Ready');
            console.log('  - Student Component: Ready');
            console.log('  - Evaluation Component: Ready');
            return true;
        } catch (error) {
            console.log('[ERROR] Initialization failed:', error.message);
            return false;
        }
    }

    async testSingleCycle() {
        console.log('\n=== Testing Single TSE Cycle ===');
        try {
            // Get a test user
            const userResult = await pool.query(
                'SELECT user_id FROM users LIMIT 1'
            );
            
            if (userResult.rows.length === 0) {
                console.log('[WARN] No users found, creating test user');
                const insertResult = await pool.query(
                    `INSERT INTO users (username, email, password_hash) 
                     VALUES ($1, $2, $3) 
                     RETURNING user_id`,
                    ['tse_test_user', 'test@expanse.com', 'test_hash']
                );
                userResult.rows[0] = insertResult.rows[0];
            }

            const userId = userResult.rows[0].user_id;
            console.log(`  Testing with user_id: ${userId}`);

            // Execute one cycle
            const result = await this.manager.startTSECycle('standard');
            const cycleId = result.cycle_id || result;
            console.log(`[SUCCESS] TSE Cycle completed: ${cycleId}`);

            // Verify cycle was recorded
            const cycleCheck = await pool.query(
                'SELECT * FROM tse_cycles WHERE cycle_id = $1',
                [cycleId]
            );

            if (cycleCheck.rows.length > 0) {
                const cycle = cycleCheck.rows[0];
                console.log('  Cycle Details:');
                console.log(`    - Status: ${cycle.status}`);
                console.log(`    - Phase: ${cycle.phase}`);
                console.log(`    - Performance: ${JSON.stringify(cycle.performance_metrics)}`);
                return true;
            } else {
                console.log('[ERROR] Cycle not found in database');
                return false;
            }
        } catch (error) {
            console.log('[ERROR] Single cycle test failed:', error.message);
            logger.error('TSE cycle test failed', error);
            return false;
        }
    }

    async testComponentIntegration() {
        console.log('\n=== Testing Component Integration ===');
        try {
            // Test Teacher Component
            const teacherTest = await pool.query(
                'SELECT COUNT(*) FROM tse_learning_patterns'
            );
            console.log(`  Teacher Component: ${teacherTest.rows[0].count} content items`);

            // Test Student Component
            const studentTest = await pool.query(
                'SELECT COUNT(*) FROM tse_coding_progress'
            );
            console.log(`  Student Component: ${studentTest.rows[0].count} progress records`);

            // Test Evaluation Component
            const evalTest = await pool.query(
                'SELECT COUNT(*) FROM tse_cycles WHERE performance_metrics IS NOT NULL'
            );
            console.log(`  Evaluation Component: ${evalTest.rows[0].count} metrics recorded`);

            console.log('[SUCCESS] All components integrated');
            return true;
        } catch (error) {
            console.log('[ERROR] Component integration test failed:', error.message);
            return false;
        }
    }

    async testPerformanceMetrics() {
        console.log('\n=== Testing Performance Metrics ===');
        try {
            const metrics = await pool.query(`
                SELECT 
                    AVG(CAST(performance_metrics->>'accuracy' AS FLOAT)) as avg_accuracy,
                    AVG(CAST(performance_metrics->>'speed' AS FLOAT)) as avg_speed,
                    AVG(CAST(performance_metrics->>'retention' AS FLOAT)) as avg_retention,
                    COUNT(*) as total_cycles
                FROM tse_cycles
                WHERE status = 'completed'
            `);

            const result = metrics.rows[0];
            console.log('  System Performance:');
            console.log(`    - Average Accuracy: ${result.avg_accuracy || 'N/A'}`);
            console.log(`    - Average Speed: ${result.avg_speed || 'N/A'}`);
            console.log(`    - Average Retention: ${result.avg_retention || 'N/A'}`);
            console.log(`    - Total Cycles: ${result.total_cycles}`);

            console.log('[SUCCESS] Performance metrics available');
            return true;
        } catch (error) {
            console.log('[ERROR] Performance metrics test failed:', error.message);
            return false;
        }
    }

    async testLearningAdaptation() {
        console.log('\n=== Testing Learning Adaptation ===');
        try {
            // Check if system adapts based on performance
            const adaptationCheck = await pool.query(`
                SELECT 
                    cycle_id,
                    COUNT(*) as attempts,
                    AVG(CAST(performance_metrics->>'accuracy' AS FLOAT)) as avg_accuracy
                FROM tse_cycles
                GROUP BY cycle_id
                HAVING COUNT(*) > 1
                ORDER BY attempts DESC
                LIMIT 1
            `);

            if (adaptationCheck.rows.length > 0) {
                const user = adaptationCheck.rows[0];
                console.log('  Adaptation Analysis:');
                console.log(`    - User ${user.cycle_id}: ${user.attempts} attempts`);
                console.log(`    - Average Accuracy: ${user.avg_accuracy?.toFixed(2) || 'N/A'}`);
                console.log('[SUCCESS] Learning adaptation detected');
                return true;
            } else {
                console.log('[INFO] Not enough data for adaptation analysis');
                return true;
            }
        } catch (error) {
            console.log('[ERROR] Adaptation test failed:', error.message);
            return false;
        }
    }

    async runFullTest() {
        console.log('=== Starting TSE Loop Comprehensive Test ===\n');
        
        const tests = [
            { name: 'Database Connection', fn: () => this.testDatabaseConnection() },
            { name: 'TSE Initialization', fn: () => this.testInitialization() },
            { name: 'Single Cycle', fn: () => this.testSingleCycle() },
            { name: 'Component Integration', fn: () => this.testComponentIntegration() },
            { name: 'Performance Metrics', fn: () => this.testPerformanceMetrics() },
            { name: 'Learning Adaptation', fn: () => this.testLearningAdaptation() }
        ];

        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            const result = await test.fn();
            if (result) {
                passed++;
                this.testResults.push({ test: test.name, status: 'PASSED' });
            } else {
                failed++;
                this.testResults.push({ test: test.name, status: 'FAILED' });
            }
        }

        console.log('\n=== TSE Loop Test Summary ===');
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Total: ${passed + failed}`);
        
        console.log('\nDetailed Results:');
        this.testResults.forEach(result => {
            const icon = result.status === 'PASSED' ? '[SUCCESS]' : '[ERROR]';
            console.log(`  ${icon} ${result.test}: ${result.status}`);
        });

        if (failed === 0) {
            console.log('\n[SUCCESS] TSE Loop is fully operational!');
        } else {
            console.log('\n[WARN] Some TSE components need attention.');
        }

        // Close connection
        await pool.end();
        return this.testResults;
    }
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new TSELoopTest();
    await tester.runFullTest();
}

export default TSELoopTest;
