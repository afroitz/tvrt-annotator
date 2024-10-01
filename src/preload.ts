import { contextBridge, ipcRenderer } from "electron";
import { DatasetInfo, AnnotationSample } from "./types/types";

declare global {
  interface Window {
      electronApi: ElectronApi
  }
}

interface ElectronApi {
  loadSample: (datasetName: string, index: number) => Promise<AnnotationSample>
  getDatasetInfo: (name: string) => Promise<DatasetInfo>
}

contextBridge.exposeInMainWorld("electronApi", {
  loadSample: (datasetName: string, index: number) => ipcRenderer.invoke('loadSample', datasetName, index),
  getDatasetInfo: (name: string) => ipcRenderer.invoke('getDatasetInfo', name)
})