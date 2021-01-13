import path from 'path'

export function parseTimemarkToSeconds(timemark: string, videoDuration: number): number {
    let hms = timemark
    let a = hms.split(':')
    let seconds = (+a[0] * 60 * 60 * 24) + (+a[1] * 60) + (+a[2])
    let percent = Math.round(Math.round(seconds) / videoDuration * 100)

    return percent

}

export function removeUnwantedChars(input: string) {
    return input.replace(/[^a-zA-Z ]/g, "")
}

export function parseSavePath(savePath: string, videoname: string, format: string) {
    return path.join(savePath, removeUnwantedChars(videoname) + "." + format.toLowerCase())
}

