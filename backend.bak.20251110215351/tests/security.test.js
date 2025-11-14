// backend/tests/security.test.js

import validator from '../utils/validator.js';
import rateLimiter from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';

class SecurityTestSuite {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    assert(condition, testName) {
        if (condition) {
            this.passed++;
            this.results.push({ test: testName, status: 'PASS' });
            console.log(`[SUCCESS] ${testName}`);
        } else {
            this.failed++;
            this.results.push({ test: testName, status: 'FAIL' });
            console.log(`[ERROR] ${testName}`);
        }
    }

    testInputValidation() {
        console.log('\n=== Testing Input Validation ===');
        
        // SQL Injection test
        const sqlPayload = "'; DROP TABLE users; --";
        const sanitized = validator.sanitizeString(sqlPayload);
        this.assert(!sanitized.includes('DROP TABLE'), 'SQL Injection Prevention');
        
        // XSS test
        const xssPayload = "<script>alert('XSS')</script>";
        const cleanXss = validator.sanitizeString(xssPayload);
        this.assert(!cleanXss.includes('<script>'), 'XSS Prevention');
        
        // Hex ID validation
        const validHex = validator.validateHexId('7ABCDE', 'character');
        this.assert(validHex.valid, 'Valid Hex ID Accepted');
        
        const invalidHex = validator.validateHexId('INVALID', 'character');
        this.assert(!invalidHex.valid, 'Invalid Hex ID Rejected');
        
        // Email validation
        const validEmail = validator.validateEmail('test@example.com');
        this.assert(validEmail.valid, 'Valid Email Accepted');
        
        const invalidEmail = validator.validateEmail('not-an-email');
        this.assert(!invalidEmail.valid, 'Invalid Email Rejected');
        
        // Password validation
        const strongPassword = validator.validatePassword('Secure123!Pass');
        this.assert(strongPassword.valid, 'Strong Password Accepted');
        
        const weakPassword = validator.validatePassword('weak');
        this.assert(!weakPassword.valid, 'Weak Password Rejected');
    }

    testRateLimiting() {
        console.log('\n=== Testing Rate Limiting ===');
        
        const testIdentifier = '127.0.0.1-test';
        rateLimiter.reset(testIdentifier);
        
        // Test general rate limit
        let allowed = true;
        for (let i = 0; i < 100; i++) {
            allowed = rateLimiter.checkLimit(testIdentifier, 'general');
        }
        this.assert(allowed, 'Under Rate Limit Allowed');
        
        // Should block after limit
        const blocked = rateLimiter.checkLimit(testIdentifier, 'general');
        this.assert(!blocked, 'Over Rate Limit Blocked');
        
        // Test IP blocking
        this.assert(rateLimiter.isBlocked(testIdentifier), 'IP Blocking Works');
        
        // Reset and verify
        rateLimiter.reset(testIdentifier);
        const afterReset = rateLimiter.checkLimit(testIdentifier, 'general');
        this.assert(afterReset, 'Rate Limit Reset Works');
    }

    testLogging() {
        console.log('\n=== Testing Logging System ===');
        
        // Test log sanitization
        const sensitiveData = {
            username: 'test',
            password: 'secret123',
            token: 'jwt-token'
        };
        
        const logEntry = logger._formatMessage('INFO', 'test', 'Test message', sensitiveData);
        this.assert(logEntry.data.password === '[REDACTED]', 'Password Sanitized');
        this.assert(logEntry.data.token === '[REDACTED]', 'Token Sanitized');
        this.assert(logEntry.data.username === 'test', 'Non-sensitive Data Preserved');
        
        // Test hex log ID generation
        this.assert(/^L[0-9A-F]{5}$/.test(logEntry.logId), 'Hex Log ID Generated');
        
        // Test log levels
        this.assert(logger._shouldLog('ERROR'), 'Error Level Logged');
        this.assert(logger._shouldLog('INFO'), 'Info Level Logged');
    }

    testHexIdGeneration() {
        console.log('\n=== Testing Hex ID Generation ===');
        
        // Test patterns
        const patterns = {
            character: /^7[0-9A-F]{5}$/,
            location: /^C3[0-9A-F]{4}$/,
            narrative: /^C0[0-9A-F]{4}$/
        };
        
        this.assert(patterns.character.test('7ABCDE'), 'Character Hex Pattern Valid');
        this.assert(patterns.location.test('C3ABCD'), 'Location Hex Pattern Valid');
        this.assert(patterns.narrative.test('C0ABCD'), 'Narrative Hex Pattern Valid');
    }

    async runAll() {
        console.log('Starting Security Test Suite...\n');
        
        this.testInputValidation();
        this.testRateLimiting();
        this.testLogging();
        this.testHexIdGeneration();
        
        console.log('\n=== Test Results ===');
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Total: ${this.passed + this.failed}`);
        
        if (this.failed === 0) {
            console.log('\n[SUCCESS] All security tests passed!');
        } else {
            console.log('\n[ERROR] Some tests failed. Review security implementation.');
        }
        
        return this.results;
    }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new SecurityTestSuite();
    await tester.runAll();
}

export default SecurityTestSuite;
