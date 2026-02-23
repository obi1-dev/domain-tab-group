# Domain Tab Group

A Chrome extension that automatically organizes tabs into groups based on their domain.

## 概要 (Overview)

このChrome拡張機能は、開いているタブをドメインごとに自動的にタブグループに整理します。

This Chrome extension automatically organizes open tabs into tab groups based on their domain.

## 機能 (Features)

- ドメインごとにタブを自動グループ化 (Automatic tab grouping by domain)
- 各ドメインに色分けされたグループ (Color-coded groups for each domain)
- シンプルで使いやすいインターフェース (Simple and easy-to-use interface)

## 開発環境 (Development Environment)

### 必要要件 (Requirements)

- Node.js (v18 or later)
- npm or yarn
- Google Chrome

### セットアップ (Setup)

1. リポジトリをクローン (Clone the repository):
```bash
git clone https://github.com/obi1-dev/domain-tab-group.git
cd domain-tab-group
```

2. 依存関係をインストール (Install dependencies):
```bash
npm install
```

3. 拡張機能をビルド (Build the extension):
```bash
npm run build
```

### 開発コマンド (Development Commands)

- `npm run dev` - 開発モードでビルド (watch mode)
- `npm run build` - プロダクションビルド
- `npm run lint` - コードの静的解析
- `npm run lint:fix` - リント問題の自動修正
- `npm run format` - コードフォーマット

### Chromeへの読み込み (Loading in Chrome)

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトの `dist` ディレクトリを選択

## プロジェクト構造 (Project Structure)

```
domain-tab-group/
├── src/
│   ├── background.ts    # バックグラウンドサービスワーカー
│   └── popup.ts         # ポップアップUIスクリプト
├── icons/               # 拡張機能アイコン
├── manifest.json        # Chrome拡張機能マニフェスト
├── popup.html          # ポップアップUI
├── webpack.config.js   # ビルド設定
├── tsconfig.json       # TypeScript設定
├── package.json        # プロジェクト設定
└── dist/               # ビルド出力 (生成される)
```

## 技術スタック (Tech Stack)

- **TypeScript** - 型安全性のため
- **Webpack** - バンドリング
- **ESLint** - コード品質
- **Prettier** - コードフォーマット
- **Chrome Extension Manifest V3** - 最新の拡張機能API

## 使い方 (Usage)

1. 拡張機能アイコンをクリック
2. 「Group Tabs by Domain」ボタンをクリック
3. タブが自動的にドメインごとにグループ化されます

## 開発ガイドライン (Development Guidelines)

- TypeScriptの厳格モードを使用
- ESLintルールに従う
- コミット前にビルドが成功することを確認
- Chrome Extension Manifest V3のベストプラクティスに従う

## ライセンス (License)

MIT

## 参考資料 (References)

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions?hl=ja)
- [Chrome Tab Groups API](https://developer.chrome.com/docs/extensions/reference/tabGroups/)
- [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/tabs/)
