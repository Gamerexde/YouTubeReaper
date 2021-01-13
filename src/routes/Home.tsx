import React, { Component, ChangeEvent, SyntheticEvent, FormEvent } from 'react'
import ytdl from 'ytdl-core'

import { Form, Button, Card, Container, Row, Col, Nav } from 'react-bootstrap'
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons'

interface IProps {
    handleUrlChange(event: ChangeEvent<HTMLInputElement>): void
    handleFormatChange(event: ChangeEvent<HTMLInputElement>): void
    submitUrl(event: SyntheticEvent<HTMLFormElement>): void

    handleSelectAudioQuality(event: FormEvent<HTMLInputElement>): void
    handleSelectVideoQuality(event: FormEvent<HTMLInputElement>): void

    submitDownload(event: SyntheticEvent<HTMLFormElement>): void

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
}
interface IState { }

class Home extends Component<IProps, IState> {
    render() {
        return (
            <>
                <Container style={{ paddingTop: "6rem" }}>
                    <Card style={{ position: "unset" }}>
                        <Card.Body>
                            <Form onSubmit={this.props.submitUrl}>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>YouTube Video URL</Form.Label>
                                    <Form.Control name="url" type="text" onChange={this.props.handleUrlChange} value={this.props.url} placeholder="Enter URL" disabled={this.props.submitButtonStatus !== "normal"} />
                                    <Form.Text className="text-muted">
                                        Copy the URL from the video you wish to download from YouTube and paste it here.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Row>
                                    <Form.Group as={Col} md={4} controlId="formGridState">
                                        <Form.Label>Select Format</Form.Label>
                                        <Form.Control as="select" onChange={this.props.handleFormatChange} value={this.props.format} disabled={this.props.submitButtonStatus !== "normal"}>
                                            <option disabled>Only Audio</option>
                                            <option>MP3</option>
                                            <option>M4A</option>
                                            <option disabled>Video and Audio</option>
                                            <option>MP4</option>
                                            <option>AVI</option>
                                        </Form.Control>
                                        <Form.Text className="text-muted">
                                            Select the format in which the video will be saved as.
                                    </Form.Text>
                                    </Form.Group>
                                </Form.Row>

                                {this.props.resultError &&
                                    <p className="text-danger">Invalid YouTube URL</p>
                                }

                                <SubmitButton submitButtonStatus={this.props.submitButtonStatus} downloadButtonStatus={this.props.downloadButtonStatus} />
                            </Form>
                        </Card.Body>
                    </Card>
                </Container>

                {this.props.result !== null &&
                    <Container style={{ paddingTop: "3rem" }}>
                        <Card style={{ position: "unset" }}>
                            <Card.Title className="text-center">{this.props.result.videoDetails.title}</Card.Title>
                            <Card.Body>
                                <Form onSubmit={this.props.submitDownload}>
                                    <fieldset>
                                        <Form.Group>
                                            <Form.Label as="legend">
                                                Select Quality
                                            </Form.Label>
                                            <Row>
                                                <SelectVideoBitrate
                                                    resultVideoFormats={this.props.resultVideoFormats}
                                                    handleSelectVideoQuality={this.props.handleSelectVideoQuality}
                                                    downloadButtonStatus={this.props.downloadButtonStatus}
                                                    resultType={this.props.resultType}
                                                />
                                                <SelectAudioBitrate
                                                    resultAudioFormats={this.props.resultAudioFormats}
                                                    handleSelectAudioQuality={this.props.handleSelectAudioQuality}
                                                    downloadButtonStatus={this.props.downloadButtonStatus}
                                                    resultType={this.props.resultType}
                                                />
                                            </Row>
                                        </Form.Group>
                                    </fieldset>

                                    <DownloadButton downloadButtonStatus={this.props.downloadButtonStatus} />
                                </Form>
                            </Card.Body>
                        </Card>
                    </Container>
                }
            </>
        )
    }
}

interface ISelectAudioBitrateProps { 
    resultAudioFormats: ytdl.videoFormat[] | null
    resultType: "video" | "audio" | ""
    handleSelectAudioQuality(event: FormEvent<HTMLInputElement>): void
    downloadButtonStatus: string
}

function SelectAudioBitrate(props: ISelectAudioBitrateProps) {
    if (props.resultType === "audio" || props.resultType === "video") {
        return (
            <Col>
                <p><strong>Audio Quality</strong></p>
                {props.resultAudioFormats?.map((value: ytdl.videoFormat, key: number) => {
                    return (
                        <Form.Check
                            key={key}
                            type="radio"
                            label={"Bitrate: " + value.audioBitrate + " bits"}
                            value={value.itag}
                            onChange={props.handleSelectAudioQuality}
                            name="audioSelector"
                            disabled={props.downloadButtonStatus !== "normal"}
                        />
                    )
                })}
            </Col>
        )
    }
    return (<div></div>)
}

interface ISelectVideoBitrateProps { 
    resultVideoFormats: ytdl.videoFormat[] | null
    resultType: "video" | "audio" | ""
    handleSelectVideoQuality(event: FormEvent<HTMLInputElement>): void
    downloadButtonStatus: string
}

function SelectVideoBitrate(props: ISelectVideoBitrateProps) {
    if (props.resultType === "video") {
        const filterVideo = props.resultVideoFormats?.filter((value) => {
            if (value.mimeType?.split(";")[0] === "video/webm") {
                return true
            }
            return false
        })
        return (
            <Col>
                <p><strong>Video Quality</strong></p>
                {filterVideo?.map((value: ytdl.videoFormat, key: number) => {
                    return (
                        <Form.Check
                            key={key}
                            type="radio"
                            label={"Quality: " + value.qualityLabel + " " + value.fps + "fps" + " Bitrate: " + value.bitrate + " bits" + " " + value.mimeType?.split(";")[0]}
                            value={value.itag}
                            onChange={props.handleSelectVideoQuality}
                            name="videoSelector"
                            disabled={props.downloadButtonStatus !== "normal"}
                        />
                    )
                })}
            </Col>
        )
    }
    return (<div></div>)
}

function DownloadButton(props: any) {
    switch (props.downloadButtonStatus) {
        case "downloading":
            return (
                <Button disabled variant="secondary" type="submit">
                    Downloading...
                </Button>
            )
        default:
            return (
                <Button variant="secondary" type="submit">
                    Download
                </Button>
            )
    }
}

function SubmitButton(props: any) {
    switch (props.submitButtonStatus) {
        case "loading":
            return (
                <Button disabled variant="primary" type="submit">
                    Loading...
                </Button>
            )
        case "retry":
            return (
                <Button variant="secondary" disabled={props.downloadButtonStatus !== "normal"} type="submit">
                    Retry
                </Button>
            )
        default:
            return (
                <Button variant="primary" type="submit">
                    Search
                </Button>
            )
    }
}

export default Home
