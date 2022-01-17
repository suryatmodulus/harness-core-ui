/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Color, useModalHook, StepWizard, useToaster } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import produce from 'immer'
import get from 'lodash-es/get'
import set from 'lodash-es/set'

import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { merge } from 'lodash-es'
import {
  useGetConnectorListV2,
  PageConnectorResponse,
  ConnectorInfoDTO,
  SidecarArtifactWrapper,
  PrimaryArtifact,
  StageElementConfig,
  ArtifactConfig,
  SidecarArtifact,
  ArtifactOverrideSetWrapper
} from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'

import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/strings'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import StepDockerAuthentication from '@connectors/components/CreateConnector/DockerConnector/StepAuth/StepDockerAuthentication'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import GcrAuthentication from '@connectors/components/CreateConnector/GcrConnector/StepAuth/GcrAuthentication'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import {
  buildArtifactoryPayload,
  buildAWSPayload,
  buildDockerPayload,
  buildGcpPayload,
  buildNexusPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ArtifactActions } from '@common/constants/TrackingConstants'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import StepNexusAuthentication from '@connectors/components/CreateConnector/NexusConnector/StepAuth/StepNexusAuthentication'
import StepArtifactoryAuthentication from '@connectors/components/CreateConnector/ArtifactoryConnector/StepAuth/StepArtifactoryAuthentication'
import { getStageIndexFromPipeline, getFlattenedStages } from '../PipelineStudio/StageBuilder/StageBuilderUtil'
import ArtifactWizard from './ArtifactWizard/ArtifactWizard'
import { DockerRegistryArtifact } from './ArtifactRepository/ArtifactLastSteps/DockerRegistryArtifact/DockerRegistryArtifact'
import { ECRArtifact } from './ArtifactRepository/ArtifactLastSteps/ECRArtifact/ECRArtifact'
import { GCRImagePath } from './ArtifactRepository/ArtifactLastSteps/GCRImagePath/GCRImagePath'
import ArtifactListView, { ModalViewFor } from './ArtifactListView/ArtifactListView'
import type {
  ArtifactsSelectionProps,
  InitialArtifactDataType,
  ConnectorRefLabelType,
  ArtifactType,
  ImagePathProps
} from './ArtifactInterface'
import {
  ArtifactToConnectorMap,
  ENABLED_ARTIFACT_TYPES,
  ArtifactIconByType,
  ArtifactTitleIdByType,
  allowedArtifactTypes
} from './ArtifactHelper'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import NexusArtifact from './ArtifactRepository/ArtifactLastSteps/NexusArtifact/NexusArtifact'
import Artifactory from './ArtifactRepository/ArtifactLastSteps/Artifactory/Artifactory'
import css from './ArtifactsSelection.module.scss'

export default function ArtifactsSelection({
  isForOverrideSets = false,
  identifierName,
  isForPredefinedSets = false,
  isPropagating = false,
  overrideSetIdentifier = ''
}: ArtifactsSelectionProps): JSX.Element {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    isReadonly,
    allowableTypes
  } = usePipelineContext()

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactType | null>(null)
  const [connectorView, setConnectorView] = useState(false)
  const [context, setModalContext] = useState(ModalViewFor.PRIMARY)
  const [sidecarIndex, setEditIndex] = useState(0)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = useState<PageConnectorResponse | undefined>()

  const { showError } = useToaster()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { expressions } = useVariablesExpression()

  const stepWizardTitle = getString('connectors.createNewConnector')

  const getPrimaryArtifactByIdentifier = (): PrimaryArtifact => {
    return artifacts
      .map((artifact: { overrideSet: { identifier: string; artifacts: { primary: Record<string, any> } } }) => {
        if (artifact?.overrideSet?.identifier === identifierName) {
          return artifact.overrideSet.artifacts['primary']
        }
      })
      .filter((x: { overrideSet: { identifier: string; artifacts: [] } }) => x !== undefined)[0]
  }

  const getSidecarArtifactByIdentifier = (): SidecarArtifactWrapper[] => {
    return artifacts
      .map(
        (artifact: {
          overrideSet: {
            identifier: string
            artifacts: { sidecars: [{ sidecar: Record<string, any> }]; primary: Record<string, any> }
          }
        }) => {
          if (artifact?.overrideSet?.identifier === identifierName) {
            if (!artifact?.overrideSet?.artifacts?.['sidecars']) {
              set(artifact, 'overrideSet.artifacts.sidecars', [])
            }
            return artifact.overrideSet.artifacts['sidecars']
          }
        }
      )
      .filter((x: { overrideSet: { identifier: string; artifacts: [] } }) => x !== undefined)[0]
  }

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const getArtifactsPath = (): any => {
    if (isForOverrideSets) {
      return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets', [])
    }
    if (overrideSetIdentifier?.length) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      const { stages } = getFlattenedStages(pipeline)
      return get(stages[index], 'stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets', [])
    }
    if (isForPredefinedSets || isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', {})
  }

  const getOverrideSetArtifact = (): ArtifactOverrideSetWrapper => {
    const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
    const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
    const { stages } = getFlattenedStages(pipeline)
    const overrideSets = get(stages[index], 'stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets', [])

    const selectedOverrideSet = overrideSets.find(
      ({ overrideSet }: { overrideSet: { identifier: string } }) => overrideSet.identifier === overrideSetIdentifier
    )
    return selectedOverrideSet
  }
  const getPrimaryArtifactPath = useCallback((): PrimaryArtifact => {
    if (isForOverrideSets) {
      return getPrimaryArtifactByIdentifier()
    }
    if (overrideSetIdentifier?.length) {
      const selectedOverrideSet = getOverrideSetArtifact()
      return get(selectedOverrideSet, 'overrideSet.artifacts.primary', null)
    }
    if (isForPredefinedSets || isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.primary', null)
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', null)
  }, [stage])

  const getSidecarPath = useCallback((): SidecarArtifactWrapper[] => {
    if (isForOverrideSets) {
      return getSidecarArtifactByIdentifier()
    }
    if (overrideSetIdentifier?.length) {
      const selectedOverrideSet = getOverrideSetArtifact()

      return get(selectedOverrideSet, 'overrideSet.artifacts.sidecars', [])
    }
    if (isForPredefinedSets || isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.sidecars', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', [])
  }, [stage])

  const artifacts = getArtifactsPath()

  const primaryArtifact = getPrimaryArtifactPath()
  const sideCarArtifact = getSidecarPath()

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    title: '',
    style: { width: 1100, height: 550, borderLeft: 'none', paddingBottom: 0, position: 'relative' }
  }

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const defaultQueryParams = {
    pageIndex: 0,
    pageSize: 10,
    searchTerm: '',
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeAllConnectorsAvailableAtScope: true
  }
  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const [showConnectorModal, hideConnectorModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          hideConnectorModal()
          setConnectorView(false)
          setIsEditMode(false)
          setSelectedArtifact(null)
        }}
        {...DIALOG_PROPS}
        className={cx(css.modal, Classes.DIALOG)}
      >
        {renderExistingArtifact()}
      </Dialog>
    ),
    [context, selectedArtifact, connectorView, primaryArtifact, sidecarIndex, expressions, allowableTypes, isEditMode]
  )

  const getPrimaryConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return primaryArtifact?.type
      ? [
          {
            scope: getScopeFromValue(primaryArtifact?.spec?.connectorRef),
            identifier: getIdentifierFromValue(primaryArtifact?.spec?.connectorRef)
          }
        ]
      : []
  }, [primaryArtifact?.spec?.connectorRef, primaryArtifact?.type])

  const getSidecarConnectorList = useCallback((): Array<{ scope: Scope; identifier: string }> => {
    return sideCarArtifact?.length
      ? sideCarArtifact.map((data: SidecarArtifactWrapper) => ({
          scope: getScopeFromValue(data?.sidecar?.spec?.connectorRef),
          identifier: getIdentifierFromValue(data?.sidecar?.spec?.connectorRef)
        }))
      : []
  }, [sideCarArtifact])

  const refetchConnectorList = useCallback(async (): Promise<void> => {
    try {
      const primaryConnectorList = getPrimaryConnectorList()
      const sidecarConnectorList = getSidecarConnectorList()
      const connectorIdentifiers = [...primaryConnectorList, ...sidecarConnectorList].map(item => item.identifier)
      if (connectorIdentifiers.length) {
        const response = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
        if (response?.data) {
          setFetchedConnectorResponse(response?.data)
        }
      }
    } catch (e) {
      showError(e.message)
    }
  }, [fetchConnectors, getPrimaryConnectorList, getSidecarConnectorList, showError])

  useDeepCompareEffect(() => {
    refetchConnectorList()
  }, [stage])

  const setTelemetryEvent = useCallback((): void => {
    const isCreateMode = context === ModalViewFor.PRIMARY ? !primaryArtifact : sidecarIndex === sideCarArtifact.length

    let telemetryEventName
    if (isCreateMode) {
      telemetryEventName =
        context === ModalViewFor.PRIMARY
          ? ArtifactActions.SavePrimaryArtifactOnPipelinePage
          : ArtifactActions.SaveSidecarArtifactOnPipelinePage
    } else {
      telemetryEventName =
        context === ModalViewFor.PRIMARY
          ? ArtifactActions.UpdatePrimaryArtifactOnPipelinePage
          : ArtifactActions.UpdateSidecarArtifactOnPipelinePage
    }
    trackEvent(telemetryEventName, {})
  }, [context, primaryArtifact, sideCarArtifact.length, sidecarIndex, trackEvent])

  const setPrimaryArtifactData = useCallback(
    (artifactObj: PrimaryArtifact): void => {
      if (isPropagating) {
        artifacts['primary'] = { ...artifactObj }
      } else {
        if (isForOverrideSets) {
          artifacts.map(
            (artifact: {
              overrideSet: { identifier: string; artifacts: { primary: Record<string, any>; sidecars?: [] } }
            }) => {
              if (artifact?.overrideSet?.identifier === identifierName) {
                artifact.overrideSet.artifacts = {
                  ...artifact.overrideSet.artifacts,
                  primary: { ...artifactObj }
                }
              }
            }
          )
        } else {
          artifacts['primary'] = { ...artifactObj }
        }
      }
    },
    [artifacts, identifierName, isForOverrideSets, isPropagating]
  )

  const setSidecarArtifactData = useCallback(
    (artifactObj: SidecarArtifact): void => {
      if (isForOverrideSets) {
        artifacts.map(
          (artifact: {
            overrideSet: {
              identifier: string
              artifacts: { sidecars: [{ sidecar: Record<string, any> }]; primary: Record<string, any> }
            }
          }) => {
            if (artifact?.overrideSet?.identifier === identifierName) {
              if (artifact.overrideSet.artifacts['sidecars']) {
                artifact.overrideSet.artifacts['sidecars'].push({ sidecar: artifactObj })
              } else {
                artifact.overrideSet.artifacts = {
                  ...artifact.overrideSet.artifacts,
                  sidecars: [{ sidecar: artifactObj }]
                }
              }
            }
          }
        )
      } else {
        if (sideCarArtifact?.length) {
          sideCarArtifact.splice(sidecarIndex, 1, { sidecar: artifactObj })
        } else {
          sideCarArtifact.push({ sidecar: artifactObj })
        }
      }
    },
    [artifacts, identifierName, isForOverrideSets, sideCarArtifact, sidecarIndex]
  )

  const updateStageData = useCallback((): StageElementWrapper<DeploymentStageElementConfig> | undefined => {
    return produce(stage, draft => {
      if (context === ModalViewFor.PRIMARY) {
        if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
          set(draft, 'stage.spec.serviceConfig.stageOverrides.artifacts', artifacts)
        } else {
          set(draft!, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', artifacts)
        }
      }
      if (context === ModalViewFor.SIDECAR) {
        if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
          set(draft, 'stage.spec.serviceConfig.stageOverrides.artifacts.sidecars', sideCarArtifact)
        } else {
          set(draft!, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', sideCarArtifact)
        }
      }
    })
  }, [artifacts, context, isPropagating, sideCarArtifact, stage])

  const addArtifact = useCallback(
    (artifactObj: ArtifactConfig): void => {
      merge(artifactObj, { type: ENABLED_ARTIFACT_TYPES[selectedArtifact as ArtifactType] })

      if (context === ModalViewFor.PRIMARY) {
        setPrimaryArtifactData(artifactObj as PrimaryArtifact)
      } else {
        setSidecarArtifactData(artifactObj as SidecarArtifact)
      }
      const updatedStage = updateStageData()

      setTelemetryEvent()
      updateStage(updatedStage?.stage as StageElementConfig)
      hideConnectorModal()
      setSelectedArtifact(null)
      refetchConnectorList()
    },
    [
      context,
      hideConnectorModal,
      refetchConnectorList,
      selectedArtifact,
      setPrimaryArtifactData,
      setSidecarArtifactData,
      setTelemetryEvent,
      updateStage,
      updateStageData
    ]
  )

  const getLastStepInitialData = useCallback((): any => {
    if (context === ModalViewFor.PRIMARY) {
      return primaryArtifact
    } else {
      return sideCarArtifact?.[sidecarIndex]?.sidecar
    }
  }, [context, primaryArtifact, sideCarArtifact, sidecarIndex])

  const getArtifactInitialValues = useCallback((): InitialArtifactDataType => {
    let spec, artifactType
    if (context === ModalViewFor.PRIMARY) {
      artifactType = primaryArtifact?.type
      spec = primaryArtifact?.spec
    } else {
      artifactType = sideCarArtifact?.[sidecarIndex]?.sidecar?.type
      spec = sideCarArtifact?.[sidecarIndex]?.sidecar?.spec
    }
    if (!spec) {
      return {
        submittedArtifact: selectedArtifact,
        connectorId: undefined
      }
    }
    return {
      submittedArtifact: artifactType,
      connectorId: spec?.connectorRef
    }
  }, [context, primaryArtifact?.spec, primaryArtifact?.type, selectedArtifact, sideCarArtifact, sidecarIndex])

  const addNewArtifact = (viewType: number): void => {
    setModalContext(viewType)
    setConnectorView(false)

    if (viewType === ModalViewFor.SIDECAR) {
      setEditIndex(sideCarArtifact?.length || 0)
    }
    showConnectorModal()
    refetchConnectorList()
  }

  const editArtifact = (viewType: number, type: ArtifactType, index?: number): void => {
    setModalContext(viewType)
    setConnectorView(false)
    setSelectedArtifact(type as ArtifactType)

    if (viewType === ModalViewFor.SIDECAR && index !== undefined) {
      setEditIndex(index)
    }
    showConnectorModal()
    refetchConnectorList()
  }

  const removePrimary = (): void => {
    if (isForOverrideSets) {
      artifacts.map(
        (artifact: {
          overrideSet: { identifier: string; artifacts: { primary: Record<string, any> | null; sidecars: [] } }
        }) => {
          if (artifact?.overrideSet?.identifier === identifierName) {
            artifact.overrideSet.artifacts['primary'] = null
          }
        }
      )
    } else {
      delete artifacts.primary
    }
    primaryArtifact.spec = {}
    setSelectedArtifact(null)
    const updatedStage = produce(stage, draft => {
      if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
        draft.stage.spec.serviceConfig.stageOverrides.artifacts = artifacts
      } else if (draft?.stage?.spec?.serviceConfig.serviceDefinition?.spec.artifacts) {
        draft.stage.spec.serviceConfig.serviceDefinition.spec.artifacts = artifacts
      }
    })
    updateStage(updatedStage?.stage as StageElementConfig)
  }

  const removeSidecar = (index: number): void => {
    sideCarArtifact.splice(index, 1)
    const updatedStage = produce(stage, draft => {
      if (isPropagating && draft?.stage?.spec?.serviceConfig?.stageOverrides?.artifacts) {
        draft.stage.spec.serviceConfig.stageOverrides.artifacts.sidecars = sideCarArtifact
      } else if (draft?.stage?.spec?.serviceConfig.serviceDefinition?.spec.artifacts?.sidecars) {
        draft.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars = sideCarArtifact
      }
    })
    updateStage(updatedStage?.stage as StageElementConfig)
  }

  const getIconProps = useCallback((): IconProps | undefined => {
    if (selectedArtifact) {
      const iconProps: IconProps = {
        name: ArtifactIconByType[selectedArtifact]
      }
      if (selectedArtifact === ENABLED_ARTIFACT_TYPES.DockerRegistry) {
        iconProps.color = Color.WHITE
      }
      return iconProps
    }
  }, [selectedArtifact])

  const artifactLastStepProps = useCallback((): ImagePathProps => {
    return {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      context,
      expressions,
      allowableTypes,
      initialValues: getLastStepInitialData(),
      handleSubmit: (data: any) => {
        addArtifact(data)
      },
      artifactIdentifiers: sideCarArtifact?.map((item: SidecarArtifactWrapper) => item.sidecar?.identifier as string),
      isReadonly: isReadonly,
      selectedArtifact
    }
  }, [
    addArtifact,
    allowableTypes,
    context,
    expressions,
    getLastStepInitialData,
    isReadonly,
    selectedArtifact,
    sideCarArtifact,
    getString
  ])

  const getLabels = useCallback((): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: `${selectedArtifact && getString(ArtifactTitleIdByType[selectedArtifact])} ${getString(
        'repository'
      )}`
    }
  }, [selectedArtifact])

  const connectorDetailStepProps = {
    name: getString('overview'),
    isEditMode,
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
  }
  const authenticationStepProps = {
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined
  }
  const delegateStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }
  const verifyOutofClusterDelegateProps = {
    name: getString('connectors.stepThreeName'),
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false
  }
  const getNewConnectorSteps = useCallback((): JSX.Element => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
        return (
          <StepWizard title={stepWizardTitle}>
            <ConnectorDetailsStep type={ArtifactToConnectorMap[selectedArtifact]} {...connectorDetailStepProps} />
            <StepDockerAuthentication name={getString('details')} {...authenticationStepProps} />
            <DelegateSelectorStep buildPayload={buildDockerPayload} {...delegateStepProps} />
            <VerifyOutOfClusterDelegate
              type={ArtifactToConnectorMap[selectedArtifact]}
              {...verifyOutofClusterDelegateProps}
            />
          </StepWizard>
        )
      case ENABLED_ARTIFACT_TYPES.Gcr:
        return (
          <StepWizard title={stepWizardTitle}>
            <ConnectorDetailsStep type={'Gcr' as unknown as ConnectorInfoDTO['type']} {...connectorDetailStepProps} />
            <GcrAuthentication name={getString('details')} {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateStepProps} buildPayload={buildGcpPayload} />
            <VerifyOutOfClusterDelegate {...verifyOutofClusterDelegateProps} type={'Gcr'} />
          </StepWizard>
        )
      case ENABLED_ARTIFACT_TYPES.Ecr:
        return (
          <StepWizard iconProps={{ size: 37 }} title={stepWizardTitle}>
            <ConnectorDetailsStep type={ArtifactToConnectorMap[selectedArtifact]} {...connectorDetailStepProps} />
            <StepAWSAuthentication name={getString('credentials')} {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateStepProps} buildPayload={buildAWSPayload} />
            <VerifyOutOfClusterDelegate
              {...verifyOutofClusterDelegateProps}
              type={ArtifactToConnectorMap[selectedArtifact]}
            />
          </StepWizard>
        )
      case ENABLED_ARTIFACT_TYPES.Nexus:
        return (
          <StepWizard title={stepWizardTitle}>
            <ConnectorDetailsStep type={ArtifactToConnectorMap[selectedArtifact]} {...connectorDetailStepProps} />
            <StepNexusAuthentication name={getString('details')} {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateStepProps} buildPayload={buildNexusPayload} />
            <VerifyOutOfClusterDelegate
              {...verifyOutofClusterDelegateProps}
              type={ArtifactToConnectorMap[selectedArtifact]}
            />
          </StepWizard>
        )
      case ENABLED_ARTIFACT_TYPES.Artifactory:
        return (
          <StepWizard title={stepWizardTitle}>
            <ConnectorDetailsStep type={ArtifactToConnectorMap[selectedArtifact]} {...connectorDetailStepProps} />
            <StepArtifactoryAuthentication name={getString('details')} {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateStepProps} buildPayload={buildArtifactoryPayload} />
            <VerifyOutOfClusterDelegate
              {...verifyOutofClusterDelegateProps}
              type={ArtifactToConnectorMap[selectedArtifact]}
            />
          </StepWizard>
        )

      default:
        return <></>
    }
  }, [connectorView, selectedArtifact, isEditMode])

  const getLastSteps = useCallback((): JSX.Element => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.Gcr:
        return <GCRImagePath {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Ecr:
        return <ECRArtifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Nexus:
        return <NexusArtifact {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.Artifactory:
        return <Artifactory {...artifactLastStepProps()} />
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      default:
        return <DockerRegistryArtifact {...artifactLastStepProps()} />
    }
  }, [artifactLastStepProps, selectedArtifact])

  const changeArtifactType = useCallback((selected: ArtifactType | null): void => {
    setSelectedArtifact(selected)
  }, [])

  const handleConnectorViewChange = useCallback((isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }, [])

  const renderExistingArtifact = (): JSX.Element => {
    return (
      <div>
        <ArtifactWizard
          artifactInitialValue={getArtifactInitialValues()}
          iconsProps={getIconProps()}
          types={allowedArtifactTypes}
          expressions={expressions}
          allowableTypes={allowableTypes}
          lastSteps={getLastSteps()}
          labels={getLabels()}
          isReadonly={isReadonly}
          selectedArtifact={selectedArtifact}
          changeArtifactType={changeArtifactType}
          newConnectorView={connectorView}
          newConnectorSteps={getNewConnectorSteps()}
          handleViewChange={handleConnectorViewChange}
        />
      </div>
    )
  }

  return (
    <ArtifactListView
      isForPredefinedSets={isForPredefinedSets}
      stage={stage}
      primaryArtifact={primaryArtifact}
      overrideSetIdentifier={overrideSetIdentifier}
      sideCarArtifact={sideCarArtifact}
      addNewArtifact={addNewArtifact}
      editArtifact={editArtifact}
      removePrimary={removePrimary}
      removeSidecar={removeSidecar}
      fetchedConnectorResponse={fetchedConnectorResponse}
      accountId={accountId}
      refetchConnectors={refetchConnectorList}
      isReadonly={isReadonly}
    />
  )
}
