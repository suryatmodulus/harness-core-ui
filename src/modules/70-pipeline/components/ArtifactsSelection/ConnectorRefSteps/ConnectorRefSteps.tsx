import React from 'react'
import { StepWizard, StepProps, Icon } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { String, useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ArtifactoryRepoType } from '../ArtifactRepository/ArtifactoryRepoType'
import { ArtifactConnector } from '../ArtifactRepository/ArtifactConnector'
import type { InitialArtifactDataType, ConnectorRefLabelType, ArtifactType } from '../ArtifactInterface'
import { ArtifactTitleIdByType } from '../ArtifactHelper'
import css from './ConnectorRefSteps.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}
interface ConnectorRefStepsProps {
  handleViewChange: (isConnectorView: boolean) => void
  artifactInitialValue: InitialArtifactDataType
  types: Array<ArtifactType>
  lastSteps?: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> | null
  newConnectorSteps?: any
  expressions: string[]
  labels: ConnectorRefLabelType
  selectedArtifact: ArtifactType
  changeArtifactType: (data: ArtifactType) => void
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
  artifactInitialValue,
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
    const stringId = ArtifactTitleIdByType[selectedArtifact]
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
        artifactInitialValue={artifactInitialValue}
        changeArtifactType={changeArtifactType}
      />
      <ArtifactConnector
        name={getString('connectors.artifactRepository')}
        stepName={labels.secondStepName}
        expressions={expressions}
        isReadonly={isReadonly}
        handleViewChange={() => handleViewChange(true)}
        initialValues={artifactInitialValue}
        selectedArtifact={selectedArtifact}
      />

      {newConnectorView ? newConnectorSteps : null}

      {lastSteps?.length ? lastSteps?.map(step => step) : null}
    </StepWizard>
  )
}

export default ConnectorRefSteps
