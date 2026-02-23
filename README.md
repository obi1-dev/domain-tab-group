# Domain Tab Group

Chrome拡張機能 - タブをドメインごとに自動グループ化

## 概要

開いているタブをドメインごとに自動的にグループ化するChrome拡張機能です。タブの整理と視認性を向上させ、作業効率を高めます。

## 機能

- **自動グループ化**: ドメインごとにタブを自動的にグループ化
- **色分け**: 各ドメインに一貫した色を自動割り当て
- **リアルタイム処理**: 新規タブ作成時・URL変更時に自動的にグループ化
- **シームレスな動作**: インストール後、ユーザー操作なしで動作開始

## 開発環境

### 必要要件

- Node.js v18以上
- npm または yarn
- Google Chrome

### セットアップ

1. リポジトリをクローン:

```bash
git clone https://github.com/obi1-dev/domain-tab-group.git
cd domain-tab-group
```

2. 依存関係をインストール:

```bash
npm install
```

3. 拡張機能をビルド:

```bash
npm run build
```

### 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発モードでビルド（watch mode） |
| `npm run build` | プロダクションビルド |
| `npm run lint` | ESLintでコードチェック |
| `npm run lint:fix` | ESLintで自動修正 |
| `npm run format` | Prettierでコードフォーマット |

### Chromeへの読み込み

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトの `dist` ディレクトリを選択

## プロトタイプ（v0.1.0）のテスト手順

### 前提条件

- Google Chrome（バージョン89以降推奨）
- Node.js v18以上
- npm

### ローカル環境でのテスト

1. **リポジトリのクローンと依存関係のインストール**

```bash
git clone https://github.com/obi1-dev/domain-tab-group.git
cd domain-tab-group
npm install
```

2. **ビルドの実行**

```bash
npm run build
```

3. **Chrome拡張機能として読み込み**

- Chromeで `chrome://extensions/` を開く
- 右上の「デベロッパーモード」を有効化
- 「パッケージ化されていない拡張機能を読み込む」をクリック
- プロジェクトの `dist` ディレクトリを選択

4. **動作確認**

以下の機能をテストします：

#### 4.1 基本的なグループ化
- [ ] 複数のタブを開く（異なるドメイン）
- [ ] 拡張機能アイコンをクリックして「ドメインでグループ化」ボタンを押す
- [ ] 同じドメインのタブが自動的にグループ化されることを確認
- [ ] グループ名がドメイン名になっていることを確認
- [ ] 各グループに色が割り当てられていることを確認

#### 4.2 自動グループ化
- [ ] 新しいタブを開く
- [ ] 既存のドメインのタブを開いた場合、自動的に同じグループに追加されることを確認
- [ ] 新しいドメインのタブを開いた場合、新しいグループが作成されることを確認

#### 4.3 URLの変更対応
- [ ] タブのURLを変更（別のドメインに遷移）
- [ ] タブが自動的に新しいドメインのグループに移動することを確認

#### 4.4 特殊ケースの確認
- [ ] 1つのタブのみのドメインはグループ化されないことを確認
- [ ] ピン留めしたタブはグループ化されないことを確認
- [ ] `chrome://` や `about:` などの特殊URLも正しく処理されることを確認

#### 4.5 色の一貫性
- [ ] 同じドメインのタブは常に同じ色のグループになることを確認
- [ ] ブラウザを再起動しても色が保持されることを確認（拡張機能を再読み込み後）

### トラブルシューティング

#### 拡張機能が動作しない場合

1. **コンソールでエラーを確認**
   - `chrome://extensions/` で拡張機能の「詳細」を開く
   - 「サービスワーカー」のリンクをクリック
   - デベロッパーツールでエラーメッセージを確認

2. **ビルドエラーの確認**
   ```bash
   npm run lint
   npm run build
   ```

3. **拡張機能の再読み込み**
   - `chrome://extensions/` で拡張機能の「再読み込み」ボタンをクリック

4. **権限の確認**
   - 拡張機能の詳細画面で必要な権限が付与されているか確認

### 既知の制限事項（v0.1.0）

- 設定画面はまだ実装されていません
- 除外ドメインの設定機能はありません
- グループの自動折りたたみ機能はありません
- 統計情報の表示機能はありません

### フィードバック

バグ報告や機能提案は、[GitHub Issues](https://github.com/obi1-dev/domain-tab-group/issues)でお願いします。

## プロジェクト構造

```
domain-tab-group/
├── src/
│   ├── background.ts              # Service Worker（バックグラウンドスクリプト）
│   ├── popup.ts                   # ポップアップUIスクリプト
│   ├── managers/
│   │   ├── TabGroupManager.ts     # タブグループ管理
│   │   ├── DomainExtractor.ts     # ドメイン抽出
│   │   └── ColorManager.ts        # 色管理
│   └── types/
│       └── index.ts               # TypeScript型定義
├── docs/                          # 設計ドキュメント
│   ├── requirements.md            # 要件定義書
│   ├── system-design.md           # システム設計書
│   └── functional-specification.md # 機能仕様書
├── dist/                          # ビルド出力（自動生成）
├── manifest.json                  # Chrome拡張機能マニフェスト
├── popup.html                     # ポップアップUI
├── vite.config.ts                 # Viteビルド設定
├── build.sh                       # ビルドスクリプト
├── eslint.config.js               # ESLintフラット設定
├── tsconfig.json                  # TypeScript設定
└── package.json                   # プロジェクト設定
```

## 技術スタック

- **TypeScript**: 型安全性を確保
- **Chrome Extension Manifest V3**: 最新の拡張機能API
- **Vite**: 高速ビルドツール（v6）
- **ESLint**: コード品質チェック（v9、フラット設定）
- **Prettier**: コードフォーマット

## アーキテクチャ

### コンポーネント構成

- **Service Worker** (`background.ts`): タブイベントを監視し、グループ化を実行
- **TabGroupManager**: タブグループの作成・更新・管理
- **DomainExtractor**: URLからドメインを抽出
- **ColorManager**: ドメインごとに一貫した色を割り当て

### 処理フロー

1. 拡張機能インストール時 → 全タブをグループ化
2. 新規タブ作成時 → 該当ドメインのグループに追加
3. タブURL変更時 → 新しいドメインのグループに移動

## 使い方

### 基本操作

1. 拡張機能をインストールすると、自動的にタブがグループ化されます
2. 新しいタブを開くと、自動的に適切なグループに追加されます
3. 拡張機能アイコンをクリックして、手動でグループ化することもできます

### グループ化ルール

- 同じドメインのタブは同じグループにまとめられます
- 1つのタブのみのドメインはグループ化されません
- ピン留めタブはグループ化の対象外です
- `chrome://`、`about:`などの特殊URLも適切に処理されます

## 開発ガイドライン

### コーディング規約

- **DRY原則・SOLID原則**に従った実装
- **TypeScriptの厳格モード**を使用
- **JSDocコメント**で関数を文書化
- **ESLintルール**を遵守

### コミット前の確認事項

- [ ] `npm run build` が成功する
- [ ] `npm run lint` がエラーなく完了する
- [ ] `npm run format` を実行済み
- [ ] 設計ドキュメントと整合性が取れている

## ドキュメント

詳細な設計ドキュメントは `docs/` ディレクトリを参照してください：

- [要件定義書](docs/requirements.md): プロジェクトの目的と機能要件
- [システム設計書](docs/system-design.md): アーキテクチャと技術設計
- [機能仕様書](docs/functional-specification.md): 各機能の詳細仕様

## 参考資料

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions?hl=ja)
- [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/tabs/)
- [Chrome Tab Groups API](https://developer.chrome.com/docs/extensions/reference/tabGroups/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

## ライセンス

MIT

---

## 開発者向け情報

### テストケースの追加（将来実装予定）

現在、テストフレームワークは未導入ですが、将来的に以下のテストを追加予定：

- 単体テスト: DomainExtractor、ColorManagerの関数テスト
- 統合テスト: TabGroupManagerとChrome APIの連携テスト
- E2Eテスト: 実際のChrome環境での動作テスト

### 今後の拡張機能（予定）

- [ ] 設定画面の実装
- [ ] 除外ドメインの設定
- [ ] カスタムグループ化ルール
- [ ] グループの自動折りたたみ
- [ ] 統計情報の表示

## コントリビューション

バグ報告や機能提案は、GitHubのIssueでお願いします。

## 注意事項

- この拡張機能はChrome バージョン88以降で動作します
- タブグループAPIを使用するため、Chrome 89以降を推奨します
- ユーザーのブラウジングデータは外部に送信されません
