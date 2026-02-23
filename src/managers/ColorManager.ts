import { GroupInfo } from '../types';

/**
 * カラーマネージャークラス
 * タブグループの色管理を担当
 */
export class ColorManager {
  /**
   * 使用可能な色のリスト
   */
  private static readonly AVAILABLE_COLORS: chrome.tabGroups.ColorEnum[] = [
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

  /**
   * ドメインに色を割り当て
   * @param domain - ドメイン名
   * @param existingGroups - 既存のグループ情報
   * @returns 割り当てられた色
   */
  static assignColor(domain: string, existingGroups: GroupInfo[]): chrome.tabGroups.ColorEnum {
    // 1. ドメインから決定論的に色を選択
    const primaryColor = this.hashDomainToColor(domain);

    // 2. 既存グループで使用されている色を取得
    const usedColors = existingGroups.map((g) => g.color);

    // 3. プライマリカラーが未使用なら採用
    if (!usedColors.includes(primaryColor)) {
      return primaryColor;
    }

    // 4. 未使用の色を探す
    const unusedColor = this.AVAILABLE_COLORS.find((c) => !usedColors.includes(c));
    if (unusedColor) {
      return unusedColor;
    }

    // 5. すべての色が使用済みの場合はプライマリカラーを使用
    return primaryColor;
  }

  /**
   * 使用可能な色のリストを取得
   * @returns 色のリスト
   */
  static getAvailableColors(): chrome.tabGroups.ColorEnum[] {
    return [...this.AVAILABLE_COLORS];
  }

  /**
   * ドメインから決定論的に色を選択
   * @param domain - ドメイン名
   * @returns 選択された色
   */
  private static hashDomainToColor(domain: string): chrome.tabGroups.ColorEnum {
    const hash = this.simpleHash(domain);
    const colorIndex = hash % this.AVAILABLE_COLORS.length;
    return this.AVAILABLE_COLORS[colorIndex];
  }

  /**
   * 簡易ハッシュ関数
   * @param str - ハッシュ化する文字列
   * @returns ハッシュ値
   */
  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 32bit整数に変換
    }
    return Math.abs(hash);
  }
}
