import React, { useRef, useState } from 'react'
import { Button, Heading, Layout, StepProps, CardSelect, Icon, IconName, Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { CEAwsConnectorDTO } from './OverviewStep'
import css from '../CreateCeAwsConnector.module.scss'

enum Features {
  VISIBILITY,
  OPTIMIZATION,
  BILLING
}

export type FeaturesString = keyof typeof Features
interface CardData {
  icon: IconName
  text: string
  value: FeaturesString
  heading: string
  prefix: string
  features: string[]
  footer: React.ReactNode
}

const useSelectedCards = (featuresEnabled: FeaturesString[]) => {
  const { getString } = useStrings()
  const FeatureCards = useRef<CardData[]>([
    {
      icon: 'ce-visibility',
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: 'VISIBILITY',
      heading: getString('connectors.costVisibility'),
      prefix: getString('common.aws'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.visible.feat1'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat2'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat3'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat4'),
        getString('connectors.ceAzure.chooseRequirements.visibility.feat5')
      ],
      footer: getString('connectors.ceAws.crossAccountRoleStep1.visible.footer')
    },
    {
      icon: 'nav-settings',
      text: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
      value: 'OPTIMIZATION',
      heading: getString('common.ce.autostopping'),
      prefix: getString('connectors.ceAws.crossAccountRoleStep1.optimize.prefix'),
      features: [
        getString('connectors.ceAws.crossAccountRoleStep1.optimize.feat1'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat2'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat3'),
        getString('connectors.ceAzure.chooseRequirements.optimization.feat4')
      ],
      footer: (
        <>
          {getString('connectors.ceAzure.chooseRequirements.optimization.footer1')}{' '}
          <a href="#" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
            {getString('permissions').toLowerCase()}
          </a>{' '}
          {getString('connectors.ceAws.crossAccountRoleStep1.optimize.footer')}
        </>
      )
    }
  ]).current

  const [selectedCards, setSelectedCards] = useState<CardData[]>(() => {
    const initialSelectedCards = [FeatureCards[0]]
    for (const fe of featuresEnabled) {
      const card = FeatureCards.find(c => c.value === fe)
      // VISIBILITY is selected by default and added above already
      if (card && card.value !== 'VISIBILITY') {
        initialSelectedCards.push(card)
      }
    }
    return initialSelectedCards
  })

  return { selectedCards, setSelectedCards, FeatureCards }
}

const CrossAccountRoleStep1: React.FC<StepProps<CEAwsConnectorDTO>> = props => {
  const { getString } = useStrings()
  const { prevStepData, nextStep, previousStep } = props
  const featuresEnabled = prevStepData?.spec?.featuresEnabled || []
  const { selectedCards, setSelectedCards, FeatureCards } = useSelectedCards(featuresEnabled)

  const handleSubmit = () => {
    const features: FeaturesString[] = selectedCards.map(card => card.value)
    if (prevStepData?.includeBilling) features.push('BILLING')
    const newspec = {
      crossAccountAccess: { crossAccountRoleArn: '' },
      ...prevStepData?.spec,
      featuresEnabled: features
    }
    const payload = prevStepData
    if (payload) payload.spec = newspec
    nextStep?.(payload)
  }

  const handleprev = () => {
    previousStep?.({ ...(prevStepData as CEAwsConnectorDTO) })
  }

  const handleCardSelection = (item: CardData) => {
    // VISIBILITY is provided by default, and user cannot un-select it
    if (item.value === 'VISIBILITY') return

    const sc = [...selectedCards]
    const index = sc.indexOf(item)
    if (index > -1) {
      sc.splice(index, 1)
    } else {
      sc.push(item)
    }

    setSelectedCards(sc)
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.crossAccountRoleStep1.heading')}
        <span>{getString('connectors.ceAws.crossAccountRoleStep1.choosePermissions')}</span>
      </Heading>
      <Text color="grey800">{getString('connectors.ceAws.crossAccountRoleStep1.description')}</Text>
      <Container>
        <Text font={{ italic: true }} className={css.mtblarge}>
          {getString('connectors.ceAws.crossAccountRoleStep1.info')}
        </Text>
        <div style={{ flex: 1 }}>
          <CardSelect
            data={FeatureCards}
            selected={selectedCards}
            multi={true}
            className={css.grid}
            onChange={item => {
              handleCardSelection(item)
            }}
            cornerSelected={true}
            renderItem={item => <Card {...item} />}
          ></CardSelect>

          <Layout.Horizontal className={css.buttonPanel} spacing="small">
            <Button text={getString('previous')} icon="chevron-left" onClick={handleprev}></Button>
            <Button
              type="submit"
              intent="primary"
              text={getString('continue')}
              rightIcon="chevron-right"
              onClick={handleSubmit}
              disabled={!prevStepData?.includeBilling && selectedCards.length == 0}
            />
          </Layout.Horizontal>
        </div>
      </Container>
    </Layout.Vertical>
  )
}

const Card = (props: CardData) => {
  const { prefix, icon, heading, features, footer } = props
  return (
    <Container className={css.featureCard}>
      <Layout.Vertical spacing="medium" padding={{ left: 'large', right: 'large' }}>
        <Layout.Horizontal spacing="small">
          <Icon name={icon} size={32} />
          <Container>
            <Text color="grey900" style={{ fontSize: 9, fontWeight: 500 }}>
              {prefix.toUpperCase()}
            </Text>
            <Text color="grey900" style={{ fontSize: 16, fontWeight: 500 }}>
              {heading}
            </Text>
          </Container>
        </Layout.Horizontal>
        <ul className={css.features}>
          {features.map((feat, idx) => {
            return (
              <li key={idx}>
                <Text
                  icon="main-tick"
                  iconProps={{ color: 'green600', size: 12, padding: { right: 'small' } }}
                  font="small"
                  style={{ lineHeight: '20px' }}
                >
                  {feat}
                </Text>
              </li>
            )
          })}
        </ul>
      </Layout.Vertical>
      <Container className={css.footer}>
        <Text font={{ size: 'small', italic: true }} color="grey400">
          {footer}
        </Text>
      </Container>
    </Container>
  )
}

export default CrossAccountRoleStep1
