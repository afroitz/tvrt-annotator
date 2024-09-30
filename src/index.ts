import { app, BrowserWindow, ipcMain } from 'electron';
import * as fs from 'node:fs/promises';
import { createReadStream } from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

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

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Create data directory if it does not exist
app.on('ready', async () => {
  const dataDir = path.join(app.getPath('userData'), 'annotation-input-data');

  try {
    await fs.access(dataDir);
  } catch (error) {
    await fs.mkdir(dataDir);
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

/** Load a sample from an annotation input data csv file by filename and index */
ipcMain.handle('loadSample', async (_event, fileName: string, index: number) => {
  const csvFilePath = path.join(app.getPath('userData'), 'annotation-input-data', fileName);

  // Check if file exists
  try {
    await fs.access(csvFilePath);
  } catch (error) {
    throw new Error(`File ${fileName} does not exist in the user data directory.`);
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

  // Check if row index is valid
  if (index < 0 || index >= rows.length) {
    throw new Error(`Invalid index ${index} for file ${fileName}.`);
  }

  return rows[index];
});