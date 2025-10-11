import {assert} from "../utils/assert.js";

export default async function channelChooser(settings) {
    let mode;
    if (settings.channelType === "websocket") {
        mode = await import("./websocket_channel.js");
    } else if (settings.channelType === "supabase") {
        mode = await import("./supabase_channel.js");
    } else if (settings.channelType === "fake") {
        mode = await import("./fake_channel.js");
    } else {
        assert(false, "Unsupported mode");
    }
    return mode.default;
}
