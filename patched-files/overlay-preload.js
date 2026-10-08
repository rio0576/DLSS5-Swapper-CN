'use strict';
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('overlayRuntime', {
  onPreferences:fn=>ipcRenderer.on('lab-overlay-preferences',(_event,value)=>fn(value)),
  onLanguage: fn => { ipcRenderer.on('lab-overlay-language', (_event, code) => fn(code)); },
  onStatus: fn => { const callback = (_event, status) => fn(status); ipcRenderer.on('lab-overlay-status', callback); },
  setControl: command => ipcRenderer.send('lab-overlay-control', command),
  resize: height => ipcRenderer.send('lab-overlay-resize', height)
});
