import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path, { resolve } from "node:path";
import { FoldWatcher } from "./service/foldwatcher";
import { fileOpen } from "./service/fileopen";
import { FileUpload } from "./service/fileupload";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const watchPath: string = "/Users/chengyiyang/Desktop/文档文件/test-watch/";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // win.webContents.openDevTools();

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  const foldWatcher = new FoldWatcher(watchPath, win);

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
      const handleUpdate = (_: any, data: any) => {
        resolve(data);
      };

      ipcMain.on("file-watcher", handleUpdate);
    });
  });

  ipcMain.handle("file-open", (_, filename) => {
    return new Promise((resolve, reject) => {
      console.log(filename);
      try {
        fileOpen(watchPath, filename);
        resolve(true);
      } catch (error) {
        reject(false);
      }
    });
  });

  const fileUpload = new FileUpload("my-url", watchPath);

  ipcMain.handle("file-upload", (_, filename) => {
    return new Promise(() => {
      console.log(filename);
      fileUpload.upload(filename);
    });
  });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
