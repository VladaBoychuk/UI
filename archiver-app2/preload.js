const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  pickFiles: () => ipcRenderer.invoke("pick-files"),

  pickArchiveDestination: (defaultName) =>
    ipcRenderer.invoke("pick-archive-destination", defaultName),

  createZip: (payload) =>
    ipcRenderer.invoke("create-zip", payload),
});