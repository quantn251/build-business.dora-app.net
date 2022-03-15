const path = require("path");
const url = require("url");
const { app, BrowserWindow, ipcMain, Notification, Menu } = require("electron");
const {
  default: installExtension,
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} = require("electron-devtools-installer");

const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

const data = {
  provider: "github",
  owner: "quantn251",
  repo: "production-dora-phan-mem-ban-hang-tokyo-gateaux",
};

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: true,
      preload: path.join(__dirname, "/preload/preload.js"),
    },
    autoHideMenuBar: true,
  });

  win.on("focus", () => {
    // App is onscreen
  });

  win.on("blur", () => {
    // App is background
  });

  // and load the index.html of the app.
  // win.loadFile("index.html");
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, "/../build/index.html"),
      protocol: "file:",
      slashes: true,
    });
  win.loadURL(startUrl);

  // Open the DevTools.
  if (process.env.ELECTRON_START_URL) {
    win.webContents.once("dom-ready", async () => {
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log("An error occurred: ", err))
        .finally(() => {
          win.webContents.openDevTools({ mode: "detach" });
        });
    });
  }

  if (process.platform === "win32") {
    app.setAppUserModelId("Phần mềm bán hàng Tokyo Gâteaux");
  }

  autoUpdater.checkForUpdates();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
