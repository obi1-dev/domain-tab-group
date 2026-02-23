# 機能仕様書

## 1. 機能概要

本ドキュメントは、Domain Tab Group Chrome拡張機能の各機能について詳細な仕様を定義する。

## 2. 機能一覧

### 2.1 コア機能

| 機能ID | 機能名 | 優先度 | 実装状況 |
|--------|--------|--------|----------|
| F-001 | ドメインベースのタブグループ化 | 高 | 予定 |
| F-002 | グループの色分け | 高 | 予定 |
| F-003 | 自動グループ化の実行 | 高 | 予定 |

### 2.2 拡張機能（将来実装）

| 機能ID | 機能名 | 優先度 | 実装状況 |
|--------|--------|--------|----------|
| F-101 | ポップアップUI | 中 | 未実装 |
| F-102 | 設定画面 | 中 | 未実装 |
| F-103 | グループの手動管理 | 低 | 未実装 |

## 3. 機能詳細仕様

---

## F-001: ドメインベースのタブグループ化

### 3.1.1 機能概要
同じドメインを持つタブを自動的に1つのグループにまとめる機能。

### 3.1.2 目的
- タブの視認性向上
- ドメインごとの作業領域の分離
- タブの整理作業の自動化

### 3.1.3 動作仕様

#### 入力
- すべての開いているタブ情報
- 各タブのURL

#### 処理
1. 各タブのURLからドメインを抽出
2. ドメインごとにタブをグループ化
3. 同じドメインのタブを同じグループに配置

#### 出力
- ドメインごとにグループ化されたタブ

### 3.1.4 ドメイン抽出ルール

| URL例 | 抽出されるドメイン |
|-------|-------------------|
| https://www.example.com/path | www.example.com |
| http://example.com/page | example.com |
| https://subdomain.example.com | subdomain.example.com |
| chrome://extensions | chrome |
| about:blank | about |
| file:///path/to/file.html | file |
| (無効なURL) | other |

### 3.1.5 特殊ケースの処理

#### 特殊URL
- `chrome://`, `about:`, `file://` などの特殊プロトコルは、プロトコル名をドメインとして扱う
- 例: `chrome://extensions` → ドメイン: `chrome`

#### 無効なURL
- URLがパースできない場合は `"other"` というドメイン名を割り当てる
- 新しいタブ（about:blank）も `"about"` グループに分類

#### データURL
- `data:` スキームのURLは `"data"` グループに分類

### 3.1.6 グループ化のタイミング

1. **拡張機能インストール時**
   - 既存のすべてのタブを一括グループ化
   - ウィンドウごとに独立して処理

2. **新規タブ作成時**
   - 新しいタブが作成された時点でグループ化
   - URLが確定するまで待機（about:blank → 実際のURL）

3. **タブURL変更時**
   - ページ遷移でドメインが変わった場合
   - 元のグループから削除し、新しいドメインのグループに移動

### 3.1.7 ウィンドウ単位の処理
- グループ化はウィンドウ単位で実行
- 異なるウィンドウの同じドメインは別のグループとして扱う
- 理由: Chrome API の制約（グループはウィンドウ内でのみ有効）

### 3.1.8 制約・例外

| 制約事項 | 内容 |
|----------|------|
| ピン留めタブ | グループ化の対象外とする |
| プライベートタブ | 通常タブと同様に処理 |
| 拡張機能ページ | chrome-extension:// は "extension" グループ |
| 最大グループ数 | Chromeの制限に従う（制限なしと想定） |

### 3.1.9 エラーハンドリング

| エラーケース | 対処方法 |
|-------------|----------|
| タブ情報取得失敗 | エラーログ出力、該当タブをスキップ |
| グループ作成失敗 | エラーログ出力、リトライ（最大3回） |
| 権限不足 | エラーログ出力、拡張機能を無効化せず継続 |

### 3.1.10 テストケース

```typescript
describe('F-001: ドメインベースのタブグループ化', () => {
  test('同じドメインのタブが同じグループにまとめられる', async () => {
    // Test implementation
  });

  test('異なるドメインのタブは別のグループになる', async () => {
    // Test implementation
  });

  test('特殊URL（chrome://）が正しく処理される', async () => {
    // Test implementation
  });

  test('ピン留めタブはグループ化されない', async () => {
    // Test implementation
  });
});
```

---

## F-002: グループの色分け

### 3.2.1 機能概要
各タブグループに自動的に色を割り当て、視覚的に区別しやすくする機能。

### 3.2.2 目的
- グループの視覚的な識別性向上
- 作業領域の明確な分離
- ユーザー体験の向上

### 3.2.3 動作仕様

#### 入力
- ドメイン名
- 既存グループの情報（色含む）

#### 処理
1. ドメイン名から決定論的に色を選択
2. 既存グループと色が重複しないよう調整
3. グループに色を設定

#### 出力
- 割り当てられた色

### 3.2.4 利用可能な色

Chrome Tab Groups APIで利用可能な色:

| 色名 | 説明 |
|------|------|
| grey | グレー |
| blue | ブルー |
| red | レッド |
| yellow | イエロー |
| green | グリーン |
| pink | ピンク |
| purple | パープル |
| cyan | シアン |
| orange | オレンジ |

### 3.2.5 色の割り当てアルゴリズム

#### 基本方針
1. **決定論的**: 同じドメインには常に同じ色を割り当て
2. **分散**: 隣接するグループは異なる色になるよう配慮
3. **シンプル**: 複雑なロジックを避け、パフォーマンスを重視

#### 実装アルゴリズム

```typescript
function assignColor(domain: string, existingGroups: GroupInfo[]): Color {
  // 1. ドメインのハッシュ値を計算
  const hash = simpleHash(domain);

  // 2. ハッシュ値を色インデックスに変換
  const colorIndex = hash % AVAILABLE_COLORS.length;
  const primaryColor = AVAILABLE_COLORS[colorIndex];

  // 3. 既存グループの色を確認
  const usedColors = existingGroups.map(g => g.color);

  // 4. プライマリカラーが使用済みでなければ採用
  if (!usedColors.includes(primaryColor)) {
    return primaryColor;
  }

  // 5. 使用済みの場合は未使用の色を選択
  const unusedColor = AVAILABLE_COLORS.find(c => !usedColors.includes(c));
  if (unusedColor) {
    return unusedColor;
  }

  // 6. すべての色が使用済みの場合はプライマリカラーを使用
  return primaryColor;
}
```

### 3.2.6 ハッシュ関数

```typescript
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return Math.abs(hash);
}
```

### 3.2.7 色の一貫性

- 同じドメインのタブは常に同じ色のグループになる
- ブラウザを再起動しても色は保持される
- 異なるウィンドウでも同じドメインは同じ色を試みる（可能な場合）

### 3.2.8 制約・例外

| 制約事項 | 内容 |
|----------|------|
| 色の数の制限 | 9色のみ使用可能 |
| 10個以上のグループ | 色が重複する可能性あり |
| ユーザーによる色変更 | ユーザーが手動で変更した色は保持されない（再グループ化時にリセット） |

### 3.2.9 テストケース

```typescript
describe('F-002: グループの色分け', () => {
  test('同じドメインには常に同じ色が割り当てられる', () => {
    const color1 = ColorManager.assignColor('example.com', []);
    const color2 = ColorManager.assignColor('example.com', []);
    expect(color1).toBe(color2);
  });

  test('異なるドメインには異なる色が割り当てられる（可能な場合）', () => {
    const color1 = ColorManager.assignColor('example.com', []);
    const color2 = ColorManager.assignColor('another.com', []);
    // 必ずしも異なるとは限らないが、高確率で異なる
  });

  test('すべての色が使用済みの場合も動作する', () => {
    const existingGroups = AVAILABLE_COLORS.map((color, i) => ({
      id: i,
      color,
      title: `group${i}`,
      windowId: 1,
      collapsed: false
    }));
    const color = ColorManager.assignColor('newdomain.com', existingGroups);
    expect(AVAILABLE_COLORS.includes(color)).toBe(true);
  });
});
```

---

## F-003: 自動グループ化の実行

### 3.3.1 機能概要
ユーザーの操作なしに、タブの作成・更新を検知して自動的にグループ化を実行する機能。

### 3.3.2 目的
- ユーザーの手動操作を不要にする
- リアルタイムでタブを整理
- シームレスなユーザー体験の提供

### 3.3.3 動作仕様

#### トリガーイベント

| イベント | タイミング | 処理内容 |
|----------|-----------|----------|
| runtime.onInstalled | 拡張機能インストール/更新時 | 全タブを一括グループ化 |
| runtime.onStartup | ブラウザ起動時 | 全タブを一括グループ化 |
| tabs.onCreated | 新規タブ作成時 | 新しいタブをグループに追加 |
| tabs.onUpdated | タブのURL変更時 | タブを適切なグループに移動 |

### 3.3.4 イベント処理の詳細

#### 3.3.4.1 runtime.onInstalled

```typescript
chrome.runtime.onInstalled.addListener(async (details) => {
  // インストール理由に応じて処理
  if (details.reason === 'install' || details.reason === 'update') {
    // 全ウィンドウの全タブをグループ化
    await groupAllTabs();
  }
});
```

**処理フロー:**
1. すべてのウィンドウを取得
2. 各ウィンドウのすべてのタブを取得
3. ウィンドウごとにタブをドメインでグループ化
4. 各グループに色を割り当て

**実行タイミング:**
- 拡張機能の初回インストール時
- 拡張機能の更新時

#### 3.3.4.2 runtime.onStartup

```typescript
chrome.runtime.onStartup.addListener(async () => {
  // ブラウザ起動時に全タブをグループ化
  await groupAllTabs();
});
```

**実行タイミング:**
- ブラウザの起動時
- 注: Service Workerが起動するタイミングで実行

#### 3.3.4.3 tabs.onCreated

```typescript
chrome.tabs.onCreated.addListener(async (tab) => {
  // URLが確定するまで待機
  if (!tab.url || tab.url === 'chrome://newtab/') {
    return; // tabs.onUpdatedで処理
  }

  await addTabToGroup(tab);
});
```

**処理フロー:**
1. タブのURLからドメインを抽出
2. 該当ドメインのグループが存在するか確認
3. 存在すれば追加、なければグループを作成
4. グループに色を割り当て（新規グループの場合）

**実行タイミング:**
- 新しいタブが作成された時
- ただし、URLが確定していない場合は次のonUpdatedで処理

#### 3.3.4.4 tabs.onUpdated

```typescript
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // URL変更時のみ処理
  if (!changeInfo.url) {
    return;
  }

  await moveTabToGroup(tab);
});
```

**処理フロー:**
1. 変更後のURLからドメインを抽出
2. 現在のグループのドメインと比較
3. 異なる場合は適切なグループに移動
4. グループが存在しない場合は作成

**実行タイミング:**
- タブのURLが変更された時
- ページ内遷移（SPAでのURL変更）も検知

### 3.3.5 パフォーマンス最適化

#### デバウンス処理
高速なタブ操作に対してデバウンス処理を適用:

```typescript
const debouncedGrouping = debounce(groupTabsByDomain, 500);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    debouncedGrouping(tab.windowId);
  }
});
```

#### バッチ処理
複数のタブを一度にグループ化:

```typescript
// 悪い例（個別に処理）
for (const tab of tabs) {
  await chrome.tabs.group({ tabIds: [tab.id] });
}

// 良い例（バッチ処理）
const groupedTabs = groupByDomain(tabs);
for (const [domain, domainTabs] of Object.entries(groupedTabs)) {
  await chrome.tabs.group({
    tabIds: domainTabs.map(t => t.id)
  });
}
```

### 3.3.6 エッジケースの処理

| エッジケース | 対処方法 |
|-------------|----------|
| タブの高速な開閉 | デバウンス処理で対応 |
| URL未確定のタブ | tabs.onUpdatedで再処理 |
| グループからの手動削除 | 次回のURL変更時に再グループ化 |
| 同時に複数タブ作成 | バッチ処理で効率化 |
| ネットワーク遅延 | タイムアウト処理（10秒） |

### 3.3.7 制約・例外

| 制約事項 | 内容 |
|----------|------|
| Service Workerの停止 | アイドル時はService Workerが停止するが、イベント発生時に自動復帰 |
| 権限の制限 | tabs権限がない場合は動作しない |
| ピン留めタブ | グループ化の対象外 |

### 3.3.8 エラーハンドリング

```typescript
async function handleTabCreated(tab: chrome.tabs.Tab): Promise<void> {
  try {
    await addTabToGroup(tab);
  } catch (error) {
    console.error(`Failed to group tab ${tab.id}:`, error);
    // ユーザー操作を妨げないため、エラーは無視
  }
}
```

### 3.3.9 テストケース

```typescript
describe('F-003: 自動グループ化の実行', () => {
  test('拡張機能インストール時に既存タブがグループ化される', async () => {
    // Test implementation
  });

  test('新規タブ作成時に自動的にグループに追加される', async () => {
    // Test implementation
  });

  test('タブのURL変更時に適切なグループに移動する', async () => {
    // Test implementation
  });

  test('高速なタブ操作でもエラーが発生しない', async () => {
    // Test implementation
  });
});
```

---

## 4. 将来実装予定の機能

### F-101: ポップアップUI

#### 概要
拡張機能アイコンをクリックすると表示されるポップアップUI。

#### 表示内容
- 現在のウィンドウのグループ一覧
- 各グループのタブ数
- グループのクリックでそのグループのタブに移動
- 自動グループ化のオン/オフ切り替え

#### UI設計（案）
```
┌─────────────────────────────┐
│  Domain Tab Group           │
├─────────────────────────────┤
│  ● example.com      (5)   →│
│  ● github.com       (3)   →│
│  ● google.com       (2)   →│
│  ● stackoverflow.com (7)  →│
├─────────────────────────────┤
│  [⚙️ Settings]              │
└─────────────────────────────┘
```

### F-102: 設定画面

#### 概要
拡張機能の動作をカスタマイズできる設定画面。

#### 設定項目（案）
- 自動グループ化のオン/オフ
- 除外ドメインのリスト
- グループ名のカスタマイズ
- サブドメインの扱い（統合 or 分離）
- グループの自動折りたたみ

### F-103: グループの手動管理

#### 概要
ユーザーがグループを手動で編集できる機能。

#### 提供機能（案）
- グループの手動作成
- グループの削除
- タブのドラッグ&ドロップでの移動
- グループ名の手動変更
- グループ色の手動変更

---

## 5. 付録

### 5.1 用語定義

| 用語 | 定義 |
|------|------|
| タブグループ | Chromeの機能で複数のタブをまとめる機能 |
| ドメイン | URLのホスト部分（例: www.example.com） |
| Service Worker | バックグラウンドで動作するスクリプト |
| グループ化 | 複数のタブを1つのグループにまとめる操作 |

### 5.2 画面遷移図（将来実装）

```
[Browser]
   ↓ Click Extension Icon
[Popup UI]
   ↓ Click Settings
[Settings Page]
   ↓ Click Group
[Group Detail View]
```

### 5.3 Chrome API バージョン要件

| API | 必要なChromeバージョン |
|-----|----------------------|
| chrome.tabs | Chrome 88+ |
| chrome.tabGroups | Chrome 89+ |
| chrome.runtime | Chrome 88+ |
| Manifest V3 | Chrome 88+ |

### 5.4 関連リンク

- [Chrome Tabs API Documentation](https://developer.chrome.com/docs/extensions/reference/tabs/)
- [Chrome Tab Groups API Documentation](https://developer.chrome.com/docs/extensions/reference/tabGroups/)
- [Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/intro/)
