/**
 * Patch: Tanuki Activation inside CommandBar.js
 * Injects activation logic without altering other features.
 */

(function() {
    const originalSubmit = window.CommandBar.submitMessage;

    window.CommandBar.submitMessage = async function(message) {
        try {
            if (window.TanukiActivation.shouldActivate(message)) {
                console.log("TanukiEngine activation phrase detected");

                window.TanukiActivation.setTanukiActive(true);

                try {
                    const res = await fetch("/api/tanuki/activate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ activated: true, phrase: message })
                    });
                    console.log("TanukiEngine activation response:", await res.json());
                } catch (err) {
                    console.error("Backend activation failed:", err);
                }

                window.dispatchEvent(new CustomEvent("tanuki-ui-activate"));

                return;
            }

            return originalSubmit.call(window.CommandBar, message);

        } catch (err) {
            console.error("CommandBar Tanuki patch error:", err);
            return originalSubmit.call(window.CommandBar, message);
        }
    };

})();
