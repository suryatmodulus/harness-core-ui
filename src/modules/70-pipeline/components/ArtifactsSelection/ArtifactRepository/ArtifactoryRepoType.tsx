import React from 'react'
import { Button, Card, Color, Container, Heading, Icon, Layout, StepProps, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ArtifactIconByType, ArtifactTitleIdByType } from '../ArtifactHelper'
import type { ArtifactType } from '../ArtifactInterface'
import css from './ArtifactConnector.module.scss'

interface ArtifactPropType {
  changeArtifactType: (selected: ArtifactType) => void
  artifactTypes: Array<ArtifactType>
  selectedArtifact: ArtifactType
  stepName: string
}

export const ArtifactoryRepoType: React.FC<StepProps<ConnectorConfigDTO> & ArtifactPropType> = ({
  selectedArtifact,
  artifactTypes,
  changeArtifactType,
  stepName,
  nextStep
}) => {
  const [selectedArtifactType, setSelectedArtifactType] = React.useState(selectedArtifact)

  const handleOptionSelection = (selected: ArtifactType): void => {
    setSelectedArtifactType(selected)
    changeArtifactType(selected)
  }

  const { getString } = useStrings()
  return (
    <Container className={css.optionsViewContainer}>
      <Heading level={2} style={{ color: Color.BLACK, fontSize: 24 }} margin={{ bottom: 'large' }}>
        {stepName}
      </Heading>
      <div className={css.headerContainer}>
        <Layout.Horizontal spacing="large">
          {artifactTypes.map(item => (
            <div key={item} className={css.squareCardContainer}>
              <Card
                className={css.artifactIcon}
                selected={item === selectedArtifactType}
                onClick={() => handleOptionSelection(item)}
              >
                <Icon name={ArtifactIconByType[item]} size={26} height={26} />
              </Card>
              <Text
                style={{
                  fontSize: '12px',
                  textAlign: 'center'
                }}
                color={Color.BLACK_100}
              >
                {getString(ArtifactTitleIdByType[item])}
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
            changeArtifactType(selectedArtifactType)
            nextStep?.()
          }}
          className={css.saveBtn}
        />
      </Layout.Horizontal>
    </Container>
  )
}
