import React, { useEffect, useState } from 'react'
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
}

const CrossAccountRoleStep1: React.FC<StepProps<CEAwsConnectorDTO>> = props => {
  const { getString } = useStrings()

  const { prevStepData, nextStep, previousStep } = props

  const cardData: CardData[] = [
    {
      icon: 'ce-visibility',
      text: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
      value: 'VISIBILITY',
      heading: getString('connectors.ceAws.crossAccountRoleStep1.visibility')
    },
    {
      icon: 'nav-settings',
      text: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
      value: 'OPTIMIZATION',
      heading: getString('connectors.ceAws.crossAccountRoleStep1.optimization')
    }
  ]

  const [cardsSelected, setCardsSelected] = useState<CardData[]>([])
  const prevSelected: CardData[] = []
  useEffect(() => {
    if (prevStepData?.spec?.featuresEnabled) {
      prevStepData?.spec?.featuresEnabled.forEach((feat: FeaturesString) => {
        const num = Features[feat]
        if (num <= Features.OPTIMIZATION) {
          prevSelected.push(cardData[num])
        }
      })
    }
    setCardsSelected(prevSelected)
  }, [prevStepData])

  const handleSubmit = () => {
    const featuresEnabled: FeaturesString[] = cardsSelected.map(card => card.value)
    if (prevStepData?.includeBilling) featuresEnabled.push('BILLING')
    const newspec = {
      crossAccountAccess: { crossAccountRoleArn: '' },
      ...prevStepData?.spec,
      featuresEnabled
    }
    const payload = prevStepData
    if (payload) payload.spec = newspec
    nextStep?.(payload)
  }

  const handleprev = () => {
    previousStep?.({ ...(prevStepData as CEAwsConnectorDTO) })
  }

  const handleCardSelection = (item: CardData) => {
    const selectedAr = [...cardsSelected]
    let index = -1
    selectedAr.forEach((card, ind) => {
      if (card.value == item.value) {
        index = ind
      }
    })
    if (index > -1) {
      selectedAr.splice(index, 1)
    } else {
      selectedAr.push(item)
    }
    setCardsSelected(selectedAr)
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.crossAccountRoleStep1.heading')}
        <span>{getString('connectors.ceAws.crossAccountRoleStep1.choosePermissions')}</span>
      </Heading>
      <div className={css.infobox}>{getString('connectors.ceAws.crossAccountRoleStep1.subHeading')}</div>
      <Container>
        <Heading level={3} className={css.mtbxxlarge}>
          {getString('connectors.ceAws.crossAccountRoleStep1.description')}
        </Heading>
        <div style={{ flex: 1 }}>
          <CardSelect
            data={cardData}
            selected={cardsSelected}
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
              disabled={!prevStepData?.includeBilling && cardsSelected.length == 0}
            />
          </Layout.Horizontal>
        </div>
      </Container>
    </Layout.Vertical>
  )
}

const Card = (props: CardData) => {
  const { icon, heading, text } = props
  return (
    <Layout.Vertical spacing="medium">
      <Layout.Horizontal spacing="small">
        <Icon name={icon} size={32} />
        <Container>
          <Text color="grey900" style={{ fontSize: 9, fontWeight: 600 }}>
            COST
          </Text>
          <Text color="grey900" style={{ fontSize: 16, fontWeight: 500 }}>
            {heading}
          </Text>
        </Container>
      </Layout.Horizontal>
      <Text font={'small'} style={{ lineHeight: '20px' }}>
        {text}
      </Text>
    </Layout.Vertical>
  )
}

export default CrossAccountRoleStep1
