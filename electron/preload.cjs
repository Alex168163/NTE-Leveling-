// Preload runs in an isolated context. We expose nothing privileged to the
// renderer — the app is a pure offline calculator. A version tag is exposed
// purely for the "About" footer.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('nte', {
  isElectron: true,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
})
