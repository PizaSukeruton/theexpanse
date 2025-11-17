(function (window) {
  let publicSocket = null, terminalSocket = null;

  function createPublicSocket() {
    if (publicSocket) return publicSocket;
    publicSocket = io('/public', { withCredentials: true });
    publicSocket.on('connect', () => console.log('🟢 Connected to /public:', publicSocket.id));
    publicSocket.on('disconnect', () => console.log('🔴 Disconnected from /public'));
    return publicSocket;
  }

  function createTerminalSocket() {
    if (terminalSocket) return terminalSocket;
    terminalSocket = io('/terminal', { withCredentials: true });
    terminalSocket.on('connect', () => console.log('🟢 Connected to /terminal:', terminalSocket.id));
    terminalSocket.on('connect_error', (err) => {
      console.warn('⚠️ /terminal connect error:', err.message);
      if (err.message === 'Unauthorized') terminalSocket._unauthorized = true;
    });
    terminalSocket.on('disconnect', () => console.log('🔴 Disconnected from /terminal'));
    return terminalSocket;
  }

  window.SocketManager = {
    getPublicSocket: createPublicSocket,
    getTerminalSocket: createTerminalSocket,
    isTerminalAuthorized: () =>
      !!(terminalSocket && !terminalSocket._unauthorized && terminalSocket.connected)
  };
})(window);
