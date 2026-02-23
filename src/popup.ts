// Popup script for Domain Tab Group extension

document.addEventListener('DOMContentLoaded', () => {
  const groupButton = document.getElementById('groupButton') as HTMLButtonElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  if (groupButton) {
    groupButton.addEventListener('click', async () => {
      groupButton.disabled = true;
      statusDiv.textContent = 'Grouping tabs...';

      try {
        const response = await chrome.runtime.sendMessage({ action: 'groupTabs' });

        if (response.success) {
          statusDiv.textContent = 'Tabs grouped successfully!';
          statusDiv.className = 'status success';
        } else {
          statusDiv.textContent = `Error: ${response.error}`;
          statusDiv.className = 'status error';
        }
      } catch (error) {
        statusDiv.textContent = `Error: ${error}`;
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
