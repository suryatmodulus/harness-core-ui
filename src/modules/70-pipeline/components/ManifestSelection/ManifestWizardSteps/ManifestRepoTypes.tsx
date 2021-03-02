import React from 'react'
import { Button, Card, Color, Container, Heading, Icon, Layout, StepProps, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { ManifestTypes } from '../ManifestSelection'
import { manifestTypeIcons, manifestTypeLabels } from '../Manifesthelper'
import css from './ManifestWizardSteps.module.scss'

interface ManifestPropType {
  changeManifestType: (selected: ManifestTypes) => void
  manifestTypes: Array<ManifestTypes>
  selectedManifest: ManifestTypes
  stepName: string
}

export const ManifestRepoTypes: React.FC<StepProps<ConnectorConfigDTO> & ManifestPropType> = ({
  selectedManifest,
  manifestTypes,
  changeManifestType,
  stepName,
  nextStep
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
              <Text
                style={{
                  fontSize: '12px',
                  textAlign: 'center'
                }}
                color={Color.BLACK_100}
              >
                {manifestTypeLabels[item]}
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
            nextStep?.()
          }}
          className={css.saveBtn}
        />
      </Layout.Horizontal>
    </Container>
  )
}
