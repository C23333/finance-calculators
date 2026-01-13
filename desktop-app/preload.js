// Preload script for Electron
// Exposes safe APIs to the renderer process

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    isDesktopApp: true,
    platform: process.platform,
    version: '1.0.0'
});
