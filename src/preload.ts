import { contextBridge, ipcRenderer } from "electron";
import { AnnotationInputFileInfo, AnnotationSample } from "./types/types";

declare global {
  interface Window {
      electronApi: ElectronApi
  }
}

interface ElectronApi {
  loadSample: (fileName: string, index: number) => Promise<AnnotationSample>
  getAnnotationFileInfo: (fileName: string) => Promise<AnnotationInputFileInfo>
}

contextBridge.exposeInMainWorld("electronApi", {
  loadSample: (fileName: string, index: number) => ipcRenderer.invoke('loadSample', fileName, index),
  getAnnotationFileInfo: (fileName: string) => ipcRenderer.invoke('getAnnotationFileInfo', fileName)
})