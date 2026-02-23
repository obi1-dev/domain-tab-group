/**
 * 型定義ファイル
 */

/**
 * タブ情報
 */
export interface TabInfo {
  id: number;
  url: string;
  title: string;
  windowId: number;
  index: number;
  groupId: number;
}

/**
 * グループ情報
 */
export interface GroupInfo {
  id: number;
  title: string;
  color: chrome.tabGroups.ColorEnum;
  windowId: number;
  collapsed: boolean;
}

/**
 * ドメイングループ
 */
export interface DomainGroup {
  domain: string;
  groupId: number | null;
  tabIds: number[];
  color: chrome.tabGroups.ColorEnum;
}
