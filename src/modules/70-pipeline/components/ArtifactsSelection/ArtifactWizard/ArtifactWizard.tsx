import React from 'react'
import { StepWizard, StepProps, Icon, MultiTypeInputType } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { String, StringKeys, useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ArtifactoryRepoType } from '../ArtifactRepository/ArtifactoryRepoType'
import { ArtifactConnector } from '../ArtifactRepository/ArtifactConnector'
import type { InitialArtifactDataType, ConnectorRefLabelType, ArtifactType } from '../ArtifactInterface'
import { ArtifactTitleIdByType } from '../ArtifactHelper'
import css from './ArtifactWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}
interface ArtifactWizardProps {
  handleViewChange: (isConnectorView: boolean) => void
  artifactInitialValue: InitialArtifactDataType
  types: Array<ArtifactType>
  lastSteps?: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> | null
  newConnectorSteps?: any
  expressions: string[]
  labels: ConnectorRefLabelType
  selectedArtifact: ArtifactType | null
  changeArtifactType: (data: ArtifactType | null) => void
  newConnectorView: boolean
  iconsProps: IconProps | undefined
  isReadonly: boolean
  allowableTypes: MultiTypeInputType[]
}

const ArtifactWizard: React.FC<ArtifactWizardProps> = ({
  types,
  labels,
  expressions,
  allowableTypes,
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

  const renderSubtitle = (): JSX.Element | undefined => {
    const stringId = selectedArtifact && ArtifactTitleIdByType[selectedArtifact]
    if (selectedArtifact) {
      return (
        <div className={css.subtitle} style={{ display: 'flex' }}>
          <Icon size={26} {...(iconsProps as IconProps)} />
          <String
            style={{ alignSelf: 'center', marginLeft: 'var(--spacing-small)' }}
            stringID={stringId as StringKeys}
          />
        </div>
      )
    }
    return undefined
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
        allowableTypes={allowableTypes}
      />

      {newConnectorView ? newConnectorSteps : null}

      {lastSteps?.length ? lastSteps?.map(step => step) : null}
    </StepWizard>
  )
}

export default ArtifactWizard
