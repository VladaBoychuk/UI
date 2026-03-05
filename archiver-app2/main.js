const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


// ---------------------
// ВИБІР ФАЙЛІВ
// ---------------------
ipcMain.handle("pick-files", async () => {
  const result = await dialog.showOpenDialog(win, {
    title: "Оберіть файли",
    properties: ["openFile", "multiSelections"]
  });

  if (result.canceled) {
    return { canceled: true, files: [] };
  }

  return { canceled: false, files: result.filePaths };
});


// ---------------------
// ВИБІР ШЛЯХУ ЗБЕРЕЖЕННЯ
// ---------------------
ipcMain.handle("pick-archive-destination", async (_event, defaultName) => {
  const result = await dialog.showSaveDialog(win, {
    title: "Зберегти архів як...",
    defaultPath: defaultName?.endsWith(".zip")
      ? defaultName
      : `${defaultName || "archive"}.zip`,
    filters: [{ name: "ZIP Archive", extensions: ["zip"] }]
  });

  if (result.canceled) {
    return { canceled: true, outPath: null };
  }

  return { canceled: false, outPath: result.filePath };
});


// ---------------------
// СТВОРЕННЯ АРХІВУ
// ---------------------
ipcMain.handle("create-zip", async (_event, { files, outPath }) => {
  return new Promise((resolve) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      const size = archive.pointer(); // розмір у байтах
      resolve({ ok: true, size });
    });

    archive.on("error", (err) => {
      resolve({ ok: false, error: err.message });
    });

    archive.pipe(output);

    files.forEach((filePath) => {
      archive.file(filePath, { name: path.basename(filePath) });
    });

    archive.finalize();
  });
});