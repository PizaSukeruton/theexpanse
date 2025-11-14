import { registerUser, verifyEmailAndSetPassword, verifyEmail } from '../utils/registrationHandler.js';

export function initializeRegistrationSockets(io) {
  io.on('connection', (socket) => {
    console.log(`🟢 Registration socket connected: ${socket.id}`);

    socket.on('registration-signup', async (data) => {
      const { email, username, password } = data;
      const ipAddress = socket.handshake.address;
      const userAgent = socket.handshake.headers['user-agent'];

      console.log(`Registration attempt: ${username} (${email})`);

      try {
        const result = await registerUser(email, username, password);

        if (result.success) {
          socket.emit('registration-response', {
            success: true,
            message: 'Verification email sent. Check your inbox.'
          });
        } else {
          socket.emit('registration-response', {
            success: false,
            message: result.error
          });
        }
      } catch (error) {
        console.error('Registration error:', error);
        socket.emit('registration-response', {
          success: false,
          message: 'Registration failed'
        });
      }
    });

    socket.on('registration-verify', async (data) => {
      const { verificationToken, password } = data;
      const ipAddress = socket.handshake.address;
      const userAgent = socket.handshake.headers['user-agent'];

      console.log(`Email verification attempt with token: ${verificationToken.substring(0, 8)}...`);

      try {
        const result = await verifyEmailAndSetPassword(verificationToken, password);

        if (result.success) {
          socket.emit('registration-response', {
            success: true,
            message: 'Email verified. Awaiting admin approval.',
            user: result.user
          });
        } else {
          socket.emit('registration-response', {
            success: false,
            message: result.error
          });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        socket.emit('registration-response', {
          success: false,
          message: 'Verification failed'
        });
      }
    });

    socket.on('email-verification', async (data) => {
      const { verificationToken } = data;

      console.log(`Email verification attempt with token: ${verificationToken.substring(0, 8)}...`);

      try {
        const result = await verifyEmail(verificationToken);

        if (result.success) {
          socket.emit('registration-response', {
            success: true,
            message: result.message,
            user: result.user
          });
        } else {
          socket.emit('registration-response', {
            success: false,
            message: result.error
          });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        socket.emit('registration-response', {
          success: false,
          message: 'Verification failed'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Registration socket disconnected: ${socket.id}`);
    });
  });
}

export default initializeRegistrationSockets;
