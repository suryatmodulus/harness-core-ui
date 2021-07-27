import React, { useState } from 'react'
import { Button, Heading, Layout, StepProps, CardSelect, Icon, IconName } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'

import css from './CEK8sConnector.module.scss'

enum Features {
  VISIBILITY,
  OPTIMIZATION
}

export type FeaturesString = keyof typeof Features

interface CardData {
  icon: IconName
  text: string
  value: FeaturesString
  heading: string
}

interface StepSecretManagerProps extends ConnectorInfoDTO {
  spec: any
}

interface FeatureSelectionStepProps {
  name: string
  isEditMode: boolean
  handleOptimizationSelection: (val: boolean) => void
}

const FeatureSelectionStep: React.FC<StepProps<StepSecretManagerProps> & FeatureSelectionStepProps> = props => {
  const { getString } = useStrings()

  const { prevStepData, nextStep, previousStep } = props

  const cardData: CardData[] = [
    {
      icon: 'main-main-zoom_in',
      text: getString('connectors.ceAws.crossAccountRoleStep1.visibilityDes'),
      value: 'VISIBILITY',
      heading: getString('connectors.ceAws.crossAccountRoleStep1.visibility')
    },
    {
      icon: 'gear',
      text: getString('connectors.ceAws.crossAccountRoleStep1.optimizationDes'),
      value: 'OPTIMIZATION',
      heading: getString('connectors.ceAws.crossAccountRoleStep1.optimization')
    }
  ]

  const [cardsSelected, setCardsSelected] = useState<CardData[]>(
    prevStepData?.spec.featuresEnabled
      ? prevStepData?.spec?.featuresEnabled.map((feat: FeaturesString) => {
          const num = Features[feat]
          return cardData[num]
        })
      : [cardData[0]]
  )

  const handleSubmit = () => {
    const featuresEnabled: FeaturesString[] = cardsSelected.map(card => card.value)

    // enable Secret creation step if OPTIMIZATION is selected
    props.handleOptimizationSelection(featuresEnabled.indexOf('OPTIMIZATION') > -1)

    const newspec = {
      ...prevStepData?.spec,
      featuresEnabled
    }
    const payload = prevStepData
    if (payload) payload.spec = newspec
    nextStep?.(payload)
  }

  const handleprev = () => {
    previousStep?.({ ...prevStepData } as ConnectorInfoDTO)
  }

  const handleCardSelection = (item: CardData) => {
    // return for VISIBLIITY feature
    if (item.value === Features[0]) return
    const selectedAr = [...cardsSelected]
    const index = selectedAr.map(i => i.value).indexOf(item.value)
    if (index > -1) {
      selectedAr.splice(index, 1)
    } else {
      selectedAr.push(item)
    }
    setCardsSelected(selectedAr)
  }

  return (
    <Layout.Vertical className={css.featureSelectionCont}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.crossAccountRoleStep1.heading')}
      </Heading>
      <div style={{ padding: 5, paddingBottom: 20 }}>
        {getString('connectors.ceAws.crossAccountRoleStep1.description')}
      </div>
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
          renderItem={item => (
            <div>
              <div style={{ display: 'flex', paddingBottom: 7 }}>
                <Icon name={item.icon} size={32} color="primary5" style={{ paddingRight: 10 }}></Icon>
                <p>
                  <div style={{ fontSize: 8, fontFamily: 'inter' }}>
                    {getString('connectors.ceAws.crossAccountRoleStep1.cost')}
                  </div>{' '}
                  <div style={{ fontSize: 14, fontFamily: 'inter' }}>{item.heading}</div>
                </p>
              </div>
              <p>{item.text}</p>
            </div>
          )}
        ></CardSelect>

        <Layout.Horizontal className={css.buttonPanel} spacing="small">
          <Button text={getString('previous')} icon="chevron-left" onClick={handleprev}></Button>
          <Button
            type="submit"
            intent="primary"
            text={getString('continue')}
            rightIcon="chevron-right"
            onClick={handleSubmit}
          />
        </Layout.Horizontal>
      </div>
    </Layout.Vertical>
  )
}

export default FeatureSelectionStep
