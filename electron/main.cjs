// Electron main process — creates the desktop (.exe) window.
// Security: context isolation on, node integration off, sandboxed renderer.
const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

const isDev = !!process.env.ELECTRON_START_URL

// --- persistent input storage --------------------------------------------
// Saved values live in a JSON file in the app's user-data folder, so they
// survive closing/reopening (and even app updates). The renderer talks to this
// via the preload `nte.store` bridge.
const dataFile = () => path.join(app.getPath('userData'), 'nte-data.json')

function readStore() {
  try {
    return fs.readFileSync(dataFile(), 'utf8')
  } catch {
    return '{}'
  }
}
function writeStore(json) {
  try {
    fs.writeFileSync(dataFile(), typeof json === 'string' ? json : JSON.stringify(json))
  } catch {
    /* disk unavailable — ignore, renderer also mirrors to localStorage */
  }
}

// Synchronous load so the UI is populated on first paint (no empty flash).
ipcMain.on('store:load', (e) => {
  e.returnValue = readStore()
})
ipcMain.on('store:save', (_e, json) => writeStore(json))
ipcMain.on('store:save-sync', (e, json) => {
  writeStore(json)
  e.returnValue = true
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#070b14',
    title: 'NTE Leveling Calculator',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  // Open external links in the system browser, never in-app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL(process.env.ELECTRON_START_URL)
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
