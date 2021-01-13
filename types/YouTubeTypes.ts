import { videoFormat, videoInfo } from 'ytdl-core'

export interface downloadArguments { 
    url: string
    audioFormat: videoFormat | undefined
    videoFormat: videoFormat | undefined
    formatName: string
    videoInfo: videoInfo | null
    videoandaudio: boolean
    selectedAudioQuality: string
    selectedVideoQuality: string
}