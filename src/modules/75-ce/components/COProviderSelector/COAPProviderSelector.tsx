import React, { useState } from 'react'
import { Button, CardBody, CardSelect, Container, Heading, IconName, Layout, Text } from '@wings-software/uicore'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { useStrings } from 'framework/strings'
import type { Provider } from '../COCreateGateway/models'
import css from './COAPProviderSelector.module.scss'

interface COAPProviderSelectorProps {
  onSubmit: (data: { provider: string; connectorDetails?: string }) => void
  accountId: string
}

const data: Provider[] = [
  {
    name: 'AWS',
    value: 'aws',
    icon: 'service-aws'
  },
  {
    name: 'Azure',
    value: 'azure',
    icon: 'service-azure'
  }
]

const COAPProviderSelector: React.FC<COAPProviderSelectorProps> = props => {
  const { getString } = useStrings()
  const [selectedCard, setSelectedCard] = useState<Provider | null>(null)
  const [connectorDetails, setConnectorDetails] = useState<string>()
  return (
    <Layout.Vertical>
      <Container className={css.mainContainer}>
        <Heading level={2}>Select Cloud Provider</Heading>
        <Layout.Horizontal spacing="small" style={{ paddingTop: '29px' }}>
          <CardSelect
            data={data}
            selected={selectedCard as Provider}
            className={css.providerCardsContainer}
            onChange={item => {
              setSelectedCard(item)
            }}
            renderItem={(item: Provider) => (
              <Layout.Vertical spacing="small">
                <CardBody.Icon icon={item.icon as IconName} iconSize={28}></CardBody.Icon>
                <Text>{item.name}</Text>
              </Layout.Vertical>
            )}
            cornerSelected={true}
          ></CardSelect>
        </Layout.Horizontal>
        {selectedCard && (
          <ConnectorReferenceField
            name="cloudConnector"
            placeholder={getString('ce.co.accessPoint.select.account')}
            selected={connectorDetails}
            onChange={record => {
              setConnectorDetails?.(record.identifier)
            }}
            accountIdentifier={props.accountId}
            label={getString('ce.co.accessPoint.select.connector')}
            category={'CLOUD_COST'}
          />
        )}
      </Container>
      <Button
        intent={'primary'}
        icon="chevron-right"
        className={css.continueCta}
        onClick={() => props.onSubmit({ provider: selectedCard?.value as string, connectorDetails })}
      >
        Continue
      </Button>
    </Layout.Vertical>
  )
}

export default COAPProviderSelector
