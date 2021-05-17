import React from 'react'
import { StepWizard, StepProps, Icon } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { String, useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import { ArtifactoryRepoType } from '../ArtifactRepository/ArtifactoryRepoType'
import { ArtifactConnector } from '../ArtifactRepository/ArtifactConnector'
import type { ConnectorDataType, ConnectorRefLabelType } from '../ArtifactInterface'
import { getArtifactTitleIdByType } from '../ArtifactHelper'
import css from './ConnectorRefSteps.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}
interface ConnectorRefStepsProps {
  handleViewChange: (isConnectorView: boolean) => void
  connectorData: ConnectorDataType
  types: Array<ConnectorInfoDTO['type']>
  lastSteps?: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> | null
  newConnectorSteps?: any
  expressions: string[]
  labels: ConnectorRefLabelType
  selectedArtifact: ConnectorInfoDTO['type']
  changeArtifactType: (data: ConnectorInfoDTO['type']) => void
  newConnectorView: boolean
  iconsProps: IconProps
  isReadonly: boolean
}

const ConnectorRefSteps: React.FC<ConnectorRefStepsProps> = ({
  types,
  labels,
  expressions,
  selectedArtifact,
  changeArtifactType,
  handleViewChange,
  connectorData,
  newConnectorView,
  newConnectorSteps,
  lastSteps,
  iconsProps,
  isReadonly
}) => {
  const { getString } = useStrings()

  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      handleViewChange(false)
    }
  }

  const renderSubtitle = (): JSX.Element => {
    const stringId = getArtifactTitleIdByType(selectedArtifact)
    return (
      <div className={css.subtitle} style={{ display: 'flex' }}>
        <Icon size={26} {...iconsProps} />
        <String style={{ alignSelf: 'center', marginLeft: 'var(--spacing-small)' }} stringID={stringId} />
      </div>
    )
  }
  return (
    <StepWizard className={css.existingDocker} subtitle={renderSubtitle()} onStepChange={onStepChange}>
      <ArtifactoryRepoType
        artifactTypes={types}
        name={getString('connectors.artifactRepoType')}
        stepName={labels.firstStepName}
        selectedArtifact={selectedArtifact}
        changeArtifactType={changeArtifactType}
      />
      <ArtifactConnector
        name={getString('connectors.artifactRepository')}
        stepName={labels.secondStepName}
        expressions={expressions}
        isReadonly={isReadonly}
        handleViewChange={() => handleViewChange(true)}
        initialValues={connectorData}
        connectorType={selectedArtifact}
      />

      {newConnectorView ? newConnectorSteps : null}

      {lastSteps?.length ? lastSteps?.map(step => step) : null}
    </StepWizard>
  )
}

export default ConnectorRefSteps
