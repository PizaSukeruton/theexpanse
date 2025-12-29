(function (window) {
  let publicSocket = null;
  let terminalSocket = null;
  let terminalConnectErrorCount = 0; // throttle console spam

  function createPublicSocket() {
    if (publicSocket) return publicSocket;

    publicSocket = io('/public', { withCredentials: true });

    publicSocket.on('connect', () => {
      console.log('🟢 Connected to /public:', publicSocket.id);
    });

    publicSocket.on('disconnect', () => {
      console.log('🔴 Disconnected from /public');
    });

    return publicSocket;
  }

  function createTerminalSocket() {
    if (terminalSocket) return terminalSocket;

    terminalSocket = io('/terminal', { withCredentials: true });

    terminalSocket.on('connect', () => {
      // reset error state on successful connect
      terminalConnectErrorCount = 0;
      terminalSocket._unauthorized = false;
      console.log('🟢 Connected to /terminal:', terminalSocket.id);
    });

    terminalSocket.on('connect_error', (err) => {
      terminalConnectErrorCount += 1;

      // Only log the first error in a failure streak
      if (terminalConnectErrorCount === 1) {
        const msg = err && err.message ? err.message : String(err);
        console.warn('⚠️ /terminal connect error:', msg);
      }

      if (err && err.message === 'Unauthorized') {
        terminalSocket._unauthorized = true;
      }
    });

    terminalSocket.on('disconnect', () => {
      console.log('🔴 Disconnected from /terminal');
    });

    return terminalSocket;
  }

  window.SocketManager = {
    getPublicSocket: createPublicSocket,
    getTerminalSocket: createTerminalSocket,
    isTerminalAuthorized: () =>
      !!(
        terminalSocket &&
        !terminalSocket._unauthorized &&
        terminalSocket.connected
      )
  };
})(window);
