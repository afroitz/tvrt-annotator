import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'node:fs/promises';
import { createReadStream } from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { DatasetInfo, AnnotationSample, AnnotationInfo, AnnotationData, AnnotationMeta, SampleAnnotations } from './types/types';
import { getMessageReplyThread, processMessageData, validateDatasetStructure } from './utils/utils';
import decompress from 'decompress';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const is_dev = process.env.NODE_ENV === 'development';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);


  if(is_dev){
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Create data and annotations directory if it does not exist
app.on('ready', async () => {
  const dataDir = path.join(app.getPath('userData'), 'annotation-input-data');
  const annotationsDir = path.join(app.getPath('userData'), 'annotations');

  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir);
  }

  try {
    await fs.access(annotationsDir);
  } catch (error) {
    await fs.mkdir(annotationsDir);
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/** Load a sample from an annotation dataset by dataset name and index */
ipcMain.handle('loadSample', async (_event, datasetName: string, index: number):Promise<AnnotationSample> => {
  const csvFilePath = path.join(app.getPath('userData'), 'annotation-input-data', datasetName, 'filtered.csv');
  const fullFilePath = path.join(app.getPath('userData'), 'annotation-input-data', datasetName, 'full.csv');

  // Check if file exists
  try {
    await fs.access(csvFilePath);
  } catch (error) {
    throw new Error(`Data file for ${datasetName} does not exist in the user data directory.`);
  }

  // Check if full file exists
  try {
    await fs.access(fullFilePath);
  } catch (error) {
    throw new Error(`Additional data file for ${datasetName} does not exist in the user data directory.`);
  }

  // Read file
  const rows: object[] = await new Promise((resolve, reject) => {
    const results: object[] = [];

    createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });

  // Read additional data
  const additionalData: object[] = await new Promise((resolve, reject) => {
    const results: object[] = [];

    createReadStream(fullFilePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });

  // Check if row index is valid
  if (index < 0 || index >= rows.length) {
    throw new Error(`Invalid index ${index} for dataset ${datasetName}.`);
  }

  const sample: any = rows[index];

  // process message
  const sampleMessage = processMessageData(sample);

  let thread = [];

  if(sampleMessage.is_reply){
    thread = getMessageReplyThread(sampleMessage, additionalData);
  }

  const processedThread = thread.map((msg) => processMessageData(msg));

  return {
    sample: sampleMessage,
    thread: processedThread
  } as AnnotationSample;
});

/** Get basic info about an annotation dataset. Currently this is only the number of rows */
ipcMain.handle('getDatasetInfo', async (_event, name: string): Promise<DatasetInfo> => {
  const datasetDirPath = path.join(app.getPath('userData'), 'annotation-input-data', name);

  // Check if file exists
  try {
    await fs.access(datasetDirPath);
  } catch (error) {
    throw new Error(`Dataset ${name} does not exist in the user data directory.`);
  }

  // Check if filtered file exists
  const dataFilePath = path.join(datasetDirPath, 'filtered.csv');
  try {
    await fs.access(dataFilePath);
  } catch (error) {
    throw new Error(`Data file for dataset ${name} does not exist in the user data directory.`);
  }

  // Read file
  const rows: object[] = await new Promise((resolve, reject) => {
    const results: object[] = [];

    createReadStream(dataFilePath)
      .pipe(csv())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });

  // Get task info
  const taskInfoPath = path.join(datasetDirPath, 'task.json');

  try {
    await fs.access(taskInfoPath);
  } catch (error) {
    throw new Error(`Task info file for dataset ${name} does not exist in the user data directory.`);
  }

  const taskInfo = await fs.readFile(taskInfoPath, 'utf-8');
  const taskInfoObject = JSON.parse(taskInfo);

  return {
    rows: rows.length,
    taskInfo: taskInfoObject
  };
});

/** Load the names of all available datasets */
ipcMain.handle('getDatasetNames', async () => {
  const dataDir = path.join(app.getPath('userData'), 'annotation-input-data');

  try {
    await fs.access(dataDir);
  } catch (error) {
    throw new Error('Data directory does not exist.');
  }

  const files = await fs.readdir(dataDir);

  // filter out everything that is not a directory
  const stats = await Promise.all(files.map(async (file) => {
    const filePath = path.join(dataDir, file);
    return await fs.stat(filePath);
  }));

  const filteredFiles = files.filter((file, index) => stats[index].isDirectory());

  return filteredFiles;
});

/** Start an annotation for a dataset if none exists yet, else return data about the existing one */
ipcMain.handle('startOrContinueAnnotation', async (_event, datasetName: string): Promise<AnnotationInfo> => {
  const annotationDir = path.join(app.getPath('userData'), 'annotations', datasetName);

  try {
    await fs.access(annotationDir);
    console.log(`Annotation directory for ${datasetName} exists`);
  } catch (error) {
    
    await fs.mkdir(annotationDir);

    // create annotation_meta.json and annotation.json
    const annotationMeta = {
      selectedSample: 0
    };

    await fs.writeFile(path.join(annotationDir, 'annotation_meta.json'), JSON.stringify(annotationMeta, null, 2));

    const annotationData: AnnotationData = {
      annotatedSamples: []
    };

    await fs.writeFile(path.join(annotationDir, 'annotation.json'), JSON.stringify(annotationData, null, 2));

    console.log(`Annotation directory and files for ${datasetName} created`);
  }

  // Read annotation_meta.json
  const annotationMeta = await fs.readFile(path.join(annotationDir, 'annotation_meta.json'), 'utf-8');

  // Read annotation.json
  const annotationData = await fs.readFile(path.join(annotationDir, 'annotation.json'), 'utf-8');

  return {
    meta: JSON.parse(annotationMeta),
    data: JSON.parse(annotationData)
  };
});

/** Add or update annotations for a sample */
ipcMain.handle('updateAnnotation', async (_event, datasetName: string, sampleIndex: number, annotations: SampleAnnotations): Promise<void> => {
  const annotationDir = path.join(app.getPath('userData'), 'annotations', datasetName);

  // Read annotation.json
  const annotationData = await fs.readFile(path.join(annotationDir, 'annotation.json'), 'utf-8');
  const annotatedSamples = (JSON.parse(annotationData) as AnnotationData).annotatedSamples;

  const existingSampleAnnotation = annotatedSamples.find((sample) => sample.sampleIndex === sampleIndex);

  if (existingSampleAnnotation) {
    // if sample already exists, update it
    existingSampleAnnotation.annotations = annotations.annotations;
  } else {
    // if sample does not exist, add it
    annotatedSamples.push(annotations);
  }

  await fs.writeFile(path.join(annotationDir, 'annotation.json'), JSON.stringify({ annotatedSamples }, null, 2));
});

/** Update annotation metadata */
ipcMain.handle('updateAnnotationMeta', async (_event, datasetName: string, meta: AnnotationMeta): Promise<void> => {
  const annotationDir = path.join(app.getPath('userData'), 'annotations', datasetName);

  await fs.writeFile(path.join(annotationDir, 'annotation_meta.json'), JSON.stringify(meta, null, 2));
});

/** Import a dataset */
ipcMain.handle('importDataset', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Zip Files', extensions: ['zip'] }],
  });

  if (canceled) {
    return
  }

  const zipFilePath = filePaths[0];
  const datasetName = path.basename(zipFilePath, '.zip');

  // check if dataset already exists
  const datasetDirPath = path.join(app.getPath('userData'), 'annotation-input-data', datasetName);

  // Check if dataset already exists
  try {
    await fs.access(datasetDirPath);
    throw new Error("Dataset with the same name already exists.");
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    // directory does not exist, continue
  }

  const tempDir = path.join(app.getPath('temp'), 'annotation-import-temp');

  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore error if directory does not exist
  }

  await fs.mkdir(tempDir);

  try {

    // Unzip the file to a temporary location
    await decompress(zipFilePath, tempDir);

    // Find the actual dataset folder (ignore `__MACOSX` and hidden files)
    const files = await fs.readdir(tempDir);

    const datasetFolder = files.find(file => file !== '__MACOSX' && !file.startsWith('.'));
    if (!datasetFolder) {
      throw new Error("No valid dataset folder found.");
    }

    const datasetPath = path.join(tempDir, datasetFolder);
    const isValid = await validateDatasetStructure(datasetPath);
    if(!isValid){ 
      throw new Error("Invalid dataset structure");
    } 

    // Copy the dataset to the user data directory
    const targetDir = path.join(app.getPath('userData'), 'annotation-input-data', datasetName);
    await fs.cp(datasetPath, targetDir, { recursive: true });

    return { success: true, message: 'Dataset imported successfully.' };
  } finally {
    // Clean up the temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

/** Delete a dataset */
ipcMain.handle('deleteDataset', async (_event, datasetName: string) => {
  const datasetDirPath = path.join(app.getPath('userData'), 'annotation-input-data', datasetName);
  const annotationDirPath = path.join(app.getPath('userData'), 'annotations', datasetName);
  try {
    await fs.access(datasetDirPath);
  } catch (error) {
    throw new Error(`Dataset ${datasetName} does not exist in the user data directory.`);
  }
  try {
    await fs.access(annotationDirPath);
  } catch (error) {
    throw new Error(`Annotation directory for dataset ${datasetName} does not exist in the user data directory.`);
  }

  // Delete the dataset directory
  await fs.rm(datasetDirPath, { recursive: true, force: true });
  await fs.rm(annotationDirPath, { recursive: true, force: true });
});

/** Export annotation data for a dataset */
ipcMain.handle('exportAnnotations', async (_event, datasetName) => {
  const annotationFile = path.join(app.getPath('userData'), 'annotations', datasetName, 'annotation.json');

  try {
    await fs.access(annotationFile);
  } catch {
    throw new Error("No annotations found.")
  }

  // Generate  default filename based on dataset name and timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); 
  const defaultFileName = `${datasetName}_${timestamp}.json`;

  // Show save dialog
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save Annotations',
    defaultPath: defaultFileName,
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });

  if (canceled || !filePath) {
    return
  }

  // Copy the annotation.json file to the selected location
  await fs.copyFile(annotationFile, filePath);

});

