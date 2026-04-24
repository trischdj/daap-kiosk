const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// ── Change this to your actual Vercel URL ──────────────────────────────────
const KIOSK_URL = 'https://daap-kiosk.vercel.app';
// ──────────────────────────────────────────────────────────────────────────

// Paper size for silent printing.
// 8.5 × 5.5 inch landscape (215.9 mm × 139.7 mm) — matches the card canvas and @page CSS.
const PRINT_OPTIONS = {
  silent: true,
  printBackground: true,
  scaleFactor: 100,
  landscape: true,
  pageSize: { width: 215900, height: 139700 }, // micrometres: 215.9 mm wide × 139.7 mm tall (8.5 × 5.5 in)
};

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    kiosk: true,        // true fullscreen — covers taskbar, no browser chrome
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: false, // must be false so preload can override window.print
    },
  });

  win.loadURL(KIOSK_URL);

  // Allow the print popup (window.open) and inject the same preload into it
  win.webContents.setWindowOpenHandler(() => ({
    action: 'allow',
    overrideBrowserWindowOptions: {
      frame: false,
      show: false, // keep it invisible — we only need it to render and print
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: false,
      },
    },
  }));

  // Make the popup visible once its content has loaded
  win.webContents.on('did-create-window', (popup) => {
    popup.webContents.once('did-finish-load', () => {
      popup.show();
    });
  });
}

// Silent print: called by the preload whenever window.print() fires in any window
ipcMain.on('silent-print', (event) => {
  const webContents = event.sender;

  webContents.print(PRINT_OPTIONS, (success, errorType) => {
    if (!success) {
      console.error('Print failed:', errorType);
    }
    // Close the popup after the print job is handed to the OS spooler
    const popup = BrowserWindow.fromWebContents(webContents);
    if (popup && !popup.isDestroyed()) {
      popup.close();
    }
  });
});

app.whenReady().then(createWindow);

// On Windows the app should stay alive only while the main window is open
app.on('window-all-closed', () => app.quit());
