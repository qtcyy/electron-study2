import { useEffect, useState } from "react";

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

  const handleOpenFile = async (filename: string) => {
    try {
      await window.electron.handleFileOpen(filename);
    } catch (error) {
      console.error("打开文件错误: ", error);
    }
  };

  const handleUpload = async (filename: string) => {
    try {
      await window.electron.handleFileUpload(filename);
    } catch (error) {
      console.error("上传错误: ", error);
    }
  };

  return (
    <div>
      <div>当前文件夹: </div>
      <br />
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <span>{file}</span>
            <button onClick={() => handleOpenFile(file)}>Open</button>
            <button onClick={() => handleUpload(file)}>upload</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
