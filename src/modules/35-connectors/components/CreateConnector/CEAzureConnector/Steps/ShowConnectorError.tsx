import React from 'react'
import { Layout, Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from '../CreateCeAzureConnector_new.module.scss'

interface Props {
  title: string
  reason: string
  suggestion?: React.ReactNode
}

const ShowConnectorError = (props: Props) => {
  const { getString } = useStrings()
  const { title, reason, suggestion } = props

  return (
    <div className={css.connectorErrorBox}>
      <Layout.Vertical spacing="medium">
        <Text
          inline
          icon="circle-cross"
          iconProps={{ size: 18, color: 'red700', padding: { right: 'small' } }}
          color="red700"
        >
          {title}
        </Text>
        <Container>
          <Text inline font={'small'} icon="info" iconProps={{ size: 16, padding: { right: 'small' } }} color="grey700">
            {reason}
          </Text>
        </Container>
        {suggestion && (
          <Container>
            <Text
              inline
              font={{ size: 'small', weight: 'semi-bold' }}
              icon="lightbulb"
              iconProps={{ size: 16, padding: { right: 'small' } }}
              color="grey700"
            >
              {getString('connectors.ceAzure.overview.trySuggestion')}
            </Text>
            <Text padding={{ left: 'xlarge' }} color="grey700" font={'small'}>
              {suggestion}
            </Text>
          </Container>
        )}
      </Layout.Vertical>
    </div>
  )
}

export default ShowConnectorError
