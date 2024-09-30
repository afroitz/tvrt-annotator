import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
      electronApi: ElectronApi
  }
}

interface ElectronApi {
  loadSample: (fileName: string, index: number) => Promise<string>
}

contextBridge.exposeInMainWorld("electronApi", {
  loadSample: (fileName: string, index: number) => ipcRenderer.invoke('loadSample', fileName, index)
})