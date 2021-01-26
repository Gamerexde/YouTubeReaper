import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs'
import * as util from 'util'
import * as stream from 'stream'
import ytdl, { videoFormat, videoInfo } from 'ytdl-core'

import ffmpeg from 'fluent-ffmpeg'

import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer'

import { parseTimemarkToSeconds, parseSavePath } from './utils/parsers'
import { downloadArguments } from '../types/YouTubeTypes';

const pipeline = util.promisify(stream.pipeline)

let mainWindow: Electron.BrowserWindow | null

let isMaximized = false

let savePath = path.join(app.getPath("documents"), "YouTubeReaper")
let ffmpegPath = ""

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    frame: false,
    backgroundColor: "#1b1b1b",
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:4000')
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, 'renderer/index.html'),
        protocol: 'file:',
        slashes: true
      })
    )
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('minimize', () => {
    isMaximized = false
  })

  mainWindow.on('unmaximize', () => {
    isMaximized = false
  })

  mainWindow.on('maximize', () => {
    isMaximized = true
  })
}

app.on('ready', createWindow)
  .whenReady()
  .then(() => {

    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath)
    }

    if (process.env.NODE_ENV === 'development') {
      ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg')
      installExtension(REACT_DEVELOPER_TOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err))
      installExtension(REDUX_DEVTOOLS)
        .then((name) => console.log(`Added Extension:  ${name}`))
        .catch((err) => console.log('An error occurred: ', err))
    } else {
      ffmpegPath = path.join(__dirname, '..', 'node_modules', 'ffmpeg-static', 'ffmpeg').replace(
        "app.asar", "app.asar.unpacked"
      )
    }

    ffmpeg.setFfmpegPath(ffmpegPath)
  }
  )

let downloadPercent = 0

ipcMain.handle('get-window-status', async (event) => {
  return isMaximized
})

ipcMain.handle('get-save-path', async (event) => {
  return savePath
})

ipcMain.handle('set-save-path', async (event) => {
  var path = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (path.canceled) {
    return savePath
  }

  savePath = path.filePaths[0]

  return savePath
})

ipcMain.handle('get-ffmpeg-path', async (event) => {
  return ffmpegPath
})

ipcMain.handle('search-youtube-url', async (event, args) => {
  let info: ytdl.videoInfo | null

  try {
    info = await ytdl.getInfo(args)
  } catch (e) {
    return null
  }

  return info
})


ipcMain.on('download-progress-send', (event) => {
  event.reply('download-progress-response', downloadPercent)
})

ipcMain.handle('download-progress-reset', async (event, args: downloadArguments) => {
  downloadPercent = 0
  return;
})

ipcMain.handle('start-download', async (event, args: downloadArguments) => {
  downloadPercent = 0

  if (args.videoInfo === null) {
    return;
  }

  let videoName = args.videoInfo.videoDetails.title
  let videoDuration = parseInt(args.videoInfo.videoDetails.lengthSeconds)

  if (args.videoandaudio) {
    if (args.audioFormat !== undefined || args.videoFormat !== undefined) {
      await pipeline(
        ytdl(args.url, { format: args.audioFormat }),
        fs.createWriteStream(path.join(app.getPath("temp"), "audio." + args.audioFormat?.container))
      )

      downloadPercent = 30

      await pipeline(
        ytdl(args.url, { format: args.videoFormat }),
        fs.createWriteStream(path.join(app.getPath("temp"), "video." + args.videoFormat?.container))
      )
      downloadPercent = 80

      switch (args.formatName) {
        case "MP4":
          await ffmpegCombineMP4andMP3(args.audioFormat?.container, args.videoFormat?.container, args.videoInfo.videoDetails.title)
          break;
        case "AVI":
          await ffmpegCombineAVIandMP3(args.audioFormat?.container, args.videoFormat?.container, args.videoInfo.videoDetails.title)
          break;
      }

      await new Promise<void>((resolve, reject) => {
        fs.unlink(path.join(app.getPath("temp"), "audio." + args.audioFormat?.container), (err) => {
          if (err) {
            reject()
          }
          resolve()
        })
      })

      await new Promise<void>((resolve, reject) => {
        fs.unlink(path.join(app.getPath("temp"), "video." + args.videoFormat?.container), (err) => {
          if (err) {
            reject()
          }
          resolve()
        })
      })

    }
  } else {
    if (args.audioFormat !== null) {
      switch (args.formatName) {
        case "MP3":
          await ffmpegMP4toMP3(args.audioFormat, args.videoInfo.videoDetails.title, args.url, videoDuration)
          break;
        case "M4A":
          await ffmpegMP4toM4A(args.audioFormat, args.videoInfo.videoDetails.title, args.url, videoDuration)
          break;
      }
    }
  }
})

async function ffmpegMP4toM4A(audioFormat: ytdl.videoFormat | undefined, videoName: string, url: string, videoDuration: number) {
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg({ source: ytdl(url, { format: audioFormat }) })
        .toFormat('m4a')
        .audioCodec("copy")
        .on('end', () => {
          resolve()
        })
        .on('progress', (progress) => {
          const percent = parseTimemarkToSeconds(progress.timemark, videoDuration)

          downloadPercent = percent
        })
        .on('error', (err) => {
          reject()
        })
        .pipe(fs.createWriteStream(parseSavePath(savePath, videoName, "m4a")))
    })
  } catch (e) {
    return;
  }
}

async function ffmpegMP4toMP3(audioFormat: ytdl.videoFormat | undefined, videoName: string, url: string, videoDuration: number) {
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg({ source: ytdl(url, { format: audioFormat }) })
        .toFormat('mp3')
        .audioCodec("libmp3lame")
        .on('end', () => {
          resolve()
        })
        .on('progress', (progress) => {
          const percent = parseTimemarkToSeconds(progress.timemark, videoDuration)

          downloadPercent = percent
        })
        .on('error', (err) => {
          reject()
        })
        .pipe(fs.createWriteStream(parseSavePath(savePath, videoName, "mp3")))
    })
  } catch (e) {
    return;
  }
}


async function ffmpegCombineMP4andMP3(audioContainer: string | undefined, videoContainer: string | undefined, videoName: string) {
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(path.join(app.getPath("temp"), 'video' + "." + videoContainer))
        .videoCodec("copy")
        .addInput(path.join(app.getPath("temp"), 'audio' + "." + audioContainer))
        .audioCodec("libmp3lame")
        .toFormat("mp4")
        .saveToFile(parseSavePath(savePath, videoName, "mp4"))
        .on('end', () => {
          resolve()
          downloadPercent = 100
        })
        .on('error', (err) => {
          reject()
        })
    })
  } catch (e) {
    return;
  }
}

async function ffmpegCombineAVIandMP3(audioContainer: string | undefined, videoContainer: string | undefined, videoName: string) {
  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(path.join(app.getPath("temp"), 'video' + "." + videoContainer))
        .videoCodec("copy")
        .addInput(path.join(app.getPath("temp"), 'audio' + "." + audioContainer))
        .audioCodec("libmp3lame")
        .fromFormat("webm")
        .toFormat("avi")
        .saveToFile(parseSavePath(savePath, videoName, "avi"))
        .on('end', () => {
          resolve()
          downloadPercent = 100
        })
        .on('error', (err) => {
          reject()
        })
    })
  } catch (e) {
    return;
  }
}


app.allowRendererProcessReuse = true
