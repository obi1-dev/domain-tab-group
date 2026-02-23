/**
 * ドメイン抽出クラス
 * URLからドメイン名を抽出する責務を持つ
 */
export class DomainExtractor {
  /**
   * URLからドメインを抽出
   * @param url - 抽出元URL
   * @returns ドメイン名（取得できない場合は"other"）
   */
  static extractDomain(url: string): string {
    if (!url || !this.isValidUrl(url)) {
      return 'other';
    }

    if (this.isSpecialUrl(url)) {
      return this.extractSpecialProtocol(url);
    }

    try {
      const urlObj = new URL(url);
      return urlObj.hostname || 'other';
    } catch (error) {
      console.error(`Failed to parse URL: ${url}`, error);
      return 'other';
    }
  }

  /**
   * URLが有効かチェック
   * @param url - チェック対象URL
   * @returns 有効な場合true
   */
  private static isValidUrl(url: string): boolean {
    return typeof url === 'string' && url.length > 0;
  }

  /**
   * 特殊URL（chrome://, about:, file:等）かチェック
   * @param url - チェック対象URL
   * @returns 特殊URLの場合true
   */
  private static isSpecialUrl(url: string): boolean {
    const specialProtocols = ['chrome:', 'about:', 'file:', 'chrome-extension:', 'data:'];
    return specialProtocols.some((protocol) => url.startsWith(protocol));
  }

  /**
   * 特殊URLのプロトコル名を抽出
   * @param url - 特殊URL
   * @returns プロトコル名
   */
  private static extractSpecialProtocol(url: string): string {
    const match = url.match(/^([^:]+):/);
    return match ? match[1] : 'other';
  }
}
