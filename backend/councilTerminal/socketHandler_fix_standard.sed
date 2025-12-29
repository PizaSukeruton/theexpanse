/if \(modeResult.mode === "tanuki"\)/,/} else {/{
    /STANDARD mode/ d
}

/} else if \(modeResult.mode === "tanuki"\) {/a\
        } else if (modeResult.mode === "STANDARD" || modeResult.mode === "standard") {\
          console.log("[Socket] STANDARD mode. Calling Intent Matcher...");\
          const intentResult = await cotwIntentMatcher.matchIntent(\
            modeResult.cleanCommand,\
            session.context,\
            { userid: session.id, username: session.username, access_level: session.access_level }\
          );\
          console.log("[Socket] Intent Matcher Output:", intentResult);\
          response = await runStandardQuery(intentResult, session, modeResult.cleanCommand);\
          socket.emit("command-response", response);\
          return;
}
