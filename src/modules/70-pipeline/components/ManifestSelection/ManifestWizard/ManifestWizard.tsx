/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, StepWizard, Color, StepProps, MultiTypeInputType } from '@wings-software/uicore'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { ConnectorRefLabelType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ManifestRepoTypes } from '../ManifestWizardSteps/ManifestRepoTypes'
import ManifestStore from '../ManifestWizardSteps/ManifestStore'
import { manifestTypeLabels } from '../Manifesthelper'
import type { ManifestStepInitData, ManifestStores, ManifestTypes } from '../ManifestInterface'
import css from './ManifestWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

interface ManifestWizardStepsProps {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  handleStoreChange: (store?: ManifestStores) => void
  initialValues: ManifestStepInitData
  types: Array<ManifestTypes>
  manifestStoreTypes: Array<ManifestStores>
  labels: ConnectorRefLabelType
  selectedManifest: ManifestTypes | null
  newConnectorView: boolean
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  newConnectorSteps?: any
  lastSteps?: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> | null
  changeManifestType: (data: ManifestTypes | null) => void
  iconsProps: IconProps
  isReadonly: boolean
}

export const ManifestWizard: React.FC<ManifestWizardStepsProps> = ({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  types,
  expressions,
  allowableTypes,
  manifestStoreTypes,
  labels,
  selectedManifest,
  newConnectorView,
  newConnectorSteps,
  lastSteps,
  changeManifestType,
  iconsProps,
  isReadonly
}) => {
  const { getString } = useStrings()
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      handleConnectorViewChange(false)
      handleStoreChange()
    }
  }

  const renderSubtitle = (): JSX.Element => {
    const stringId = selectedManifest && getString(manifestTypeLabels[selectedManifest])
    if (selectedManifest) {
      return (
        <div className={css.subtitle} style={{ display: 'flex' }}>
          <Icon {...iconsProps} size={26} />
          <Text style={{ alignSelf: 'center', marginLeft: 'var(--spacing-small)' }} color={Color.WHITE}>
            {stringId}
          </Text>
        </div>
      )
    }
    return <></>
  }

  return (
    <StepWizard className={css.manifestWizard} subtitle={renderSubtitle()} onStepChange={onStepChange}>
      <ManifestRepoTypes
        manifestTypes={types}
        name={getString('pipeline.manifestType.manifestRepoType')}
        stepName={labels.firstStepName}
        selectedManifest={selectedManifest}
        changeManifestType={changeManifestType}
        initialValues={initialValues}
      />
      <ManifestStore
        name={getString('pipeline.manifestType.manifestSource')}
        stepName={labels.secondStepName}
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        manifestStoreTypes={manifestStoreTypes}
        handleConnectorViewChange={() => handleConnectorViewChange(true)}
        handleStoreChange={handleStoreChange}
        initialValues={initialValues}
      />
      {newConnectorView ? newConnectorSteps : null}

      {lastSteps?.length ? lastSteps?.map(step => step) : null}
    </StepWizard>
  )
}
