/**
 * Gift Wizard Socket Handler
 * Bridges frontend wizard with backend API
 * Enforces user access level on all operations
 */

import * as giftWizardAPI from '../api/gift-wizard-api.js';

export function registerGiftWizardHandlers(io, sessions) {
  io.on('connection', (socket) => {
    
    /**
     * Get available realms for user
     */
    socket.on('gift-wizard:get-realms', async () => {
      const session = sessions.get(socket.id);
      
      if (!session) {
        socket.emit('gift-wizard:error', { error: 'NOT AUTHENTICATED' });
        return;
      }
      
      const result = await giftWizardAPI.getRealms(session.accessLevel);
      socket.emit('gift-wizard:realms', result);
    });
    
    /**
     * Get locations by realm
     */
    socket.on('gift-wizard:get-locations', async (data) => {
      const session = sessions.get(socket.id);
      
      if (!session) {
        socket.emit('gift-wizard:error', { error: 'NOT AUTHENTICATED' });
        return;
      }
      
      const result = await giftWizardAPI.getLocationsByRealm(data.realm, session.accessLevel);
      socket.emit('gift-wizard:locations', result);
    });
    
    /**
     * Get characters by realm
     */
    socket.on('gift-wizard:get-characters', async (data) => {
      const session = sessions.get(socket.id);
      
      if (!session) {
        socket.emit('gift-wizard:error', { error: 'NOT AUTHENTICATED' });
        return;
      }
      
      const result = await giftWizardAPI.getCharactersByRealm(data.realm, session.accessLevel);
      socket.emit('gift-wizard:characters', result);
    });
    
    /**
     * Get story arcs by realm
     */
    socket.on('gift-wizard:get-story-arcs', async (data) => {
      const session = sessions.get(socket.id);
      
      if (!session) {
        socket.emit('gift-wizard:error', { error: 'NOT AUTHENTICATED' });
        return;
      }
      
      const result = await giftWizardAPI.getStoryArcsByRealm(data.realm, session.accessLevel);
      socket.emit('gift-wizard:story-arcs', result);
    });
    
    /**
     * Create gift exchange event
     */
    socket.on('gift-wizard:create-event', async (data) => {
      const session = sessions.get(socket.id);
      
      if (!session) {
        socket.emit('gift-wizard:error', { error: 'NOT AUTHENTICATED' });
        return;
      }
      
      // Set access_level from user's session
      data.access_level = session.accessLevel;
      
      const result = await giftWizardAPI.createGiftExchangeEvent(data, session.accessLevel);
      
      if (result.success) {
        socket.emit('gift-wizard:event-created', result);
      } else {
        socket.emit('gift-wizard:error', result);
      }
    });
  });
}

export default { registerGiftWizardHandlers };
