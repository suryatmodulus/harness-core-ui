import { Button, Container, Layout, Tab, Tabs } from '@wings-software/uikit'
import React, { useState } from 'react'
import SplitPane, { Pane } from 'react-split-pane'
import css from './BuildPipelineGraphLayout.module.scss'

export enum BuildPipelineGraphLayoutType {
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
  FLOAT = 'FLOAT'
}

export interface BuildPipelineGraphLayoutProps {
  layoutType: BuildPipelineGraphLayoutType
  changeLayout: React.ReactElement
  stageSelect: React.ReactElement
  stagesPipeline: React.ReactElement
  stepsPipeline: React.ReactElement
  stepTitle: React.ReactElement | undefined
  stepTabs: { title: React.ReactElement; content: React.ReactElement | undefined }[]
  stepLogs: React.ReactElement
}

const BuildPipelineGraphLayout: React.FC<BuildPipelineGraphLayoutProps> = props => {
  const { layoutType, changeLayout, stageSelect, stagesPipeline, stepsPipeline, stepTitle, stepTabs, stepLogs } = props
  const [showStepDetails, setShowStepDetails] = useState<boolean>(true)

  switch (layoutType) {
    case BuildPipelineGraphLayoutType.FLOAT:
      return (
        <Container className={css.main}>
          <SplitPane size={250} split="horizontal" minSize={100}>
            <Pane className={css.canvas}>{stagesPipeline}</Pane>
            <Pane className={css.bottomPane}>
              <Container style={{ position: 'relative', flexGrow: 1 }}>
                <Container className={css.canvas}>
                  <Container className={css.stageSelect}>{stageSelect}</Container>
                  {stepsPipeline}
                </Container>
              </Container>
            </Pane>
          </SplitPane>
          {showStepDetails && (
            <Container className={css.floatingStepPanel}>
              <Layout.Vertical className={css.stepDetails}>
                <Container className={css.stepInfo}>
                  <div className={css.stepHeader}>
                    {stepTitle}
                    <div className={css.floatingRightToolbarContainer}>{changeLayout}</div>
                  </div>
                  <Tabs id={`ciStepTabs`}>
                    {stepTabs.map((item, idx) => {
                      return <Tab id={`ciStepTab_${idx}`} title={item.title} key={idx} panel={item.content}></Tab>
                    })}
                  </Tabs>
                </Container>
                <Container className={css.stepLogs}>{stepLogs}</Container>
              </Layout.Vertical>
            </Container>
          )}
          <Button
            className={css.floatingShowStepDetailsButton}
            onClick={() => {
              setShowStepDetails(!showStepDetails)
            }}
            rightIcon="issue"
          >
            Show step details
          </Button>
        </Container>
      )
    case BuildPipelineGraphLayoutType.BOTTOM:
      return (
        <Container className={css.main}>
          <SplitPane size={250} split="horizontal" minSize={100}>
            <Pane className={css.canvas}>{stagesPipeline}</Pane>
            <SplitPane split="horizontal" size={'50%'}>
              <Pane className={css.bottomPane}>
                <Container style={{ position: 'relative', flexGrow: 1 }}>
                  <Container className={css.canvas}>
                    <Container className={css.stageSelect}>{stageSelect}</Container>
                    {stepsPipeline}
                  </Container>
                </Container>
              </Pane>
              <Layout.Vertical className={css.detailsContainer}>
                <Layout.Horizontal className={css.stepsToolbar}>
                  {stepTitle}
                  <Tabs id={`ciStepTabs`}>
                    {stepTabs.map((item, idx) => {
                      return <Tab id={`ciStepTab_${idx}`} title={item.title} key={idx}></Tab>
                    })}
                  </Tabs>
                  <Container className={css.rowsRightToolbarContainer}>{changeLayout}</Container>
                </Layout.Horizontal>
                <Layout.Horizontal className={css.stepsDetailsAndLogs}>
                  {stepTabs[0].content}
                  {stepLogs}
                </Layout.Horizontal>
              </Layout.Vertical>
            </SplitPane>
          </SplitPane>
        </Container>
      )
    default:
      return (
        <Container className={css.main}>
          <SplitPane size={250} split="horizontal" minSize={100}>
            <Pane className={css.canvas}>{stagesPipeline}</Pane>
            <SplitPane split="vertical" size={'60%'}>
              <Pane className={css.bottomPane}>
                <Container style={{ position: 'relative', flexGrow: 1 }}>
                  <Container className={css.canvas}>
                    <Container className={css.stageSelect}>{stageSelect}</Container>
                    {stepsPipeline}
                  </Container>
                </Container>
              </Pane>
              <Pane className={css.stepDetailsPane}>
                <Layout.Vertical className={css.stepDetails}>
                  <Container className={css.stepInfo}>
                    <div className={css.stepHeader}>
                      {stepTitle}
                      <div className={css.floatingRightToolbarContainer}>{changeLayout}</div>
                    </div>
                    <Tabs id={`ciStepTabs`}>
                      {stepTabs.map((item, idx) => {
                        return <Tab id={`ciStepTab_${idx}`} title={item.title} key={idx} panel={item.content}></Tab>
                      })}
                    </Tabs>
                  </Container>
                  <Container className={css.stepLogs}>{stepLogs}</Container>
                </Layout.Vertical>
              </Pane>
            </SplitPane>
          </SplitPane>
        </Container>
      )
  }
}

export default BuildPipelineGraphLayout
