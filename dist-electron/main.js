var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import * as fs from "fs";
import * as path from "path";
class FoldWatcher {
  constructor(path2, mainWindow) {
    __publicField(this, "watchPath");
    __publicField(this, "processedFiles");
    __publicField(this, "watcher", null);
    __publicField(this, "mainWindow");
    this.mainWindow = mainWindow;
    this.watchPath = path2;
    this.processedFiles = /* @__PURE__ */ new Set();
    this.initFiles();
  }
  initFiles() {
    try {
      const files = fs.readdirSync(this.watchPath);
      files.forEach((file) => {
        this.processedFiles.add(file);
      });
    } catch (error) {
      console.error("初始化失败: ", error);
    }
  }
  getInitFiles() {
    return Promise.resolve({
      filenames: Array.from(this.processedFiles)
    });
  }
  startWatch() {
    console.log("开始监听: ", this.watchPath);
    this.watcher = fs.watch(this.watchPath, (eventType, filename) => {
      if (filename && eventType === "rename") {
        const filePath = path.join(this.watchPath, filename);
        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (!err && !this.processedFiles.has(filename)) {
            this.processedFiles.add(filename);
            this.notifyUpdate();
          } else if (err) {
            this.processedFiles.delete(filename);
            this.notifyUpdate();
          }
        });
      }
    });
  }
  notifyUpdate() {
    this.mainWindow.webContents.send("file-watcher", {
      filenames: Array.from(this.processedFiles)
    });
  }
  stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.openDevTools();
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
  const foldWatcher = new FoldWatcher(
    "/Users/chengyiyang/Desktop/文档文件/test-watch/",
    win
  );
  foldWatcher.startWatch();
  ipcMain.handle("get-init-files", () => {
    return foldWatcher.getInitFiles();
  });
  ipcMain.handle("close-watch", () => {
    foldWatcher.stopWatching();
    console.log("关闭监听");
  });
  ipcMain.handle("watch-files", () => {
    return new Promise((resolve) => {
      const handleUpdate = (_, data) => {
        resolve(data);
      };
      ipcMain.on("file-watcher", handleUpdate);
    });
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
