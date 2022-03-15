/* eslint-disable no-unused-vars */
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const {
  default: installExtension,
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} = require('electron-devtools-installer');
const os = require('os');

const Store = require('electron-store');
const store = new Store();

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let template = [];
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about',
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        },
      },
    ],
  });
}

let win;

function createDefaultWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, '/preload/preload.js'),
    },
  });

  win.on('closed', () => {
    win = null;
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });
  win.loadURL(startUrl);

  // Khi nào build sản phẩm thì xóa comment
  // Open the DevTools.
  if (process.env.ELECTRON_START_URL) {
    win.webContents.once('dom-ready', async () => {
      await installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err))
        .finally(() => {
          win.webContents.openDevTools({ mode: 'detach' });
        });
    });
  }
  return win;
}

app.on('ready', function () {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createDefaultWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('system', (event, args) => {
  if (args === 'checkUpdate') {
    // Sử dụng cho môi trường dev
    if (process.env.ELECTRON_START_URL) {
      const data = {
        provider: 'github',
        owner: 'quantn251',
        repo: 'production-dora-phan-mem-ban-hang-tokyo-gateaux',
        token: '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',
        private: true,
      };
      autoUpdater.setFeedURL(data);
    }
    autoUpdater.checkForUpdates();
  }
});

autoUpdater.on('checking-for-update', () => {
  win.webContents.send('system', {
    status: 'checkingForUpdate',
    text: 'Đang kiểm tra phiên bản phần mềm',
  });
});

autoUpdater.on('update-available', (info) => {
  win.webContents.send('system', {
    status: 'updateAvailable',
    text: 'Phần mềm có phiên bản mới: ' + info.version,
  });
});

autoUpdater.on('update-not-available', (info) => {
  win.webContents.send('system', {
    status: 'updateNotAvailable',
    text: 'Phần mềm đã sử dụng phiên bản mới nhất: ' + info.version,
  });
  win.webContents.send('system', {
    status: 'appVersion',
    text: info.version,
  });
});

autoUpdater.on('error', () => {
  win.webContents.send('system', {
    status: 'error',
    text: 'Không thể kiểm tra phiên bản mới của phần mềm ( lỗi kết nối máy chủ )!!!!',
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = 'Download speed: ' + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  win.webContents.send('system', {
    status: 'downloadProgress',
    text: 'Đang tải phiên bản mới nhất: ' + log_message,
  });
});

autoUpdater.on('update-downloaded', () => {
  win.webContents.send('system', {
    status: 'updateDownloaded',
    text: 'Tải phiên bản mới nhất thành công, phần mềm sẽ tự động thoát và khởi động lại để update!',
  });
  autoUpdater.quitAndInstall();
});

// Handle Storage file - lowdb
ipcMain.handle('storage', async (event, args) => {
  // appToken
  if (args.action === 'getAppToken') {
    const appToken = await store.get('appToken');
    return appToken;
  }
  if (args.action === 'getTokenForAppList') {
    const tokenForAppList = await store.get('tokenForAppList');
    return tokenForAppList;
  }
  // tokenForApp
  if (args.action === 'setAppToken') {
    store.set('appToken', args.values.appToken);
  }
  if (args.action === 'pushTokenForApp') {
    const tokenForAppList = await store.get('tokenForAppList');
    if (tokenForAppList === undefined || tokenForAppList === null) {
      store.set('tokenForAppList', [args.values]);
    } else {
      const newTokenForAppList = [...tokenForAppList, args.values];
      store.set('tokenForAppList', newTokenForAppList);
    }
  }
  if (args.action === 'setTokenForAppList') {
    store.set('tokenForAppList', args.values.tokenForAppList);
  }
  if (args.action === 'updateUser') {
    let tokenForAppList = await store.get('tokenForAppList');
    let index = args.values.index;
    let user = args.values.user;
    tokenForAppList[index] = user;
    store.set('tokenForAppList', tokenForAppList);
  }
});
