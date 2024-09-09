const { app, BrowserWindow, ipcMain, shell, screen } = require("electron");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const retroarchPath = path.resolve(__dirname, "../client/public/retroarch");
const romsPath = path.resolve(__dirname, "../client/public/roms");
const skraperPath = path.resolve(__dirname, "../client/public/Skraper-1.1.1");
const songsPath = path.resolve(__dirname, "../client/public/music");
const songsJsonOutput = path.resolve(
  __dirname,
  "../client/public/music/songs.json"
);
process.env.PATH += `${retroarchPath}`;

app.commandLine.appendSwitch("disable-http-cache");

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  mainWindow.setAspectRatio(16 / 9);
  mainWindow.setBackgroundColor("#101010");
  // mainWindow.maximize();
  mainWindow.loadURL("http://localhost:5173");

  const handleStartLoading = () => {
    mainWindow.webContents.send("loading", true);
  };

  mainWindow.webContents.on("did-start-loading", handleStartLoading);

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("activate-audio-provider");
    mainWindow.webContents.send("loading", false);

    mainWindow.webContents.removeListener(
      "did-start-loading",
      handleStartLoading
    );
  });

  ipcMain.handle("open-directory", async (event, emulator) => {
    try {
      await shell.openPath(`${romsPath}/${emulator}`);
    } catch (error) {
      console.error("Error opening directory:", error);
    }
  });

  ipcMain.on("set-window-mode", (event, mode) => {
    if (mode === "Fullscreen") {
      mainWindow.setFullScreen(true);
    } else if (mode === "Windowed") {
      mainWindow.setFullScreen(false);
      mainWindow.setResizable(true);
      mainWindow.setSize(1280, 720); // Adjust size as needed
    }
  });
};

const extractMetadata = async (filePath) => {
  try {
    const mm = await import("music-metadata");
    const metadata = await mm.parseFile(filePath);
    const { title, artist, bpm, picture } = metadata.common;
    let coverArt = null;

    if (picture && picture.length > 0) {
      coverArt = `data:${picture[0].format};base64,${Buffer.from(
        picture[0].data
      ).toString("base64")}`;
    }

    return {
      name: title || path.basename(filePath, ".mp3"),
      author: artist || "Unknown",
      bpm: bpm || "Unknown",
      coverArt,
      path: path.join("/music", path.basename(filePath)), // Relative path for the public folder
    };
  } catch (err) {
    console.error("Error reading metadata:", err);
    return null;
  }
};

app.whenReady().then(async () => {
  createWindow();

  fs.readdir(songsPath, async (err, files) => {
    if (err) {
      console.error("Error reading music folder:", err);
      return;
    }

    // Filter out only MP3 files
    const songs = files.filter(
      (file) => path.extname(file).toLowerCase() === ".mp3"
    );

    // Extract metadata for each song
    const songsJson = [];
    for (const file of songs) {
      const filePath = path.join(songsPath, file);
      const metadata = await extractMetadata(filePath);
      if (metadata) {
        songsJson.push(metadata);
      }
    }

    // Write JSON to file
    fs.writeFile(songsJsonOutput, JSON.stringify(songsJson, null, 2), (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
        return;
      }
      console.log("Songs JSON file saved successfully:", songsJsonOutput);
    });
  });
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("run-retroarch", (event, core, title, emulator) => {
  const command = `${retroarchPath}\\retroarch.exe`;
  const args = [
    "-L",
    `${retroarchPath}\\cores\\${core}_libretro.dll`,
    "-c",
    `${retroarchPath}\\retroarch.cfg`,
    `${romsPath}\\${emulator}\\${title}`,
  ];

  const retroarchProcess = spawn(command, args, {
    shell: false,
  });

  retroarchProcess.on("close", (code) => {
    console.log(`RetroArch process exited with code ${code}`);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    mainWindow.webContents.send("retroarch-closed", code);
  });
});

ipcMain.on("run-skraper", () => {
  const command = `${skraperPath}\\SkraperUI.exe`;

  const skraperProcess = spawn(command, {
    shell: false,
  });

  skraperProcess.on("close", (code) => {
    console.log(`Skraper process exited with code ${code}`);
    const mainWindow = BrowserWindow.getAllWindows()[0];
    mainWindow.webContents.send("skraper-closed", code);
  });
});

ipcMain.on("close-app", () => {
  app.quit();
});
