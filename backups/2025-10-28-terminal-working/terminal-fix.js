// Fix the login state to switch to Terminal after authentication
document.addEventListener('DOMContentLoaded', function() {
  // Wait for original script to load
  setTimeout(() => {
    const originalHandleUsername = window.handleUsername;
    
    window.handleUsername = function(value) {
      if (loginState === "command") {
        // We're in command mode - don't treat as login anymore
        addLine("> " + value);
        
        // Check for "who is" command first
        const lower = value.toLowerCase().trim();
        if (lower.startsWith("who is")) {
          const name = lower.replace("who is", "").trim().replace(/\?/g, "");
          if (name === "piza sukeruton") {
            addLine("SYSTEM: Opening dossier for " + name + "...");
            document.getElementById('dossier-cover').classList.add('open');
            populateDossier();
            
            setTimeout(() => {
              document.getElementById('chat-input').placeholder = "> Query Terminal";
              addLine("TERMINAL: CTI-1985 ONLINE");
              addLine("TERMINAL: Archive of Knowledge ready");
            }, 2500);
          }
        } else {
          // Send to Terminal API
          queryTerminal(value);
        }
        
        input.value = "";
      } else {
        // Use original handler for username/password
        originalHandleUsername(value);
      }
    };
    
    // New Terminal query function
    window.queryTerminal = async function(query) {
      try {
        const response = await fetch('/api/terminal/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: query })
        });
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          addLine("TERMINAL: " + data.data.length + " entries found");
          data.data.forEach(entry => {
            addLine("─────────────────────");
            addLine("[" + entry.id + "] " + entry.question, "granted");
            addLine(">>> " + entry.answer);
          });
          
          if (data.message) {
            addLine("─────────────────────");
            addLine("TERMINAL: " + data.message, "granted");
          }
        } else {
          addLine("TERMINAL: No data found");
        }
      } catch (err) {
        addLine("ERROR: Terminal offline", "error");
      }
    };
  }, 100);
});
