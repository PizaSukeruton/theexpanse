import { registerUser, verifyEmailAndSetPassword } from '../utils/registrationHandler.js';
import pool from '../db/pool.js';
import rateLimiter from '../middleware/rateLimiter.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('RegistrationSocket');

export function initializeRegistrationSockets(io) {
  io.on('connection', (socket) => {
    const socketIp = socket.handshake.address;
    const userAgent = socket.handshake.headers['user-agent'] || 'unknown';

    logger.info('Registration socket connected', { socketId: socket.id, ip: socketIp });

    socket.on('registration-signup', async (data) => {
      const { email, username } = data;
      
      try {
        const signupIdentifier = socketIp + '-signup';
        if (!rateLimiter.checkLimit(signupIdentifier, 'auth')) {
          logger.warn('Signup rate limit exceeded', { ip: socketIp, email, username });
          return socket.emit('registration-response', {
            success: false,
            message: 'Too many signup attempts. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
          });
        }

        logger.info('Registration attempt', { ip: socketIp, email, username });

        const result = await registerUser(email, username);

        if (result.success) {
          logger.success('Signup successful - verification email sent', { email, username });
          socket.emit('registration-response', {
            success: true,
            message: result.message,
            code: result.code
          });
        } else {
          logger.warn('Signup failed', { email, username, code: result.code, error: result.error });
          socket.emit('registration-response', {
            success: false,
            message: result.error,
            code: result.code
          });
        }
      } catch (error) {
        logger.error('Registration error', error);
        socket.emit('registration-response', {
          success: false,
          message: 'Registration failed',
          code: 'REGISTRATION_FAILED'
        });
      }
    });

    socket.on('registration-verify', async (data) => {
      const { verificationToken, password } = data;

      try {
        if (!verificationToken) {
          logger.warn('Verification attempt with missing token', { ip: socketIp });
          return socket.emit('registration-response', {
            success: false,
            message: 'Verification token is required',
            code: 'VERIFICATION_TOKEN_REQUIRED'
          });
        }

        const verifyIdentifier = socketIp + '-verify';
        if (!rateLimiter.checkLimit(verifyIdentifier, 'auth')) {
          logger.warn('Verification rate limit exceeded', { ip: socketIp, tokenStart: verificationToken.substring(0, 8) });
          return socket.emit('registration-response', {
            success: false,
            message: 'Too many verification attempts. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
          });
        }

        logger.info('Email verification attempt', { ip: socketIp, tokenStart: verificationToken.substring(0, 8) + '...' });

        const result = await verifyEmailAndSetPassword(verificationToken, password);

        if (result.success) {
          logger.success('Email verified - user created', { userId: result.user.user_id, username: result.user.username });
          socket.emit('registration-response', {
            success: true,
            message: result.message,
            code: result.code,
            user: result.user
          });
        } else {
          logger.warn('Verification failed', { code: result.code, error: result.error });
          socket.emit('registration-response', {
            success: false,
            message: result.error,
            code: result.code
          });
        }
      } catch (error) {
        logger.error('Email verification error', error);
        socket.emit('registration-response', {
          success: false,
          message: 'Verification failed',
          code: 'VERIFICATION_FAILED'
        });
      }
    });

    socket.on('check-verification-token', async (payload, ack) => {
      const { verificationToken } = payload;

      try {
        if (!verificationToken) {
          logger.warn('Token check with missing token', { ip: socketIp });
          return ack({ success: false, error: 'Token required', code: 'TOKEN_REQUIRED' });
        }

        const checkIdentifier = socketIp + '-check-token';
        if (!rateLimiter.checkLimit(checkIdentifier, 'auth')) {
          logger.warn('Token check rate limit exceeded', { ip: socketIp });
          return ack({ success: false, error: 'Too many token checks', code: 'RATE_LIMIT_EXCEEDED' });
        }

        logger.debug('Token verification check', { ip: socketIp, tokenStart: verificationToken.substring(0, 8) + '...' });

        const result = await pool.query(
          `SELECT registration_id, email, username 
           FROM pending_registrations 
           WHERE verification_token = $1 
           AND token_expires_at > NOW() 
           AND expires_at > NOW()`,
          [verificationToken]
        );

        if (result.rows.length === 0) {
          logger.warn('Invalid or expired verification token', { ip: socketIp });
          return ack({ success: false, error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
        }

        logger.debug('Token check successful', { email: result.rows[0].email });
        ack({ success: true, code: 'TOKEN_VALID' });
      } catch (error) {
        logger.error('Token check error', error);
        ack({ success: false, error: 'Internal error', code: 'INTERNAL_ERROR' });
      }
    });

    socket.on('disconnect', () => {
      logger.info('Registration socket disconnected', { socketId: socket.id });
    });
  });
}

export default initializeRegistrationSockets;
