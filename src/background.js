// Toolbar icon behaviour + capture-permission tracking.
//
// We handle the action click ourselves (openPanelOnActionClick = false) instead of
// letting Chrome silently toggle the panel. Handling chrome.action.onClicked means
// every click registers as an extension *invocation* on the current tab, which is
// exactly what grants the activeTab permission that tabCapture.getMediaStreamId
// needs to capture the call audio. Opening the panel in the same click keeps the UX
// identical (click icon -> panel opens), but now the capture grant lands reliably.
//
// We also remember which tabs have been invoked so the side panel can show a clear
// "capture allowed / not allowed yet" status. activeTab is lost when a tab reloads
// or navigates, so we drop the tab from the set on those events.
const invokedTabs = new Set();

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.id != null) {
    invokedTabs.add(tab.id);
    chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
    // Nudge the panel to refresh its permission status (ignored if panel is closed).
    chrome.runtime.sendMessage({ type: "kairos-invoked", tabId: tab.id }).catch(() => {});
  }
});

chrome.tabs.onUpdated.addListener((tabId, info) => {
  // A real reload/navigation revokes activeTab.
  if (info.status === "loading" || info.url) invokedTabs.delete(tabId);
});
chrome.tabs.onRemoved.addListener((tabId) => invokedTabs.delete(tabId));

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === "kairos-is-invoked") {
    sendResponse({ invoked: invokedTabs.has(msg.tabId) });
  }
  return true; // keep the channel open for the sync response above
});
