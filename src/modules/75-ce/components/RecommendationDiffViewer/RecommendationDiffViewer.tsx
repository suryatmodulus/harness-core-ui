import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import type { ResourceDetails, ResourceObject } from '@ce/types'

import css from './RecommendationDiffViewer.module.scss'

interface DiffBlockProps {
  text: string
  color: string
  textColor: string
  resources: ResourceDetails
  showLeftBorder?: boolean
}

const DiffBlock: React.FC<DiffBlockProps> = ({ text, color, resources, textColor, showLeftBorder }) => {
  const innerElement = (
    <>
      <Text>{text}:</Text>
      <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
        <Text>memory:</Text>
        <Text color={textColor} padding={{ left: 'xsmall' }}>
          {resources.memory}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal padding={{ left: 'medium', top: 'xsmall' }}>
        <Text>cpu:</Text>
        <Text color={textColor} padding={{ left: 'xsmall' }}>
          {resources.cpu}
        </Text>
      </Layout.Horizontal>
    </>
  )
  return showLeftBorder ? (
    <Container
      background={color}
      padding={{
        left: 'xxlarge',
        top: 'small',
        bottom: 'small'
      }}
      border={{
        left: showLeftBorder
      }}
    >
      {innerElement}
    </Container>
  ) : (
    <Container
      background={color}
      padding={{
        left: 'xxlarge',
        top: 'small',
        bottom: 'small'
      }}
    >
      {innerElement}
    </Container>
  )
}

interface RecommendationDiffViewerProps {
  recommendedResources: ResourceObject
  currentResources: ResourceObject
}

const RecommendationDiffViewer: React.FC<RecommendationDiffViewerProps> = ({
  recommendedResources,
  currentResources
}) => {
  return (
    <Container className={css.diffContainer}>
      <DiffBlock resources={currentResources.limits} text="limits" color="green100" textColor="red500" />
      <DiffBlock
        resources={recommendedResources.limits}
        text="limits"
        color="green100"
        showLeftBorder
        textColor="green500"
      />
      <DiffBlock resources={currentResources.requests} text="request" color="primary1" textColor="red500" />
      <DiffBlock
        resources={recommendedResources.requests}
        text="request"
        color="primary1"
        showLeftBorder
        textColor="green500"
      />
    </Container>
  )
}

export default RecommendationDiffViewer
