import { useEffect, useState } from "react";

declare global {
  interface Window {
    electron: {
      getInitFiles: () => Promise<{ filenames: string[] }>;

      onFileUpdate: () => Promise<{ filenames: string[] }>;

      closeWatch: () => void;
    };
  }
}

function App() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    const fetchInitFiles = async () => {
      try {
        const newFiles = await window.electron.getInitFiles();
        if (isSubscribed) setFiles(newFiles.filenames);

        console.log(isSubscribed);

        while (isSubscribed) {
          const updateFiles = await window.electron.onFileUpdate();
          setFiles(updateFiles.filenames);
        }
      } catch (error) {
        console.error("获取错误: ", error);
      }
    };

    fetchInitFiles();

    return () => {
      isSubscribed = false;
      window.electron.closeWatch();
    };
  }, []);

  return (
    <div>
      <div>当前文件夹: </div>
      <br />
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <span>{file}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
