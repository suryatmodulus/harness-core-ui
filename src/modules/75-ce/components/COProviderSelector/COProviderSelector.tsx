import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CardSelect, Layout, CardBody, Button, Heading, Container, Text } from '@wings-software/uicore'
import type { IconName } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { GatewayDetails, Provider } from '@ce/components/COCreateGateway/models'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import COGatewayBasics from '../COGatewayBasics/COGatewayBasics'
import COFixedDrawer from '../COGatewayAccess/COFixedDrawer'
import COHelpSidebar from '../COHelpSidebar/COHelpSidebar'
import css from './COProviderSelector.module.scss'

interface COProviderSelectorProps {
  nextTab: () => void
  setGatewayDetails: (gatewayDetails: GatewayDetails) => void
  gatewayDetails: GatewayDetails
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
  // {
  //   name: 'Digital Ocean',
  //   value: 'do',
  //   icon: 'harness'
  // }
]

function getProvider(name: string): Provider {
  return data.filter(p => p.name == name)[0]
}

const COProviderSelector: React.FC<COProviderSelectorProps> = props => {
  const [selectedCard, setSelectedCard] = useState<Provider>(getProvider(props.gatewayDetails.provider.name))
  const [cloudAccountID, setCloudAccountID] = useState<string>(props.gatewayDetails.cloudAccount.id)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  useEffect(() => {
    if (selectedCard) trackEvent('SelectedCloudCard', { cloudProvider: selectedCard.name })
  }, [selectedCard])
  return (
    <>
      <Breadcrumbs
        className={css.breadCrumb}
        links={[
          {
            url: routes.toCECORules({ orgIdentifier, projectIdentifier, accountId }),
            label: getString('ce.co.breadCrumb.rules')
          },
          {
            url: '',
            label: props.gatewayDetails.name || ''
          }
        ]}
      />
      <COFixedDrawer
        topMargin={35}
        content={<COHelpSidebar pageName={'provider-selector'} activeSectionNames={[]} />}
      />
      <Container style={{ margin: '0 auto', paddingTop: 100, paddingLeft: 50 }}>
        <Layout.Vertical spacing="large" padding="large">
          <Heading className={css.title}>{getString('common.letsGetYouStarted')}</Heading>
          <Heading level={2}>{getString('ce.co.autoStoppingRule.providerSelector.description')}</Heading>
          <Layout.Vertical spacing="small">
            <Layout.Horizontal spacing="small" style={{ paddingTop: '29px' }}>
              <CardSelect
                data={data}
                selected={selectedCard}
                className={css.providersViewGrid}
                onChange={item => {
                  props.gatewayDetails.provider = item
                  setSelectedCard(item)
                  props.setGatewayDetails(props.gatewayDetails)
                }}
                renderItem={item => (
                  <Layout.Vertical spacing="small">
                    <CardBody.Icon className={css.card} icon={item.icon as IconName} iconSize={28}></CardBody.Icon>
                  </Layout.Vertical>
                )}
                cornerSelected={true}
              ></CardSelect>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="medium" className={css.instanceTypeNameGrid}>
              <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
                AWS
              </Text>
              <Text font={{ align: 'center' }} style={{ fontSize: 11 }}>
                Azure
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
          {selectedCard ? (
            <COGatewayBasics
              gatewayDetails={props.gatewayDetails}
              setGatewayDetails={props.setGatewayDetails}
              setCloudAccount={setCloudAccountID}
            ></COGatewayBasics>
          ) : null}
        </Layout.Vertical>
        <Button
          className={css.footer}
          intent="primary"
          text="Next"
          icon="chevron-right"
          onClick={() => {
            trackEvent('VisitedConfigPage', {})
            props.nextTab()
          }}
          disabled={!(selectedCard && cloudAccountID)}
        />
      </Container>
    </>
  )
}

export default COProviderSelector
