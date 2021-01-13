import React, { Component } from 'react'

import electron, { ipcRenderer } from 'electron'

const remote = electron.remote

const window = remote.getCurrentWindow()

import styled from 'styled-components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faSquare, faWindowMinimize } from '@fortawesome/free-solid-svg-icons'
import { faSquare as faSquareRegular } from '@fortawesome/free-regular-svg-icons'

import { ProgressBar } from 'react-bootstrap'

import { Nav, Alert, Container } from 'react-bootstrap'
import { GlobalStyle } from '../styles/GlobalStyle'

import { Routes } from '../../types/PropsTypes'

const Header = styled.div`
    display: block;
    height: 32px;
    width: calc(100%);
    background: #212121;
    padding: 4px;
`
const Title = styled.div`
    grid-column: 1;
    display: flex;
    align-items: center;
    margin-left: 8px;
    overflow: hidden;
    font-family: "Segoe UI", sans-serif;
    font-size: 12px;
    color: #fff;
`

const TitleSpan = styled.span`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.5;
    user-select: none;
`

const WindowControls = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 46px);
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    -webkit-app-region: no-drag;
`

const WindowButton = styled.div`
    grid-row: 1 / span 1;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    &:hover {
        background: rgba(255,255,255,0.1);
    }
`

const Drag = styled.div`
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
    display: grid;
    grid-template-columns: auto 138px;
`

const NavigationBar = styled.div`
    background: #212121;
    a {
        color: #fff;
    }

    a:hover {
        background-color: #232323;
    }
`


interface IProps {
    changeRoute(routes: Routes): void

    downloadPercent: number
}
interface IState {
    isMaximized: boolean
}

class AppHeader extends Component<IProps, IState> {

    constructor(props: any) {
        super(props)

        this.state = {
            isMaximized: false
        }

        this.maximizeWindow = this.maximizeWindow.bind(this)
    }

    closeWindow() {
        window.close()
    }

    async maximizeWindow() {
        const windowStatus: boolean = await ipcRenderer.invoke('get-window-status')

        if (windowStatus) {
            window.unmaximize()
            this.setState({ isMaximized: false })
            return;
        } else {
            window.maximize()
            this.setState({ isMaximized: true })
        }
    }

    minimizeWindow() {
        window.minimize()
    }

    render() {
        return (
            <>
                <GlobalStyle />
                <Header className="fixed-top">
                    <Drag>
                        <Title>
                            <TitleSpan>YouTube Reaper</TitleSpan>
                        </Title>
                        <WindowControls>
                            <WindowButton style={{ gridColumn: 1 }} onClick={this.minimizeWindow}>
                                <FontAwesomeIcon icon={faWindowMinimize} color="white" />
                            </WindowButton>
                            <WindowButton style={{ gridColumn: 2 }} onClick={this.maximizeWindow}>
                                <FontAwesomeIcon icon={faSquareRegular} color="white" />
                            </WindowButton>
                            <WindowButton style={{ gridColumn: 3 }} onClick={this.closeWindow}>
                                <FontAwesomeIcon icon={faTimes} color="white" />
                            </WindowButton>
                        </WindowControls>
                    </Drag>
                    <NavigationBar>
                        <Nav className="justify-content-center">
                            <Nav.Item>
                                <Nav.Link href='javascript:void(0)' onClick={() => {
                                    this.props.changeRoute("home")
                                }}>Home</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link href='javascript:void(0)' onClick={() => {
                                    this.props.changeRoute("settings")
                                }}>Settings</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </NavigationBar>
                    <ProgressBar now={this.props.downloadPercent} />
                </Header>
                {this.props.children}
            </>
        )
    }
}

export default AppHeader