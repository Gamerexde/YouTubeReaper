import React, { Component } from 'react'

import styled from 'styled-components'

import { Nav } from 'react-bootstrap'

const NavigationBar = styled.div`
    background: #212121;
    a {
        color: #fff;
    }

    a:hover {
        background-color: #232323;
    }
`

class Navigation extends Component {
    render() {
        return (
            <NavigationBar>
                <Nav className="justify-content-center" activeKey="/home">
                    <Nav.Item>
                        <Nav.Link href="/home">Home</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="link-1">Settings</Nav.Link>
                    </Nav.Item>
                </Nav>
            </NavigationBar>
        )
    }
}


export default Navigation