import React, { Component, ChangeEvent, SyntheticEvent, FormEvent } from 'react'
import { render } from 'react-dom'
import electron, { ipcRenderer } from 'electron'

import ytdl from 'ytdl-core'

import Home from './routes/Home'

import 'bootstrap/dist/css/bootstrap.min.css'

import AppHeader from './components/Header';

import Settings from './routes/Settings';

import { Routes } from '../types/PropsTypes'
import { Alert } from 'react-bootstrap'
import { truncate } from 'fs'
import { downloadArguments } from '../types/YouTubeTypes'

const mainElement = document.createElement('div')
mainElement.setAttribute('id', 'root')
document.body.appendChild(mainElement)


interface IProps {
}
interface IState {
  route: Routes

  url: string
  format: string

  submitButtonStatus: string

  resultError: boolean

  result: ytdl.videoInfo | null

  resultVideoFormats: ytdl.videoFormat[] | null
  resultAudioFormats: ytdl.videoFormat[] | null

  resultType: "video" | "audio" | ""

  selectedAudioQuality: string
  selectedVideoQuality: string

  downloadButtonStatus: string
  downloadPercent: number

  savePath: string
}

class App extends Component<IProps, IState> {

  constructor(props: Readonly<IProps>) {
    super(props)

    this.state = {
      route: "home",
      url: "",
      format: "MP3",

      submitButtonStatus: "normal",

      resultError: false,

      result: null,

      resultAudioFormats: null,
      resultVideoFormats: null,

      resultType: "",

      selectedAudioQuality: "",
      selectedVideoQuality: "",

      downloadButtonStatus: "normal",
      downloadPercent: 0,
      savePath: ""
    }

    this.changeRoute = this.changeRoute.bind(this)

    this.handleUrlChange = this.handleUrlChange.bind(this)
    this.handleFormatChange = this.handleFormatChange.bind(this)
    this.submitUrl = this.submitUrl.bind(this)

    this.handleSelectAudioQuality = this.handleSelectAudioQuality.bind(this)
    this.handleSelectVideoQuality = this.handleSelectVideoQuality.bind(this)

    this.submitDownload = this.submitDownload.bind(this)
    this.setSavePath = this.setSavePath.bind(this)

  }

  componentDidMount() {
    ipcRenderer.send('download-progress-send', 'ping')

    ipcRenderer.on('download-progress-response', (event, arg) => {
      this.setState({ downloadPercent: arg})
      new Promise<void>((resolve) => { setTimeout(resolve, 100); }).then(() => {
        ipcRenderer.send('download-progress-send', 'ping')
      });
    })

    ipcRenderer.invoke('get-save-path').then((result) => {
      this.setState({ savePath: result})
    })
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners('download-progress-response')
  }

  setSavePath() {
    ipcRenderer.invoke('set-save-path').then((result) => {
      this.setState({ savePath: result})
    })
  }

  handleUrlChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ url: event.currentTarget.value})
  }
  
  handleFormatChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ format: event.currentTarget.value})
  }

  submitUrl(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    if (this.state.submitButtonStatus === "retry") {
      ipcRenderer.invoke('download-progress-reset')

      this.setState({ submitButtonStatus: "normal", result: null, selectedAudioQuality: "", selectedVideoQuality: ""})
      return;
    }

    this.setState({ submitButtonStatus: "loading", resultError: false})

    ipcRenderer.invoke('search-youtube-url', this.state.url).then((result: ytdl.videoInfo | null) => {
      let filteredAudioFormats: ytdl.videoFormat[] = [];
      let filteredVideoFormats: ytdl.videoFormat[] = [];

      if (result === null) {
        this.setState({ submitButtonStatus: "normal", resultError: true})
        return;
      }


      if (this.state.format === "MP3" || this.state.format === "M4A") {
        this.setState({resultType: "audio"})
        filteredAudioFormats = ytdl.filterFormats(result.formats, 'audioonly')
      } else if (this.state.format === "MP4" || this.state.format === "AVI") {
        this.setState({resultType: "video"})
        filteredVideoFormats = ytdl.filterFormats(result.formats, 'videoonly')
        filteredAudioFormats = ytdl.filterFormats(result.formats, 'audioonly')
      }

      this.setState({ submitButtonStatus: "retry", result: result, resultAudioFormats: filteredAudioFormats, resultVideoFormats: filteredVideoFormats})
    })
  }

  changeRoute(route: Routes) {
    this.setState({ route: route})
  }

  handleSelectAudioQuality(event: FormEvent<HTMLInputElement>) {
    this.setState({ selectedAudioQuality: event.currentTarget.value })
  }

  handleSelectVideoQuality(event: FormEvent<HTMLInputElement>) {
    this.setState({ selectedVideoQuality: event.currentTarget.value })
  }

  async submitDownload(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    this.setState({ downloadButtonStatus: "downloading"})

    if (this.state.format === "MP3" || this.state.format === "M4A") {
      if (this.state.selectedAudioQuality === "") {
        this.setState({ downloadButtonStatus: "normal" })
        return
      }
      if (this.state.resultAudioFormats === null) {
        this.setState({ downloadButtonStatus: "normal" })
        return;
      }

      let audioFormat = ytdl.chooseFormat(this.state.resultAudioFormats, { quality: this.state.selectedAudioQuality })

      ipcRenderer.send('download-progress-send', 'start')

      const downloadOptions: downloadArguments = { 
        audioFormat: audioFormat, 
        videoFormat: undefined,
        formatName: this.state.format, 
        url: this.state.url, 
        videoInfo: this.state.result, 
        videoandaudio: false,
        selectedAudioQuality: this.state.selectedAudioQuality,
        selectedVideoQuality: ""
      }

      try {
        await ipcRenderer.invoke('start-download', downloadOptions).then((result) => {
          this.setState({ downloadButtonStatus: "normal" })
        })
      } catch (e) {
        this.setState({ downloadButtonStatus: "normal" })
      }
      
    }

    if (this.state.format === "MP4" || this.state.format === "AVI") {
      if (this.state.selectedAudioQuality === "" || this.state.selectedVideoQuality === "") {
        this.setState({ downloadButtonStatus: "normal" })
        return
      }
      if (this.state.resultAudioFormats === null || this.state.resultVideoFormats === null) {
        this.setState({ downloadButtonStatus: "normal" })
        return;
      }

      let audioFormat = ytdl.chooseFormat(this.state.resultAudioFormats, { quality: this.state.selectedAudioQuality })
      let videoFormat = ytdl.chooseFormat(this.state.resultVideoFormats, { quality: this.state.selectedVideoQuality })

      ipcRenderer.send('download-progress-send', 'start')

      const downloadOptions: downloadArguments = { 
        audioFormat: audioFormat, 
        videoFormat: videoFormat,
        formatName: this.state.format, 
        url: this.state.url, 
        videoInfo: this.state.result, 
        videoandaudio: true,
        selectedAudioQuality: this.state.selectedAudioQuality,
        selectedVideoQuality: this.state.selectedAudioQuality
      }

      try {
        await ipcRenderer.invoke('start-download', downloadOptions).then((result) => {
          this.setState({ downloadButtonStatus: "normal" })
        })
      } catch (e) {
        this.setState({ downloadButtonStatus: "normal" })
      }
      
    }
  }

  render() {

    return (
      <AppHeader changeRoute={this.changeRoute} downloadPercent={this.state.downloadPercent}>
        {this.state.route === 'home' && 
          <Home handleUrlChange={this.handleUrlChange} 
                url={this.state.url} 
                handleFormatChange={this.handleFormatChange} 
                format={this.state.format}
                submitUrl={this.submitUrl}
                submitButtonStatus={this.state.submitButtonStatus}
                result={this.state.result}
                resultError={this.state.resultError}
                resultAudioFormats={this.state.resultAudioFormats}
                resultVideoFormats={this.state.resultVideoFormats}
                resultType={this.state.resultType}
                handleSelectAudioQuality={this.handleSelectAudioQuality}
                handleSelectVideoQuality={this.handleSelectVideoQuality}

                selectedAudioQuality={this.state.selectedAudioQuality}
                selectedVideoQuality={this.state.selectedVideoQuality}
                submitDownload={this.submitDownload}
                downloadButtonStatus={this.state.downloadButtonStatus}
          />
        }
        {this.state.route === 'settings' && 
          <Settings setSavePath={this.setSavePath}
                    savePath={this.state.savePath} 
                    downloadButtonStatus={this.state.downloadButtonStatus}

        />
        }
      </AppHeader>
    )
  }
}

render(<App />, mainElement)
