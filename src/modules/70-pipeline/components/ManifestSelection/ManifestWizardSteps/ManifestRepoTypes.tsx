import React from 'react'
import { Button, Card, Color, Container, Heading, Icon, Layout, StepProps, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import { manifestTypeIcons, manifestTypeLabels } from '../Manifesthelper'
import type { ManifestStepInitData, ManifestTypes } from '../ManifestInterface'
import css from './ManifestWizardSteps.module.scss'

interface ManifestPropType {
  changeManifestType: (selected: ManifestTypes) => void
  manifestTypes: Array<ManifestTypes>
  selectedManifest: ManifestTypes
  stepName: string
  initialValues: ManifestStepInitData
}

export const ManifestRepoTypes: React.FC<StepProps<ConnectorConfigDTO> & ManifestPropType> = ({
  selectedManifest,
  manifestTypes,
  changeManifestType,
  stepName,
  prevStepData,
  nextStep,
  initialValues
}) => {
  const [selectedManifestType, setselectedManifestType] = React.useState(selectedManifest)

  const handleOptionSelection = (selected: ManifestTypes): void => {
    setselectedManifestType(selected)
    changeManifestType(selected)
  }

  const { getString } = useStrings()
  return (
    <Container className={css.optionsViewContainer}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24 }} margin={{ bottom: 'large' }}>
        {stepName}
      </Heading>
      <div className={css.headerContainer}>
        <Layout.Horizontal spacing="large">
          {manifestTypes.map(item => (
            <div key={item} className={css.squareCardContainer}>
              <Card
                className={css.manifestIcon}
                selected={item === selectedManifestType}
                onClick={() => handleOptionSelection(item)}
              >
                <Icon name={manifestTypeIcons[item]} size={26} />
              </Card>
              <Text className={css.sqaureCardTitle} color={Color.BLACK_100}>
                {getString(manifestTypeLabels[item])}
              </Text>
            </div>
          ))}
        </Layout.Horizontal>
      </div>
      <Layout.Horizontal>
        <Button
          intent="primary"
          type="submit"
          text={getString('continue')}
          rightIcon="chevron-right"
          onClick={() => {
            changeManifestType(selectedManifestType)
            if (initialValues.selectedManifest !== selectedManifestType) {
              nextStep?.({ ...prevStepData, store: '' })
            } else {
              nextStep?.({ ...prevStepData })
            }
          }}
          className={css.saveBtn}
        />
      </Layout.Horizontal>
    </Container>
  )
}
