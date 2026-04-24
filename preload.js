const { ipcRenderer } = require('electron');

// Replace the browser's built-in print dialog with a silent IPC call.
// The main process receives 'silent-print' and calls webContents.print()
// with no dialog, then closes this popup window when the job is spooled.
window.print = function () {
  ipcRenderer.send('silent-print');
};

// Suppress window.close() — the page calls it immediately after window.print().
// If we let it run, the window would close before the print job is sent.
// The main process closes the popup itself once printing is done.
window.close = function () {};
