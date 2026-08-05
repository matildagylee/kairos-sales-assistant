// Toolbar icon behaviour.
// We handle the action click ourselves (openPanelOnActionClick = false) instead of
// letting Chrome silently toggle the panel. Handling chrome.action.onClicked means
// every click registers as an extension *invocation* on the current tab, which is
// exactly what grants the activeTab permission that tabCapture.getMediaStreamId
// needs to capture the call audio. Opening the panel in the same click keeps the UX
// identical (click icon -> panel opens), but now the capture grant lands reliably.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.id != null) {
    chrome.sidePanel.open({ tabId: tab.id }).catch(() => {});
  }
});
