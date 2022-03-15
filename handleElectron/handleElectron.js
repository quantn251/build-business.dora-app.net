function handleIpcMain(ipcMain, autoUpdater) {
  ipcMain.on("system", (event, args) => {
    console.log(1);
    if (args === "checkUpdate") {
      console.log(2);
      // Sử dụng cho môi trường dev
      if (process.env.ELECTRON_START_URL) {
        const data = {
          provider: "github",
          owner: "quantn251",
          repo: "production-dora-phan-mem-ban-hang-tokyo-gateaux",
          token: "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",
          private: true,
        };
        autoUpdater.setFeedURL(data);
      }
      autoUpdater.checkForUpdates();
    }
  });
}

function handleAutoUpdater(win, autoUpdater) {
  autoUpdater.on("checking-for-update", () => {
    win.webContents.send("system", {
      status: "checkingForUpdate",
      text: "Đang kiểm tra phiên bản phần mềm",
    });
  });

  autoUpdater.on("update-available", (info) => {
    win.webContents.send("system", {
      status: "updateAvailable",
      text: "Phần mềm có phiên bản mới: " + info.version,
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    win.webContents.send("system", {
      status: "updateNotAvailable",
      text: "Phần mềm đã sử dụng phiên bản mới nhất: " + info.version,
    });
  });

  autoUpdater.on("error", (err) => {
    win.webContents.send("system", {
      status: "error",
      text: "Không thể kiểm tra phiên bản mới của phần mềm ( lỗi kết nối máy chủ )!!!!",
    });
  });

  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + " - Downloaded " + progressObj.percent + "%";
    log_message =
      log_message +
      " (" +
      progressObj.transferred +
      "/" +
      progressObj.total +
      ")";
    win.webContents.send("system", {
      status: "downloadProgress",
      text: "Đang tải phiên bản mới nhất: " + log_message,
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    win.webContents.send("system", {
      status: "updateDownloaded",
      text: "Tải phiên bản mới nhất thành công, phần mềm sẽ tự động thoát và khởi động lại để update!",
    });
    autoUpdater.quitAndInstall();
  });
}

module.exports = {
  handleIpcMain,
  handleAutoUpdater,
};
