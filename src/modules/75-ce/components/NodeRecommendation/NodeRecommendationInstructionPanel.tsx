import React from 'react'
import { Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './NodeRecommendation.module.scss'

const InstructionPanel = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.instructionPanel}>
      <Text font={{ weight: 'bold', size: 'medium' }} color="grey600">
        {getString('ce.nodeRecommendation.howItWorks')}
      </Text>
      <Layout.Vertical spacing="medium">
        <Text>{getString('ce.nodeRecommendation.text1')}</Text>
        <Layout.Vertical spacing="small">
          <Text>{getString('ce.nodeRecommendation.listhead')}</Text>
          <ul>
            <li>{getString('ce.nodeRecommendation.item1')}</li>
            <li>{getString('ce.nodeRecommendation.item2')}</li>
            <li>{getString('ce.nodeRecommendation.item3')}</li>
            <li>{getString('ce.nodeRecommendation.item4')}</li>
          </ul>
        </Layout.Vertical>
        <Text>{getString('ce.nodeRecommendation.text2')}</Text>
      </Layout.Vertical>
    </Container>
  )
}

export default InstructionPanel
