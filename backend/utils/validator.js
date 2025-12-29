// backend/utils/validator.js

import { createModuleLogger } from './logger.js';

const logger = createModuleLogger('Validator');

class InputValidator {
    constructor() {
        this.hexPatterns = {
            character: /^7[0-9A-F]{5}$/,
            location: /^C3[0-9A-F]{4}$/,
            narrative: /^C0[0-9A-F]{4}$/,
            asset: /^A[0-9A-F]{5}$/,
            evaluation: /^E[0-9A-F]{5}$/,
            log: /^L[0-9A-F]{5}$/,
            tse: /^TSE[0-9A-F]{3}$/
        };

        this.sqlInjectionPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/gi,
            /(--|#|\/\*|\*\/)/g,
            /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
            /('|(\')|"|(\"))\s*;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/gi
        ];

        this.xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<img[^>]*onerror=/gi
        ];
    }

    validateHexId(id, type) {
        if (!id || typeof id !== 'string') {
            return { valid: false, error: 'Invalid hex ID format' };
        }

        const pattern = this.hexPatterns[type];
        if (!pattern) {
            return { valid: false, error: `Unknown hex type: ${type}` };
        }

        if (!pattern.test(id)) {
            return { valid: false, error: `Invalid ${type} hex ID format` };
        }

        return { valid: true };
    }

    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return { valid: false, error: 'Email required' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { valid: false, error: 'Invalid email format' };
        }

        if (email.length > 255) {
            return { valid: false, error: 'Email too long' };
        }

        return { valid: true };
    }

    validateUsername(username) {
        if (!username || typeof username !== 'string') {
            return { valid: false, error: 'Username required' };
        }

        if (username.length < 3 || username.length > 50) {
            return { valid: false, error: 'Username must be 3-50 characters' };
        }

        const usernameRegex = /^[a-zA-Z0-9_\-\. ]+$/;
        if (!usernameRegex.test(username)) {
            return { valid: false, error: 'Username contains invalid characters' };
        }

        return { valid: true };
    }

    validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, error: 'Password required' };
        }

        if (password.length < 8) {
            return { valid: false, error: 'Password must be at least 8 characters' };
        }

        if (password.length > 128) {
            return { valid: false, error: 'Password too long' };
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
            return { 
                valid: false, 
                error: 'Password must contain uppercase, lowercase, number, and special character' 
            };
        }

        return { valid: true };
    }

    sanitizeString(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            return '';
        }

        let sanitized = input.substring(0, maxLength);
        
        sanitized = sanitized.replace(/[<>]/g, match => {
            return match === '<' ? '&lt;' : '&gt;';
        });

        for (const pattern of this.sqlInjectionPatterns) {
            if (pattern.test(sanitized)) {
                logger.warn('SQL injection attempt detected', { input: input.substring(0, 50) });
                sanitized = sanitized.replace(pattern, '');
            }
        }

        for (const pattern of this.xssPatterns) {
            if (pattern.test(sanitized)) {
                logger.warn('XSS attempt detected', { input: input.substring(0, 50) });
                sanitized = sanitized.replace(pattern, '');
            }
        }

        return sanitized.trim();
    }

    validateInteger(value, min = null, max = null) {
        const num = parseInt(value, 10);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Must be a valid integer' };
        }

        if (min !== null && num < min) {
            return { valid: false, error: `Must be at least ${min}` };
        }

        if (max !== null && num > max) {
            return { valid: false, error: `Must be at most ${max}` };
        }

        return { valid: true, value: num };
    }

    validateFloat(value, min = null, max = null) {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return { valid: false, error: 'Must be a valid number' };
        }

        if (min !== null && num < min) {
            return { valid: false, error: `Must be at least ${min}` };
        }

        if (max !== null && num > max) {
            return { valid: false, error: `Must be at most ${max}` };
        }

        return { valid: true, value: num };
    }

    validateJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            return { valid: true, value: parsed };
        } catch (error) {
            return { valid: false, error: 'Invalid JSON format' };
        }
    }

    validateDate(dateString) {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date format' };
        }

        return { valid: true, value: date };
    }

    validateArrayLength(array, minLength = 0, maxLength = 100) {
        if (!Array.isArray(array)) {
            return { valid: false, error: 'Must be an array' };
        }

        if (array.length < minLength) {
            return { valid: false, error: `Array must have at least ${minLength} items` };
        }

        if (array.length > maxLength) {
            return { valid: false, error: `Array must have at most ${maxLength} items` };
        }

        return { valid: true };
    }

    validateExpanseEntity(entity) {
        const errors = [];
        
        if (entity.name) {
            const name = this.sanitizeString(entity.name, 100);
            if (name.length < 2) {
                errors.push('Name too short');
            }
            entity.name = name;
        }

        if (entity.description) {
            entity.description = this.sanitizeString(entity.description, 5000);
        }

        if (entity.hex_id) {
            const hexValidation = this.validateHexId(entity.hex_id, entity.type || 'character');
            if (!hexValidation.valid) {
                errors.push(hexValidation.error);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            sanitized: entity
        };
    }

    middleware(rules) {
        return (req, res, next) => {
            const errors = {};
            
            for (const [field, rule] of Object.entries(rules)) {
                const value = req.body[field] || req.params[field] || req.query[field];
                
                if (rule.required && !value) {
                    errors[field] = `${field} is required`;
                    continue;
                }

                if (!value && !rule.required) {
                    continue;
                }

                let validation = { valid: true };
                
                switch (rule.type) {
                    case 'email':
                        validation = this.validateEmail(value);
                        break;
                    case 'username':
                        validation = this.validateUsername(value);
                        break;
                    case 'password':
                        validation = this.validatePassword(value);
                        break;
                    case 'hex':
                        validation = this.validateHexId(value, rule.hexType);
                        break;
                    case 'integer':
                        validation = this.validateInteger(value, rule.min, rule.max);
                        if (validation.valid) {
                            req.body[field] = validation.value;
                        }
                        break;
                    case 'float':
                        validation = this.validateFloat(value, rule.min, rule.max);
                        if (validation.valid) {
                            req.body[field] = validation.value;
                        }
                        break;
                    case 'string':
                        req.body[field] = this.sanitizeString(value, rule.maxLength);
                        break;
                    case 'json':
                        validation = this.validateJSON(value);
                        if (validation.valid) {
                            req.body[field] = validation.value;
                        }
                        break;
                    case 'date':
                        validation = this.validateDate(value);
                        if (validation.valid) {
                            req.body[field] = validation.value;
                        }
                        break;
                }

                if (!validation.valid) {
                    errors[field] = validation.error;
                }
            }

            if (Object.keys(errors).length > 0) {
                logger.warn('Validation failed', { errors, ip: req.ip });
                return res.status(400).json({
                    success: false,
                    errors
                });
            }

            next();
        };
    }
}

const validator = new InputValidator();

export default validator;
export const validate = validator.middleware.bind(validator);
