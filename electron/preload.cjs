// Preload runs in an isolated context. We expose a tiny, safe storage bridge so
// the renderer can persist input values to a file in the user-data folder, plus
// version info for the footer. No filesystem or Node APIs are leaked directly.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nte', {
  isElectron: true,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  store: {
    // synchronous so initial UI state is ready on first render
    loadSync: () => ipcRenderer.sendSync('store:load'),
    save: (json) => ipcRenderer.send('store:save', json),
    // synchronous write — used to flush on window close so nothing is lost
    saveSync: (json) => ipcRenderer.sendSync('store:save-sync', json),
  },
})
