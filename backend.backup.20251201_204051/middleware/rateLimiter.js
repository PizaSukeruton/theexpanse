// backend/middleware/rateLimiter.js

import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('RateLimiter');

class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.blockedIPs = new Map();
        this.limits = {
            general: { requests: 100, window: 60000 },
            auth: { requests: 5, window: 300000 },
            api: { requests: 30, window: 60000 },
            admin: { requests: 20, window: 60000 },
            websocket: { requests: 50, window: 60000 }
        };
        
        setInterval(() => this.cleanup(), 60000);
    }

    cleanup() {
        const now = Date.now();
        
        for (const [key, data] of this.requests.entries()) {
            const timePassed = now - data.firstRequest;
            if (timePassed > Math.max(...Object.values(this.limits).map(l => l.window))) {
                this.requests.delete(key);
            }
        }
        
        for (const [ip, blockTime] of this.blockedIPs.entries()) {
            if (now > blockTime) {
                this.blockedIPs.delete(ip);
                logger.info('IP unblocked', { ip });
            }
        }
    }

    getClientIdentifier(req) {
        const ip = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   'unknown';
        
        const userId = req.user?.id || 'anonymous';
        return `${ip}-${userId}`;
    }

    isBlocked(identifier) {
        const [ip] = identifier.split('-');
        return this.blockedIPs.has(ip);
    }

    blockIP(identifier, duration = 900000) {
        const [ip] = identifier.split('-');
        const unblockTime = Date.now() + duration;
        this.blockedIPs.set(ip, unblockTime);
        logger.warn('IP blocked for rate limit violation', { 
            ip, 
            duration: duration / 1000 + ' seconds' 
        });
    }

    checkLimit(identifier, type = 'general') {
        if (this.isBlocked(identifier)) {
            return false;
        }

        const limit = this.limits[type];
        const now = Date.now();
        const key = `${identifier}-${type}`;
        
        if (!this.requests.has(key)) {
            this.requests.set(key, {
                count: 1,
                firstRequest: now,
                lastRequest: now
            });
            return true;
        }

        const requestData = this.requests.get(key);
        const timePassed = now - requestData.firstRequest;
        
        if (timePassed > limit.window) {
            this.requests.set(key, {
                count: 1,
                firstRequest: now,
                lastRequest: now
            });
            return true;
        }

        if (requestData.count >= limit.requests) {
            if (requestData.count === limit.requests) {
                this.blockIP(identifier);
            }
            return false;
        }

        requestData.count++;
        requestData.lastRequest = now;
        return true;
    }

    middleware(type = 'general') {
        return (req, res, next) => {
            const identifier = this.getClientIdentifier(req);
            
            if (!this.checkLimit(identifier, type)) {
                const [ip] = identifier.split('-');
                logger.warn('Rate limit exceeded', { 
                    ip, 
                    type, 
                    path: req.path 
                });
                
                return res.status(429).json({
                    success: false,
                    error: 'Too many requests. Please try again later.',
                    retryAfter: this.limits[type].window / 1000
                });
            }
            
            next();
        };
    }

    wsMiddleware(ws, req) {
        const identifier = this.getClientIdentifier(req);
        
        if (!this.checkLimit(identifier, 'websocket')) {
            logger.warn('WebSocket rate limit exceeded', { 
                identifier,
                path: req.url 
            });
            ws.close(1008, 'Rate limit exceeded');
            return false;
        }
        
        return true;
    }

    reset(identifier = null) {
        if (identifier) {
            for (const [key] of this.requests.entries()) {
                if (key.startsWith(identifier)) {
                    this.requests.delete(key);
                }
            }
            const [ip] = identifier.split('-');
            this.blockedIPs.delete(ip);
        } else {
            this.requests.clear();
            this.blockedIPs.clear();
        }
        
        logger.info('Rate limiter reset', { identifier });
    }

    getStatus() {
        return {
            activeRequests: this.requests.size,
            blockedIPs: this.blockedIPs.size,
            limits: this.limits
        };
    }
}

const rateLimiter = new RateLimiter();

export default rateLimiter;
export const authLimiter = rateLimiter.middleware('auth');
export const apiLimiter = rateLimiter.middleware('api');
export const adminLimiter = rateLimiter.middleware('admin');
export const generalLimiter = rateLimiter.middleware('general');
