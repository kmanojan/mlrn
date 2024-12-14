const {app, BrowserWindow , systemPreferences } = require('electron')
const { autoUpdater } = require("electron-updater");

let REDIRECT_URL = 'http://www.mouraeducation.com'

let mainWindow="";

function createWindow() {
 mainWindow = new BrowserWindow({
    webPreferences: {
       devTools: false,
      nodeIntegration: true
    },
    autoHideMenuBar: true,
    title:"Moura Education",
  })

  // Set the handler once here
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Define the URL pattern to allow
    const isYouTube = /^(https:\/\/(www\.)?youtube\.com|https:\/\/youtu\.be)/.test(url);
    return { action: isYouTube ? 'deny' : 'allow' };
  });

  mainWindow.on('close', function () {
    app.quit();
  })

  mainWindow.loadURL(REDIRECT_URL)
  mainWindow.setContentProtection(true);

  loadWindow= new BrowserWindow({
    width: 1000,
    height: 400,
    show: false,
    frame: false,
    backgroundColor: "#fff",
    title:"Moura Education",
    devTools: false,
  });
  
  loadWindow.removeMenu();
  deepLinkOpening();
  checkUpdate();

  // mainWindow.webContents.userAgent = "QVBwdGltdFMgVGTjaC8gQW91cmEgRWR1Y2F0aW9u";
  mainWindow.webContents.session.setPermissionCheckHandler(async (webContents, permission, details) => {
    console.log("permission",permission);
    return true
  })

  if (process.platform === 'darwin') {
    const permission = systemPreferences.askForMediaAccess("camera");
  }

  mainWindow.webContents.session.setPermissionRequestHandler((webCont, perm, callback, details) => {
    console.log('ChromePermissionRequest %s %O', perm, details);
    callback(true);
  });
}

app.on('ready', function(events,contents) {

})

app.whenReady().then(() => {
  createWindow();
})

app.on('close', function () {
  try {
    
    if (process.platform === 'darwin') {
      var forceQuit = false;
      app.on('before-quit', function() {
        forceQuit = true;
      });
    }
    app.quit();
  } catch (error) {
    app.quit();
  }
});


function deepLinkOpening(){
  //Deep Link Opening
  app.setAsDefaultProtocolClient('mouradesktop');
  app.on('open-url', (event, url) => {
    event.preventDefault();
    // Handle deep linking here
    mainWindow.webContents.send('deep-link', url);
  });
}

function checkUpdate(){
  autoUpdater.checkForUpdatesAndNotify();

  // Auto-updater events
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
  });

  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
  });

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded; will install in 5 seconds');
    // Here you might want to ask the user to restart
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 5000);
  });

  function sendStatusToWindow(text) {
    if (mainWindow) {
      mainWindow.webContents.send('message', text);
    }
  }
}
