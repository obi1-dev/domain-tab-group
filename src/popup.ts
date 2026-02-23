/**
 * Popup script for Domain Tab Group extension
 * ポップアップUIのスクリプト
 */

document.addEventListener('DOMContentLoaded', () => {
  const groupButton = document.getElementById('groupButton') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  if (groupButton) {
    groupButton.addEventListener('click', async () => {
      groupButton.disabled = true;
      statusDiv.textContent = 'グループ化中...';

      try {
        const response = await chrome.runtime.sendMessage({ action: 'groupTabs' });

        if (response.success) {
          statusDiv.textContent = 'タブをグループ化しました！';
          statusDiv.className = 'status success';
        } else {
          statusDiv.textContent = `エラー: ${response.error}`;
          statusDiv.className = 'status error';
        }
      } catch (error) {
        statusDiv.textContent = `エラー: ${error}`;
        statusDiv.className = 'status error';
      } finally {
        groupButton.disabled = false;
        setTimeout(() => {
          statusDiv.textContent = '';
          statusDiv.className = 'status';
        }, 3000);
      }
    });
  }
});
