import { BrowserWindow } from "electron";
import * as fs from "fs";
import * as path from "path";

interface BackType {
  filenames: Array<string>;
}

export class FoldWatcher {
  private watchPath: string;
  private processedFiles: Set<string>;
  private watcher: fs.FSWatcher | null = null;
  private mainWindow: BrowserWindow;

  constructor(path: string, mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.watchPath = path;
    this.processedFiles = new Set();

    this.initFiles();
  }

  private initFiles() {
    try {
      const files = fs.readdirSync(this.watchPath);
      files.forEach((file) => {
        this.processedFiles.add(file);
      });
    } catch (error) {
      console.error("初始化失败: ", error);
    }
  }

  public getInitFiles(): Promise<BackType> {
    return Promise.resolve({
      filenames: Array.from(this.processedFiles),
    });
  }

  public startWatch() {
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

  private notifyUpdate() {
    this.mainWindow.webContents.send("file-watcher", {
      filenames: Array.from(this.processedFiles),
    });
  }

  public stopWatching() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
