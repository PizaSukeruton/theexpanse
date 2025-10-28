// Terminal Integration for CTI-1985 Interface
(function() {
  let chatEnabled = false;
  
  // Override handleCommand to use the Terminal API
  window.handleCommand = async function(cmd) {
    const lower = cmd.toLowerCase().trim();
    
    if (lower.startsWith("who is")) {
      const name = lower.replace("who is", "").trim().replace(/\?/g, "");
      if (name === "piza sukeruton") {
        addLine("SYSTEM: Opening dossier for " + name + "...");
        document.getElementById('dossier-cover').classList.add('open');
        populateDossier();
        
        // Enable Terminal mode after dossier opens
        setTimeout(() => {
          chatEnabled = true;
          document.getElementById('chat-input').placeholder = "> Query Archive of Knowledge";
          addLine("TERMINAL: CTI-1985 ONLINE");
          addLine("TERMINAL: Archive of Knowledge access granted");
          addLine("TERMINAL: Enter your query...");
        }, 2500);
      } else {
        addLine("SYSTEM: No record found for " + name);
      }
    } else if (chatEnabled) {
      // Query the Terminal Core
      addLine("QUERY: " + cmd);
      
      try {
        const response = await fetch('/api/terminal/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            question: cmd
          })
        });
        
        const data = await response.json();
        
        if (data.error) {
          addLine("ERROR: " + data.error, "error");
        } else if (data.data && data.data.length > 0) {
          addLine("TERMINAL: Found " + data.data.length + " entries:");
          
          data.data.forEach((entry, idx) => {
            setTimeout(() => {
              addLine("═══════════════════════════════", "divider");
              addLine("[" + entry.id + "] " + entry.question, "granted");
              addLine(">>> " + entry.answer);
            }, idx * 200);
          });
          
          if (data.message) {
            setTimeout(() => {
              addLine("─────────────────────────", "divider");
              addLine("TERMINAL: " + data.message, "granted");
            }, data.data.length * 200 + 100);
          }
        } else {
          addLine("TERMINAL: No data found in Archive");
        }
      } catch (err) {
        console.error('Terminal error:', err);
        addLine("ERROR: Terminal connection failed", "error");
      }
    } else {
      addLine("SYSTEM: Authenticate first with 'who is piza sukeruton'");
    }
  };
})();
