import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
      electronApi: ElectronApi
  }
}

interface ElectronApi {
  addOne: (x: number) => Promise<number>
}

contextBridge.exposeInMainWorld("electronApi", {
  addOne: (x: number) => ipcRenderer.invoke("addOne", x),
})