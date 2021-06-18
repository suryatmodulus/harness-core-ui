import React, { useState } from 'react'
import {
  Button,
  Formik,
  FormikForm,
  Heading,
  Layout,
  ModalErrorHandler,
  StepProps,
  CardSelect,
  Icon,
  IconName,
  Text,
  Container
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { CEAzureConnector } from 'services/cd-ng'
import type { CEAzureDTO } from '../Overview/AzureConnectorOverview'
import css from '../../CreateCeAzureConnector.module.scss'

interface CloudFeatures {
  VISIBILITY: boolean
  OPTIMIZATION: boolean
}

interface ICard {
  icon: IconName
  desc: string
  value: 'VISIBILITY' | 'BILLING' | 'OPTIMIZATION'
  title: string
}

const FeatureCards: ICard[] = [
  {
    icon: 'ce-visibility',
    desc:
      'Cost insights, anomaly detection, service insights, creating budgets perspectives and alerts, utilised/wasted resources in clusters.',
    value: 'VISIBILITY',
    title: 'Visibility'
  },
  {
    icon: 'nav-settings',
    desc:
      'Detection of orphaned resources, recommendations to save costs, scaling/tearing down, turning off in non-work hours, reserving instances.',
    value: 'OPTIMIZATION',
    title: 'Optimization'
  }
]

const ChooseRequirements: React.FC<StepProps<CEAzureDTO>> = props => {
  const { getString } = useStrings()
  const { previousStep, prevStepData, nextStep } = props
  const featuresEnabled = prevStepData?.spec?.featuresEnabled || []

  const initialSelectedCards = []
  for (const fe of featuresEnabled) {
    const card = FeatureCards.find(c => c.value === fe)
    if (card) initialSelectedCards.push(card)
  }

  const [cardsSelected, setCardsSelected] = useState<ICard[]>(initialSelectedCards)

  const handleSubmit = () => {
    const features = cardsSelected.map(c => c.value)
    if (prevStepData?.spec?.featuresEnabled?.includes('BILLING')) {
      features.push('BILLING')
    }

    const nextStepData: CEAzureDTO = {
      ...((prevStepData || {}) as CEAzureDTO),
      spec: {
        ...((prevStepData?.spec || {}) as CEAzureConnector),
        featuresEnabled: features
      }
    }

    nextStep?.(nextStepData)
  }

  const handleCardSelection = (item: ICard) => {
    const selectedAr = [...cardsSelected]
    const index = selectedAr.indexOf(item)
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
        {getString('connectors.ceAzure.chooseRequirements.heading')} -{' '}
        <span>{getString('connectors.ceAzure.chooseRequirements.subText')}</span>
      </Heading>
      <Text className={css.infobox}>{getString('connectors.ceAzure.chooseRequirements.subHeading')}</Text>
      <Container>
        <Heading level={3} className={css.mtbxxlarge}>
          {getString('connectors.ceAzure.chooseRequirements.featureDesc')} <i>(optional)</i>
        </Heading>
        <Formik<CloudFeatures>
          initialValues={{
            VISIBILITY: false,
            OPTIMIZATION: false
          }}
          onSubmit={handleSubmit}
        >
          {() => (
            <FormikForm>
              <ModalErrorHandler
                bind={() => {
                  return
                }}
              />
              <CardSelect
                data={FeatureCards}
                selected={cardsSelected}
                multi={true}
                className={css.grid}
                onChange={handleCardSelection}
                cornerSelected={true}
                renderItem={item => <Card item={item} />}
              ></CardSelect>
              <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
                <Button text="Previous" icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
                <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={cardsSelected.length < 1}>
                  Continue
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

const Card = ({ item }: { item: ICard }) => {
  const { icon, title, desc } = item
  return (
    <Layout.Vertical spacing="medium">
      <Layout.Horizontal spacing="small">
        <Icon name={icon} size={32} />
        <Container>
          <Text color="grey900" style={{ fontSize: 9, fontWeight: 600 }}>
            COST
          </Text>
          <Text color="grey900" style={{ fontSize: 16, fontWeight: 500 }}>
            {title}
          </Text>
        </Container>
      </Layout.Horizontal>
      <Text style={{ fontSize: 12, lineHeight: '20px' }}>{desc}</Text>
    </Layout.Vertical>
  )
}

export default ChooseRequirements
