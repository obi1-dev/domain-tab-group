# システム設計書

## 1. システム概要

### 1.1 システム名
Domain Tab Group Chrome Extension

### 1.2 システムの目的
ブラウザのタブをドメインごとに自動的にグループ化し、ユーザーのタブ管理を支援するChrome拡張機能を提供する。

### 1.3 アーキテクチャ概要
Chrome Manifest V3に準拠したService Worker型の拡張機能として実装する。

## 2. システムアーキテクチャ

### 2.1 全体構成図

```
┌─────────────────────────────────────────────────┐
│           Chrome Browser                        │
│                                                 │
│  ┌──────────────┐         ┌─────────────────┐  │
│  │   Tabs       │◄────────│  Tab Groups     │  │
│  │              │         │                 │  │
│  └──────┬───────┘         └────────▲────────┘  │
│         │                          │           │
│         │ Event                    │ API Call  │
│         │                          │           │
│  ┌──────▼──────────────────────────┴────────┐  │
│  │      Service Worker                      │  │
│  │  (Background Script)                     │  │
│  │                                          │  │
│  │  ┌────────────────────────────────────┐ │  │
│  │  │  TabGroupManager                   │ │  │
│  │  │  - groupTabsByDomain()             │ │  │
│  │  │  - handleTabCreated()              │ │  │
│  │  │  - handleTabUpdated()              │ │  │
│  │  └────────────────────────────────────┘ │  │
│  │                                          │  │
│  │  ┌────────────────────────────────────┐ │  │
│  │  │  DomainExtractor                   │ │  │
│  │  │  - extractDomain(url)              │ │  │
│  │  └────────────────────────────────────┘ │  │
│  │                                          │  │
│  │  ┌────────────────────────────────────┐ │  │
│  │  │  ColorManager                      │ │  │
│  │  │  - assignColor(domain)             │ │  │
│  │  └────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Popup UI (Optional)                     │  │
│  │  - Group List View                       │  │
│  │  - Statistics View                       │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 2.2 コンポーネント構成

#### 2.2.1 Service Worker（background.ts）
- **役割**: 拡張機能のコア処理を担当
- **責務**:
  - タブイベントの監視
  - タブグループ化ロジックの実行
  - Chrome APIとの連携
- **ライフサイクル**: Chrome起動時に自動起動、アイドル時は停止

#### 2.2.2 TabGroupManager
- **役割**: タブグループの管理を担当
- **責務**:
  - ドメインごとにタブをグループ化
  - グループの作成、更新、削除
  - グループへのタブの追加、移動
- **主要メソッド**:
  - `groupTabsByDomain()`: 全タブをドメインでグループ化
  - `handleTabCreated(tab)`: 新規タブをグループに追加
  - `handleTabUpdated(tabId, changeInfo, tab)`: タブURL変更時の処理

#### 2.2.3 DomainExtractor
- **役割**: URLからドメインを抽出
- **責務**:
  - URLのパース
  - ドメイン名の正規化
  - 特殊URL（chrome://, about:等）の処理
- **主要メソッド**:
  - `extractDomain(url)`: URLからドメインを抽出

#### 2.2.4 ColorManager
- **役割**: グループの色管理
- **責務**:
  - ドメインに対する色の割り当て
  - 色の一貫性の保持
  - 隣接グループの色の重複回避
- **主要メソッド**:
  - `assignColor(domain, existingGroups)`: ドメインに色を割り当て

#### 2.2.5 Popup UI（popup.ts, popup.html）（オプション）
- **役割**: ユーザーインターフェースの提供
- **責務**:
  - グループ一覧の表示
  - 統計情報の表示
  - 手動操作の受付
- **表示タイミング**: 拡張機能アイコンクリック時

## 3. データモデル

### 3.1 主要データ構造

#### TabInfo
```typescript
interface TabInfo {
  id: number;
  url: string;
  title: string;
  windowId: number;
  index: number;
  groupId: number;
}
```

#### GroupInfo
```typescript
interface GroupInfo {
  id: number;
  title: string;
  color: chrome.tabGroups.Color;
  windowId: number;
  collapsed: boolean;
}
```

#### DomainGroup
```typescript
interface DomainGroup {
  domain: string;
  groupId: number | null;
  tabIds: number[];
  color: chrome.tabGroups.Color;
}
```

### 3.2 データフロー

```
[Tab Event]
    ↓
[Service Worker: Event Listener]
    ↓
[DomainExtractor: Extract Domain]
    ↓
[TabGroupManager: Find or Create Group]
    ↓
[ColorManager: Assign Color if New Group]
    ↓
[Chrome Tab Groups API: Update Groups]
    ↓
[Browser: Display Grouped Tabs]
```

## 4. API設計

### 4.1 Chrome API使用一覧

#### chrome.tabs
- `chrome.tabs.query()`: タブの検索・取得
- `chrome.tabs.onCreated`: タブ作成イベントの監視
- `chrome.tabs.onUpdated`: タブ更新イベントの監視
- `chrome.tabs.onRemoved`: タブ削除イベントの監視
- `chrome.tabs.group()`: タブをグループに追加

#### chrome.tabGroups
- `chrome.tabGroups.query()`: グループの検索・取得
- `chrome.tabGroups.update()`: グループ情報の更新
- `chrome.tabGroups.onCreated`: グループ作成イベントの監視
- `chrome.tabGroups.onUpdated`: グループ更新イベントの監視
- `chrome.tabGroups.onRemoved`: グループ削除イベントの監視

#### chrome.runtime
- `chrome.runtime.onInstalled`: インストール時の初期化
- `chrome.runtime.onStartup`: ブラウザ起動時の初期化

### 4.2 内部API設計

#### TabGroupManager API
```typescript
class TabGroupManager {
  /**
   * すべてのタブをドメインごとにグループ化
   */
  async groupTabsByDomain(windowId?: number): Promise<void>;

  /**
   * 新規タブを適切なグループに追加
   */
  async handleTabCreated(tab: chrome.tabs.Tab): Promise<void>;

  /**
   * タブのURL変更時に適切なグループに移動
   */
  async handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ): Promise<void>;

  /**
   * 指定ドメインのグループを取得または作成
   */
  private async getOrCreateGroup(
    domain: string,
    windowId: number
  ): Promise<number>;
}
```

#### DomainExtractor API
```typescript
class DomainExtractor {
  /**
   * URLからドメインを抽出
   * @param url - 抽出元URL
   * @returns ドメイン名（取得できない場合は"other"）
   */
  static extractDomain(url: string): string;

  /**
   * URLが有効かチェック
   */
  private static isValidUrl(url: string): boolean;

  /**
   * 特殊URL（chrome://, about:等）かチェック
   */
  private static isSpecialUrl(url: string): boolean;
}
```

#### ColorManager API
```typescript
class ColorManager {
  /**
   * ドメインに色を割り当て
   * @param domain - ドメイン名
   * @param existingGroups - 既存のグループ情報
   * @returns 割り当てられた色
   */
  static assignColor(
    domain: string,
    existingGroups: GroupInfo[]
  ): chrome.tabGroups.Color;

  /**
   * 使用可能な色のリストを取得
   */
  private static getAvailableColors(): chrome.tabGroups.Color[];

  /**
   * ドメインから決定論的に色を選択
   */
  private static hashDomainToColor(domain: string): chrome.tabGroups.Color;
}
```

## 5. 処理フロー

### 5.1 初期化フロー

```
[Extension Install/Enable]
    ↓
[runtime.onInstalled Event]
    ↓
[Get All Tabs: chrome.tabs.query()]
    ↓
[Group Tabs by Domain]
    ↓
For Each Domain:
    ↓
    [Create Group: chrome.tabs.group()]
    ↓
    [Set Group Title & Color: chrome.tabGroups.update()]
    ↓
[Complete Initialization]
```

### 5.2 新規タブ作成フロー

```
[User Opens New Tab]
    ↓
[tabs.onCreated Event]
    ↓
[Extract Domain from URL]
    ↓
[Check if Domain Group Exists]
    ├─ Yes → [Add Tab to Existing Group]
    └─ No → [Create New Group]
               ↓
           [Assign Color to Group]
               ↓
           [Add Tab to New Group]
    ↓
[Complete]
```

### 5.3 タブURL変更フロー

```
[User Navigates to Different Domain]
    ↓
[tabs.onUpdated Event (url changed)]
    ↓
[Extract New Domain]
    ↓
[Compare with Current Group's Domain]
    ↓
[If Different]
    ↓
[Remove from Current Group]
    ↓
[Add to Appropriate Group for New Domain]
    ↓
[Complete]
```

## 6. エラーハンドリング

### 6.1 エラー処理方針
- すべての非同期処理にtry-catchを実装
- エラーはconsole.errorでログ出力
- ユーザー操作を妨げない（サイレントフェイル）
- クリティカルエラーは拡張機能を無効化しない

### 6.2 想定されるエラーケース

| エラーケース | 原因 | 対処方法 |
|------------|------|---------|
| API呼び出し失敗 | 権限不足、API制限 | エラーログ出力、処理スキップ |
| 無効なURL | 特殊なプロトコル | "other"グループに分類 |
| グループ作成失敗 | 同時実行による競合 | リトライ処理 |
| タブ情報取得失敗 | タブが既に閉じられた | エラーログ出力、処理スキップ |

### 6.3 エラーハンドリング実装例

```typescript
async function groupTabsByDomain(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
      try {
        await processTab(tab);
      } catch (error) {
        console.error(`Failed to process tab ${tab.id}:`, error);
        // 個別タブのエラーは無視して続行
      }
    }
  } catch (error) {
    console.error('Failed to query tabs:', error);
    // 全体の処理は中断
  }
}
```

## 7. パフォーマンス最適化

### 7.1 最適化戦略

#### 7.1.1 バッチ処理
- 複数タブの操作を一括で実行
- `chrome.tabs.group()`への呼び出しを最小化

#### 7.1.2 キャッシング
- ドメイン→グループIDのマッピングをメモリに保持
- 頻繁なAPI呼び出しを削減

#### 7.1.3 デバウンス
- タブの高速な開閉に対してデバウンス処理を適用
- 不要な再グループ化を防止

#### 7.1.4 遅延実行
- 拡張機能起動時の初期グループ化を遅延実行
- ブラウザ起動時のパフォーマンス影響を最小化

### 7.2 パフォーマンス目標
- タブ1つのグループ化: 100ms以内
- 100タブの一括グループ化: 5秒以内
- メモリ使用量: 10MB以内

## 8. セキュリティ設計

### 8.1 権限の最小化

#### manifest.jsonで要求する権限
```json
{
  "permissions": [
    "tabs",
    "tabGroups"
  ]
}
```

- `tabs`: タブ情報の取得とイベント監視に必要
- `tabGroups`: タブグループの作成と管理に必要
- host_permissions: 不要（URLのドメインのみ取得）

### 8.2 データ保護
- ユーザーのブラウジングデータを外部に送信しない
- ローカルストレージには最小限の情報のみ保存
- センシティブな情報（URL、タイトル）はログに出力しない

### 8.3 CSP（Content Security Policy）
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

## 9. テスト設計

### 9.1 テスト戦略

#### 9.1.1 単体テスト（Unit Test）
- 各モジュールの個別機能をテスト
- DomainExtractor, ColorManagerの関数テスト
- カバレッジ目標: 80%以上

#### 9.1.2 統合テスト（Integration Test）
- TabGroupManagerとChrome APIの連携テスト
- モックAPIを使用したテスト

#### 9.1.3 E2Eテスト（End-to-End Test）
- 実際のChrome環境でのテスト
- タブの作成、削除、URL変更のシナリオテスト

### 9.2 テストケース

#### DomainExtractorのテストケース
```typescript
describe('DomainExtractor', () => {
  test('should extract domain from https URL', () => {
    expect(DomainExtractor.extractDomain('https://www.example.com/path'))
      .toBe('www.example.com');
  });

  test('should handle special URLs', () => {
    expect(DomainExtractor.extractDomain('chrome://extensions'))
      .toBe('chrome');
  });

  test('should handle invalid URLs', () => {
    expect(DomainExtractor.extractDomain('not-a-url'))
      .toBe('other');
  });
});
```

## 10. デプロイメント

### 10.1 ビルドプロセス

```bash
# 開発ビルド（watch mode）
npm run dev

# プロダクションビルド
npm run build

# テスト実行
npm test

# Lint実行
npm run lint

# Format実行
npm run format
```

### 10.2 ディレクトリ構造

```
domain-tab-group/
├── src/
│   ├── background.ts         # Service Worker
│   ├── popup.ts              # Popup UI Script
│   ├── popup.html            # Popup UI HTML
│   ├── managers/
│   │   ├── TabGroupManager.ts
│   │   ├── ColorManager.ts
│   │   └── DomainExtractor.ts
│   ├── types/
│   │   └── index.ts          # Type definitions
│   └── utils/
│       └── logger.ts         # Logging utility
├── dist/                     # Build output
├── tests/                    # Test files
├── docs/                     # Documentation
├── manifest.json             # Extension manifest
├── package.json
├── tsconfig.json
└── README.md
```

### 10.3 リリースプロセス

1. コードレビュー
2. テスト実行（lint, format, unit test）
3. プロダクションビルド
4. 手動E2Eテスト
5. バージョン番号更新（manifest.json, package.json）
6. Chromeウェブストアへアップロード
7. リリースノート作成

## 11. 運用・保守

### 11.1 ログ出力
- エラーログ: `console.error()`
- 警告ログ: `console.warn()`
- デバッグログ: `console.log()`（開発時のみ）

### 11.2 モニタリング
- Chromeウェブストアのユーザーレビュー監視
- GitHubのIssue監視
- クラッシュレポートの確認

### 11.3 更新戦略
- バグフィックス: パッチバージョン更新（1.0.x）
- 新機能追加: マイナーバージョン更新（1.x.0）
- 破壊的変更: メジャーバージョン更新（x.0.0）

## 12. 今後の技術的拡張

### 12.1 設定の永続化
- chrome.storage.sync APIを使用
- ユーザー設定の保存と復元

### 12.2 カスタムルールエンジン
- ユーザー定義のグループ化ルール
- 正規表現によるドメインマッチング

### 12.3 統計・分析機能
- ドメイン別の使用統計
- グラフ表示機能

## 13. 参考資料

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/tabs/)
- [Chrome Tab Groups API](https://developer.chrome.com/docs/extensions/reference/tabGroups/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
