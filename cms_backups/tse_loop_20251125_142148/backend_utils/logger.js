// backend/utils/logger.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ExpanseLogger {
    constructor() {
        this.logLevels = {
            ERROR: { value: 0, color: '\x1b[31m', symbol: 'ERROR' },
            WARN: { value: 1, color: '\x1b[33m', symbol: 'WARN' },
            INFO: { value: 2, color: '\x1b[36m', symbol: 'INFO' },
            DEBUG: { value: 3, color: '\x1b[37m', symbol: 'DEBUG' },
            SUCCESS: { value: 4, color: '\x1b[32m', symbol: 'SUCCESS' }
        };
        
        this.currentLevel = process.env.LOG_LEVEL || 'INFO';
        this.logToFile = process.env.LOG_TO_FILE === 'true';
        this.logDir = path.join(__dirname, '../../logs');
        
        if (this.logToFile && !fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
        
        this.logBuffer = [];
        this.maxBufferSize = 100;
    }

    _getTimestamp() {
        return new Date().toISOString();
    }

    _getHexCode() {
        const hexChars = '0123456789ABCDEF';
        let hex = 'L';
        for (let i = 0; i < 5; i++) {
            hex += hexChars[Math.floor(Math.random() * 16)];
        }
        return hex;
    }

    _formatMessage(level, module, message, data = null) {
        const timestamp = this._getTimestamp();
        const logId = this._getHexCode();
        
        const logEntry = {
            timestamp,
            logId,
            level,
            module,
            message,
            data: data ? this._sanitizeData(data) : null,
            environment: process.env.NODE_ENV || 'development'
        };

        return logEntry;
    }

    _sanitizeData(data) {
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                if (key.toLowerCase().includes('password') || 
                    key.toLowerCase().includes('token') ||
                    key.toLowerCase().includes('secret')) {
                    sanitized[key] = '[REDACTED]';
                } else if (value && typeof value === 'object') {
                    sanitized[key] = this._sanitizeData(value);
                } else {
                    sanitized[key] = value;
                }
            }
            return sanitized;
        }
        return data;
    }

    _shouldLog(level) {
        return this.logLevels[level].value <= this.logLevels[this.currentLevel].value;
    }

    _writeToFile(logEntry) {
        if (!this.logToFile) return;
        
        const date = new Date().toISOString().split('T')[0];
        const filename = `expanse-${date}.log`;
        const filepath = path.join(this.logDir, filename);
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        fs.appendFileSync(filepath, logLine, 'utf8');
    }

    _outputToConsole(level, module, message, data) {
        const levelConfig = this.logLevels[level];
        const reset = '\x1b[0m';
        
        if (process.env.NODE_ENV === 'production') {
            console.log(JSON.stringify(this._formatMessage(level, module, message, data)));
        } else {
            const timestamp = new Date().toLocaleTimeString();
            console.log(
                `[${levelConfig.symbol}] ${levelConfig.color}[${level}]${reset} [${timestamp}] [${module}] ${message}`
            );
            if (data) {
                console.log('  ', this._sanitizeData(data));
            }
        }
    }

    _addToBuffer(logEntry) {
        this.logBuffer.push(logEntry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift();
        }
    }

    log(level, module, message, data = null) {
        if (!this._shouldLog(level)) return;
        
        const logEntry = this._formatMessage(level, module, message, data);
        
        this._addToBuffer(logEntry);
        this._writeToFile(logEntry);
        this._outputToConsole(level, module, message, data);
    }

    error(module, message, error = null) {
        const errorData = error ? {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            code: error.code
        } : null;
        
        this.log('ERROR', module, message, errorData);
    }

    warn(module, message, data = null) {
        this.log('WARN', module, message, data);
    }

    info(module, message, data = null) {
        this.log('INFO', module, message, data);
    }

    debug(module, message, data = null) {
        this.log('DEBUG', module, message, data);
    }

    success(module, message, data = null) {
        this.log('SUCCESS', module, message, data);
    }

    getRecentLogs(count = 50) {
        return this.logBuffer.slice(-count);
    }

    clearBuffer() {
        this.logBuffer = [];
    }

    createModuleLogger(moduleName) {
        return {
            error: (message, error) => this.error(moduleName, message, error),
            warn: (message, data) => this.warn(moduleName, message, data),
            info: (message, data) => this.info(moduleName, message, data),
            debug: (message, data) => this.debug(moduleName, message, data),
            success: (message, data) => this.success(moduleName, message, data)
        };
    }
}

const logger = new ExpanseLogger();

export default logger;
export const createModuleLogger = (moduleName) => logger.createModuleLogger(moduleName);
