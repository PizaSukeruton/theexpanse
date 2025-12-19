/**
 * Tanuki Activation Layer (Frontend)
 * Detects wake phrases and slash commands.
 * Routes activation events to the command bar and UI.
 */

window.TanukiActivation = (() => {

    let tanukiActive = false;

    const wakePhrases = [
        "hey claude",
        "oi tanuki",
        "oyasumi tanuki",
        "yo tanuki",
        "tanuki-sama",
        "hey raccoon",
        "tanuki mode"
    ];

    function detectWakePhrase(input) {
        const lowered = input.toLowerCase();
        return wakePhrases.some(p => lowered.includes(p));
    }

    function shouldActivate(input) {
        if (!input) return false;
        if (input.startsWith("/tanuki")) return true;
        if (detectWakePhrase(input)) return true;
        return false;
    }

    function setTanukiActive(state) {
        tanukiActive = state;
        window.dispatchEvent(new CustomEvent("tanuki-mode-changed", { detail: { active: state } }));
    }

    function isActive() {
        return tanukiActive;
    }

    return {
        shouldActivate,
        setTanukiActive,
        isActive
    };

})();

commandBar.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const input = e.target.value.toLowerCase().trim();

        const OFF_COMMANDS = [
            "stop tanuki",
            "cancel tanuki",
            "turn off tanuki",
            "tanuki off",
            "claude stop",
            "kill tanuki mode"
        ];

        if (OFF_COMMANDS.includes(input)) {
            window.dispatchEvent(new CustomEvent("tanuki-ui-activate", { detail: { active: false } }));

            fetch("/api/tanuki/deactivate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            });

            console.log("Tanuki Mode: OFF");
        }
    }
});

