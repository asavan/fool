function stringToBoolean(string) {
    switch (string.toLowerCase().trim()) {
    case "true": case "yes": case "1": return true;
    case "false": case "no": case "0": case null: return false;
    default: return Boolean(string);
    }
}

export function parseSettings(queryString, settings) {
    const urlParams = new URLSearchParams(queryString);
    const changed = [];
    for (const [key, value] of urlParams) {
        if (typeof settings[key] === "number") {
            settings[key] = parseInt(value, 10);
        } else if (typeof settings[key] === "boolean") {
            settings[key] = stringToBoolean(value);
        } else {
            settings[key] = value;
        }
        changed.push(key);
    }
    return changed;
}

function adjustBots(changed, settings) {
    if (!changed.includes("botCount") && settings.mode === "server") {
        settings.botCount = 0;
    }
}

export function adjustMode(changed, settings, protocol) {
    const keepModes = ["mode", "wh", "seed"];
    for (const keepMode of keepModes) {
        if (changed.includes(keepMode)) {
            adjustBots(changed, settings);
            return;
        }
    }
    if (protocol === "https:") {
        settings.mode = "ai";
    }
    adjustBots(changed, settings);
}

export function adjustNetwork(changed, settings, protocol) {
    const keepModes = ["channelType"];
    for (const keepMode of keepModes) {
        if (changed.includes(keepMode)) {
            return;
        }
    }
    if (protocol === "https:") {
        settings.channelType = "supabase";
    }
    adjustBots(changed, settings);
}
