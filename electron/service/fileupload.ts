import * as path from "path";
import * as fs from "fs/promises";
import axios from "axios";

export class FileUpload {
  private api: string;
  private rootPath: string;

  constructor(api: string, rootPath: string) {
    this.api = api;
    this.rootPath = rootPath;
  }

  public async upload(filename: string) {
    const filePath = path.join(this.rootPath, filename);
    console.log(filePath);

    const file: Buffer = await fs.readFile(filePath);

    await axios.post(this.api, file);
  }
}
