import { getPageSupport } from "../shared/page-support.js";

export async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}

export async function getActiveTabContext() {
  const tab = await getActiveTab();
  if (!tab) {
    return {
      tabId: null,
      url: "",
      title: "",
      pageSupport: getPageSupport("")
    };
  }

  return {
    tabId: Number.isInteger(tab.id) ? tab.id : null,
    url: tab.url || "",
    title: tab.title || "",
    pageSupport: getPageSupport(tab.url || "")
  };
}

export async function getAllTabIds() {
  const tabs = await chrome.tabs.query({});
  const ids = [];

  for (const tab of tabs) {
    if (Number.isInteger(tab.id)) {
      ids.push(tab.id);
    }
  }

  return ids;
}
