/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

interface IElectronAPI {
  getInitFiles: () => Promise<{ filenames: string[] }>;

  onFileUpdate: () => Promise<{ filenames: string[] }>;

  closeWatch: () => void;

  handleFileOpen: (filename: string) => Promise<string>;

  handleFileUpload: (filename: string) => Promise;
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import("electron").IpcRenderer;

  electron: IElectronAPI;
}
