import { shell } from "electron";
import * as path from "path";

export async function fileOpen(rootPath: string, filename: string) {
  const filePath = path.join(rootPath, filename);
  await shell.openPath(filePath);
}
