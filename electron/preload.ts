import { ipcRenderer, contextBridge } from "electron";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("electron", {
  getInitFiles: () => ipcRenderer.invoke("get-init-files"),

  onFileUpdate: () =>
    new Promise((resolve) => {
      const handleUpdate = (_: any, data: any) => {
        resolve(data);
      };

      ipcRenderer.on("file-watcher", handleUpdate);
    }),

  closeWatch: () => ipcRenderer.invoke("close-watch"),

  handleFileOpen: (filename: string) => {
    return ipcRenderer.invoke("file-open", filename);
  },

  handleFileUpload: (filename: string) => {
    return ipcRenderer.invoke("file-upload", filename);
  },
});
