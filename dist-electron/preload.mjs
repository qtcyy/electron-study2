"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(
      channel,
      (event, ...args2) => listener(event, ...args2)
    );
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electron", {
  getInitFiles: () => electron.ipcRenderer.invoke("get-init-files"),
  onFileUpdate: () => new Promise((resolve) => {
    const handleUpdate = (_, data) => {
      resolve(data);
    };
    electron.ipcRenderer.on("file-watcher", handleUpdate);
  }),
  closeWatch: () => electron.ipcRenderer.invoke("close-watch"),
  handleFileOpen: (filename) => {
    return electron.ipcRenderer.invoke("file-open", filename);
  },
  handleFileUpload: (filename) => {
    return electron.ipcRenderer.invoke("file-upload", filename);
  }
});
