        switch (intent) {
            case "EDIT_PROFILE":
                if (data && data.entity_type === "PERSON") {
                    window.renderProfileEditor(data);
                } else {
                    this.showError("Editor access denied or entity not found.");
                }
                break;

            case "WHO":
            case "WHAT":
            case "WHERE":
            case "SHOW_IMAGE":
            case "SEARCH":
            case "CAN":
            case "WHEN":
            case "WHY":
            case "HOW":
            case "WHICH":
            case "IS":
                this.showOutput(output, response.image);
                break;

            default:
                if (output) {
                    this.showOutput(output);
                }
                break;
        }
