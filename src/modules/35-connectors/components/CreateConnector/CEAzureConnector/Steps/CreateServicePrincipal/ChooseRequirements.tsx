import React, { useState, useRef } from 'react'
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
import css from '../../CreateCeAzureConnector_new.module.scss'

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

const useSelectedCards = (featuresEnabled: ICard['value'][]) => {
  const { getString } = useStrings()
  const FeatureCards = useRef<ICard[]>([
    // Keeping it for future.
    //
    // {
    //   title: getString('common.ce.visibility'),
    //   desc: getString('connectors.ceAzure.chooseRequirements.visibilityCardDesc'),
    //   value: 'VISIBILITY',
    //   icon: 'ce-visibility'
    // },
    {
      title: getString('common.ce.optimization'),
      desc: getString('connectors.ceAzure.chooseRequirements.optimizationCardDesc'),
      value: 'OPTIMIZATION',
      icon: 'nav-settings'
    }
  ]).current

  const [selectedCards, setSelectedCards] = useState<ICard[]>(() => {
    const initialSelectedCards = []
    for (const fe of featuresEnabled) {
      const card = FeatureCards.find(c => c.value === fe)
      if (card) initialSelectedCards.push(card)
    }
    return initialSelectedCards
  })

  return { selectedCards, setSelectedCards, FeatureCards }
}

const ChooseRequirements: React.FC<StepProps<CEAzureDTO>> = props => {
  const { getString } = useStrings()
  const { previousStep, prevStepData, nextStep } = props
  const featuresEnabled = prevStepData?.spec?.featuresEnabled || []
  const { selectedCards, setSelectedCards, FeatureCards } = useSelectedCards(featuresEnabled)
  const includesBilling = !!prevStepData?.spec?.featuresEnabled?.includes('BILLING')

  const handleSubmit = () => {
    const features = selectedCards.map(c => c.value)
    if (includesBilling) {
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
        {getString('connectors.ceAzure.chooseRequirements.heading')}
      </Heading>
      <Text className={css.infobox}>{getString('connectors.ceAzure.chooseRequirements.subHeading')}</Text>
      <Container>
        <Heading level={3} className={css.mtbxxlarge}>
          {getString('connectors.ceAzure.chooseRequirements.featureDesc')}
        </Heading>
        <Formik<CloudFeatures>
          initialValues={{
            VISIBILITY: false,
            OPTIMIZATION: false
          }}
          formName="CloudFeaturesSelectionForm"
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
                selected={selectedCards}
                multi={true}
                className={css.grid}
                onChange={handleCardSelection}
                cornerSelected={true}
                renderItem={item => <Card {...item} />}
              />
              <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
                <Button text={getString('previous')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  disabled={selectedCards.length === 0 && !includesBilling}
                >
                  {getString('continue')}
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

const Card = (props: ICard) => {
  const { icon, title, desc } = props
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
      <Text font={'small'} style={{ lineHeight: '20px' }}>
        {desc}
      </Text>
    </Layout.Vertical>
  )
}

export default ChooseRequirements
