// Background service worker for Domain Tab Group extension

/**
 * Extract domain from a URL
 */
function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Generate a color for a domain (simple hash-based color generation)
 */
function getDomainColor(domain: string): chrome.tabGroups.ColorEnum {
  const colors: chrome.tabGroups.ColorEnum[] = [
    'grey',
    'blue',
    'red',
    'yellow',
    'green',
    'pink',
    'purple',
    'cyan',
    'orange',
  ];
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Group tabs by domain in the current window
 */
async function groupTabsByDomain(): Promise<void> {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const domainMap = new Map<string, number[]>();

  // Group tab IDs by domain
  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue;

    // Skip chrome:// and extension URLs
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      continue;
    }

    const domain = getDomain(tab.url);
    if (!domainMap.has(domain)) {
      domainMap.set(domain, []);
    }
    domainMap.get(domain)!.push(tab.id);
  }

  // Create groups for each domain with multiple tabs
  for (const [domain, tabIds] of domainMap.entries()) {
    if (tabIds.length < 2) continue; // Skip domains with only one tab

    try {
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: domain,
        color: getDomainColor(domain),
        collapsed: false,
      });
    } catch (error) {
      console.error(`Failed to group tabs for domain ${domain}:`, error);
    }
  }
}

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Domain Tab Group extension installed');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'groupTabs') {
    groupTabsByDomain()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error grouping tabs:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

// Export for testing purposes
export { getDomain, getDomainColor, groupTabsByDomain };
