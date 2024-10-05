import { contextBridge, ipcRenderer } from "electron";
import { DatasetInfo, AnnotationSample, AnnotationInfo, AnnotationMeta, SampleAnnotations } from "./types/types";

declare global {
  interface Window {
      electronApi: ElectronApi
  }
}

interface ElectronApi {
  loadSample: (datasetName: string, index: number) => Promise<AnnotationSample>
  getDatasetInfo: (name: string) => Promise<DatasetInfo>
  getDatasetNames: () => Promise<string[]>
  startOrContinueAnnotation: (datasetName: string) => Promise<AnnotationInfo>
  updateAnnotation: (datasetName: string, sampleIndex: number, annotations: SampleAnnotations) => Promise<void>
  updateAnnotationMeta: (datasetName: string, meta: AnnotationMeta) => Promise<void>
  importDataset: () => Promise<void>
}

contextBridge.exposeInMainWorld("electronApi", {
  loadSample: (datasetName: string, index: number) => ipcRenderer.invoke('loadSample', datasetName, index),
  getDatasetInfo: (name: string) => ipcRenderer.invoke('getDatasetInfo', name),
  getDatasetNames: () => ipcRenderer.invoke('getDatasetNames'),
  startOrContinueAnnotation: (datasetName: string) => ipcRenderer.invoke('startOrContinueAnnotation', datasetName),
  updateAnnotation: (datasetName: string, sampleIndex: number, annotations: SampleAnnotations) => ipcRenderer.invoke('updateAnnotation', datasetName, sampleIndex, annotations),
  updateAnnotationMeta: (datasetName: string, meta: AnnotationMeta) => ipcRenderer.invoke('updateAnnotationMeta', datasetName, meta),
  importDataset: () => ipcRenderer.invoke('importDataset')
})