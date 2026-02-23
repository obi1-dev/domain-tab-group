import { DomainExtractor } from './DomainExtractor';
import { ColorManager } from './ColorManager';
import { GroupInfo } from '../types';

/**
 * タブグループマネージャークラス
 * タブのグループ化を管理する責務を持つ
 */
export class TabGroupManager {
  /**
   * すべてのタブをドメインごとにグループ化
   * @param windowId - ウィンドウID（省略時は全ウィンドウ）
   */
  async groupTabsByDomain(windowId?: number): Promise<void> {
    try {
      const query: chrome.tabs.QueryInfo = windowId ? { windowId } : {};
      const tabs = await chrome.tabs.query(query);

      // ドメインごとにタブをグループ化
      const domainMap = new Map<string, chrome.tabs.Tab[]>();

      for (const tab of tabs) {
        // ピン留めタブやID/URLがないタブはスキップ
        if (!tab.id || !tab.url || tab.pinned) {
          continue;
        }

        const domain = DomainExtractor.extractDomain(tab.url);
        if (!domainMap.has(domain)) {
          domainMap.set(domain, []);
        }
        domainMap.get(domain)!.push(tab);
      }

      // 各ドメインのタブをグループ化
      for (const [domain, domainTabs] of domainMap.entries()) {
        // 1つのタブのみの場合はグループ化しない
        if (domainTabs.length < 2) {
          continue;
        }

        try {
          await this.createGroupForDomain(domain, domainTabs);
        } catch (error) {
          console.error(`Failed to group tabs for domain ${domain}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to group tabs by domain:', error);
    }
  }

  /**
   * 新規タブを適切なグループに追加
   * @param tab - 追加するタブ
   */
  async handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
    // URLが確定していない場合はスキップ（onUpdatedで処理）
    if (!tab.url || tab.url === 'chrome://newtab/' || !tab.id || tab.pinned) {
      return;
    }

    try {
      const domain = DomainExtractor.extractDomain(tab.url);
      const groupId = await this.getOrCreateGroup(domain, tab.windowId);

      if (groupId !== null && tab.groupId !== groupId) {
        await chrome.tabs.group({ groupId, tabIds: [tab.id] });
      }
    } catch (error) {
      console.error(`Failed to handle tab created (${tab.id}):`, error);
    }
  }

  /**
   * タブのURL変更時に適切なグループに移動
   * @param tabId - タブID
   * @param changeInfo - 変更情報
   * @param tab - タブ情報
   */
  async handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): Promise<void> {
    // URL変更時のみ処理
    if (!changeInfo.url || !tab.url || tab.pinned) {
      return;
    }

    try {
      const domain = DomainExtractor.extractDomain(tab.url);
      const groupId = await this.getOrCreateGroup(domain, tab.windowId);

      if (groupId !== null && tab.groupId !== groupId) {
        await chrome.tabs.group({ groupId, tabIds: [tabId] });
      }
    } catch (error) {
      console.error(`Failed to handle tab updated (${tabId}):`, error);
    }
  }

  /**
   * 指定ドメインのグループを取得または作成
   * @param domain - ドメイン名
   * @param windowId - ウィンドウID
   * @returns グループID（グループが不要な場合はnull）
   */
  private async getOrCreateGroup(domain: string, windowId: number): Promise<number | null> {
    // 既存のグループを検索（キャッシュではなく実際のグループから検索）
    const groups = await chrome.tabGroups.query({ windowId });
    const existingGroup = groups.find((g) => g.title === domain);

    if (existingGroup) {
      return existingGroup.id;
    }

    // このドメインのタブが他にあるか確認
    const tabs = await chrome.tabs.query({ windowId });
    const sameDomainTabs = tabs.filter(
      (t) => t.url && !t.pinned && DomainExtractor.extractDomain(t.url) === domain
    );

    // 1つのタブのみの場合はグループ化しない
    if (sameDomainTabs.length < 2) {
      return null;
    }

    // 既存グループの情報を取得（グループ作成前に取得）
    const existingGroups = await this.getExistingGroups(windowId);
    const color = ColorManager.assignColor(domain, existingGroups);

    // 新規グループを作成
    const tabIds = sameDomainTabs.filter((t) => t.id).map((t) => t.id!);
    const groupId = await chrome.tabs.group({
      tabIds,
      createProperties: {
        windowId,
      },
    });

    // グループのタイトルと色を即座に設定
    await chrome.tabGroups.update(groupId, {
      title: domain,
      color: color,
      collapsed: false,
    });

    return groupId;
  }

  /**
   * ドメインのタブをグループ化
   * @param domain - ドメイン名
   * @param tabs - タブのリスト
   */
  private async createGroupForDomain(domain: string, tabs: chrome.tabs.Tab[]): Promise<void> {
    const tabIds = tabs.filter((t) => t.id).map((t) => t.id!);
    if (tabIds.length === 0) {
      return;
    }

    // 既存グループの情報を取得（グループ作成前に取得）
    const windowId = tabs[0].windowId;
    const existingGroups = await this.getExistingGroups(windowId);
    const color = ColorManager.assignColor(domain, existingGroups);

    // グループを作成し、即座にタイトルと色を設定
    const groupId = await chrome.tabs.group({
      tabIds,
      createProperties: {
        windowId,
      },
    });

    // グループのタイトルと色を即座に設定
    await chrome.tabGroups.update(groupId, {
      title: domain,
      color: color,
      collapsed: false,
    });
  }

  /**
   * 既存のグループ情報を取得
   * @param windowId - ウィンドウID
   * @returns グループ情報のリスト
   */
  private async getExistingGroups(windowId: number): Promise<GroupInfo[]> {
    const groups = await chrome.tabGroups.query({ windowId });
    return groups.map((g) => ({
      id: g.id,
      title: g.title || '',
      color: g.color,
      windowId: g.windowId,
      collapsed: g.collapsed,
    }));
  }
}
