import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './NodeRecommendation.module.scss'

const InstructionPanel = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.instructionPanel}>
      <Text font={{ weight: 'semi-bold' }}>{getString('ce.nodeRecommendation.rightSize')}</Text>
      <Text font={{ weight: 'bold', size: 'medium' }} color="grey600">
        {getString('ce.nodeRecommendation.howItWorks')}
      </Text>
      <Layout.Vertical spacing="large">
        <Text>{getString('ce.nodeRecommendation.text1')}</Text>
        <Text>{getString('ce.nodeRecommendation.text2')}</Text>
      </Layout.Vertical>
    </Container>
  )
}

export default InstructionPanel
