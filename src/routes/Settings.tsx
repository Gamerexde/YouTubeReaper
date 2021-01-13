import React, { Component } from 'react'
import electron from 'electron'

const shell = electron.shell

import { Tabs, Tab, Card, Container, Form, Row, Col, Button } from 'react-bootstrap'

interface IProps {
    setSavePath(): void
    savePath: string
    downloadButtonStatus: string
}
interface IState {}

class Settings extends Component<IProps, IState> {
    render() {
        return (
            <>
                <Container style={{ paddingTop: "6rem" }}>
                    <Tabs defaultActiveKey="general" id="uncontrolled-tab-example">
                        <Tab eventKey="general" title="General">
                            <Card style={{ position: "unset" }}>
                                <Card.Body>
                                    <Form>
                                        <Form.Group controlId="formBasicEmail">
                                            <Form.Label>Save folder path</Form.Label>
                                            <Form.Row>
                                                <Col xs lg={"auto"}>
                                                    <Button variant="primary" disabled={this.props.downloadButtonStatus !== "normal"} onClick={this.props.setSavePath}>Set path</Button>
                                                </Col>
                                                <Col>
                                                    <Form.Control disabled placeholder="" value={this.props.savePath} />
                                                </Col>
                                            </Form.Row>
                                            <Form.Text className="text-muted">
                                                The default path where YouTube Reaper will save all downloaded files.
                                            </Form.Text>
                                        </Form.Group>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Tab>
                        <Tab eventKey="appearance" disabled title="Appearance">
                        </Tab>
                    </Tabs>
                </Container>
            </>
        )
    }
}

export default Settings
