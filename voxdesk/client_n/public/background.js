console.log("Background script loaded");

// eslint-disable-next-line no-undef
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Background script received message:", request);

    try {
        if (request.command === "open_youtube") {
            console.log("Opening YouTube...");
            // eslint-disable-next-line no-undef
            chrome.tabs.create({ url: "https://youtube.com" });
            sendResponse({ success: true });
        } else if (request.command === "open_google") {
            console.log("Opening Google...");
            // eslint-disable-next-line no-undef
            chrome.tabs.create({ url: "https://google.com" });
            sendResponse({ success: true });
        }
    } catch (error) {
        console.error("Error in background script:", error);
        sendResponse({ success: false, error: error.message });
    }

    return true; // Keep the message channel open for sendResponse
});