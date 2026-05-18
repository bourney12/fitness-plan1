const { app, BrowserWindow, shell } = require("electron");
const { server, startServer } = require("./server");

let mainWindow;

async function createWindow() {
  await startServer(0);
  const address = server.address();
  const port = address && address.port ? address.port : 5173;

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 860,
    minWidth: 390,
    minHeight: 700,
    backgroundColor: "#05080f",
    title: "ReBourne",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`http://localhost:${port}/`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
