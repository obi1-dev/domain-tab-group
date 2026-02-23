/**
 * Domain Tab Group Chrome Extension
 * Service Worker (Background Script)
 *
 * タブをドメインごとに自動グループ化するバックグラウンドスクリプト
 */

import { TabGroupManager } from './managers/TabGroupManager';

// タブグループマネージャーのインスタンス
const tabGroupManager = new TabGroupManager();

/**
 * 拡張機能インストール/更新時の処理
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Domain Tab Group extension installed/updated');

  if (details.reason === 'install' || details.reason === 'update') {
    // 全タブをグループ化
    await tabGroupManager.groupTabsByDomain();
  }
});

/**
 * ブラウザ起動時の処理
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started, grouping tabs');
  await tabGroupManager.groupTabsByDomain();
});

/**
 * 新規タブ作成時の処理
 */
chrome.tabs.onCreated.addListener(async (tab) => {
  await tabGroupManager.handleTabCreated(tab);
});

/**
 * タブ更新時の処理（URL変更を監視）
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await tabGroupManager.handleTabUpdated(tabId, changeInfo, tab);
});

/**
 * ポップアップからのメッセージを処理
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'groupTabs') {
    tabGroupManager
      .groupTabsByDomain()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error grouping tabs:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 非同期レスポンスを返すため
  }
});
