import React, { useCallback, useContext, useEffect } from 'react'
import { Color, useModalHook, StepWizard, StepProps } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import get from 'lodash-es/get'
import set from 'lodash-es/set'

import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useGetConnectorListV2, PageConnectorResponse, ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/exports'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/exports'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import StepDockerAuthentication from '@connectors/components/CreateConnector/DockerConnector/StepAuth/StepDockerAuthentication'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import GcrAuthentication from '@connectors/components/CreateConnector/GcrConnector/StepAuth/GcrAuthentication'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import { buildAWSPayload, buildDockerPayload, buildGcpPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { getStageIndexFromPipeline, getFlattenedStages } from '../PipelineStudio/StageBuilder/StageBuilderUtil'

import ConnectorRefSteps from './ConnectorRefSteps/ConnectorRefSteps'
import { ImagePath } from './ArtifactRepository/ArtifactLastSteps/ImagePath'
import { ECRArtifact } from './ArtifactRepository/ArtifactLastSteps/ECRArtifact'
import { GCRImagePath } from './ArtifactRepository/ArtifactLastSteps/GCRImagePath'
import ArtifactListView, { ModalViewFor } from './ArtifactListView/ArtifactListView'
import type {
  ArtifactsSelectionProps,
  ConnectorDataType,
  ConnectorRefLabelType,
  CreationType,
  ImagePathProps
} from './ArtifactInterface'
import { ENABLED_ARTIFACT_TYPES, getArtifactIconByType } from './ArtifactHelper'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './ArtifactsSelection.module.scss'

const allowedArtifactTypes: Array<ConnectorInfoDTO['type']> = [Connectors.DOCKER, Connectors.GCP, Connectors.AWS]

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
      pipelineView: {
        splitViewData: { selectedStageId }
      }
    },
    getStageFromPipeline,
    updatePipeline
  } = useContext(PipelineContext)

  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedArtifact, setSelectedArtifact] = React.useState(Connectors.DOCKER)
  const [connectorView, setConnectorView] = React.useState(false)
  const [context, setModalContext] = React.useState(ModalViewFor.PRIMARY)
  const [sidecarIndex, setEditIndex] = React.useState(0)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = React.useState<PageConnectorResponse | undefined>()

  const { getString } = useStrings()

  const getPrimaryArtifactByIdentifier = (): void => {
    return artifacts
      .map((artifact: { overrideSet: { identifier: string; artifacts: { primary: object } } }) => {
        if (artifact?.overrideSet?.identifier === identifierName) {
          return artifact.overrideSet.artifacts['primary']
        }
      })
      .filter((x: { overrideSet: { identifier: string; artifacts: [] } }) => x !== undefined)[0]
  }

  const getSidecarArtifactByIdentifier = (): void => {
    return artifacts
      .map(
        (artifact: {
          overrideSet: { identifier: string; artifacts: { sidecars: [{ sidecar: object }]; primary: object } }
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

  const { stage } = getStageFromPipeline(selectedStageId || '')

  const getArtifactsPath = (): any => {
    if (isForOverrideSets) {
      return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets', [])
    }
    if (overrideSetIdentifier && overrideSetIdentifier.length) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      const { stages } = getFlattenedStages(pipeline)
      const overrideSets = get(
        stages[index],
        'stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets',
        []
      )

      return overrideSets
    }
    if (isForPredefinedSets || isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts', {})
  }

  const getPrimaryArtifactPath = useCallback((): any => {
    if (isForOverrideSets) {
      return getPrimaryArtifactByIdentifier()
    }
    if (overrideSetIdentifier && overrideSetIdentifier.length) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      const { stages } = getFlattenedStages(pipeline)
      const overrideSets = get(
        stages[index],
        'stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets',
        []
      )

      const selectedOverrideSet = overrideSets.find(
        ({ overrideSet }: { overrideSet: { identifier: string } }) => overrideSet.identifier === overrideSetIdentifier
      )

      return get(selectedOverrideSet, 'overrideSet.artifacts.primary', null)
    }
    if (isForPredefinedSets || isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.primary', null)
    }

    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', null)
  }, [stage])

  const getSidecarPath = useCallback((): any => {
    if (isForOverrideSets) {
      return getSidecarArtifactByIdentifier()
    }
    if (overrideSetIdentifier && overrideSetIdentifier.length) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      const { stages } = getFlattenedStages(pipeline)
      const overrideSets = get(
        stages[index],
        'stage.spec.serviceConfig.serviceDefinition.spec.artifactOverrideSets',
        []
      )

      const selectedOverrideSet = overrideSets.find(
        ({ overrideSet }: { overrideSet: { identifier: string } }) => overrideSet.identifier === overrideSetIdentifier
      )

      return get(selectedOverrideSet, 'overrideSet.artifacts.sidecars', [])
    }
    if (isForPredefinedSets || isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.artifacts.sidecars', [])
    }
    if (!get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', null)) {
      set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', [])
    } else return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars', [])
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
    enforceFocus: true,
    title: '',
    style: { width: 1050, height: 580, borderLeft: 'none', paddingBottom: 0, position: 'relative' }
  }

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
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

  const connectorScopeIdentifierList = primaryArtifact
    ? [
        {
          scope: getScopeFromValue(primaryArtifact?.spec?.connectorRef),
          identifier: getIdentifierFromValue(primaryArtifact?.spec?.connectorRef)
        }
      ]
    : []

  const getConnectorList = () => {
    return sideCarArtifact && sideCarArtifact.length
      ? sideCarArtifact &&
          sideCarArtifact.map(
            (data: {
              sidecar: {
                type: string
                identifier: string
                spec: {
                  connectorRef: string
                  imagePath: string
                }
              }
            }) => ({
              scope: getScopeFromValue(data?.sidecar?.spec?.connectorRef),
              identifier: getIdentifierFromValue(data?.sidecar?.spec?.connectorRef)
            })
          )
      : []
  }

  const refetchConnectorList = async (): Promise<void> => {
    const connectorList = getConnectorList()
    const arr = connectorScopeIdentifierList.concat(...connectorList)
    const connectorIdentifiers = arr.map(item => item.identifier)
    const { data: connectorResponse } = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
    setFetchedConnectorResponse(connectorResponse)
  }

  useEffect(() => {
    refetchConnectorList()
  }, [stage])

  const addArtifact = (artifactObj: any): void => {
    artifactObj = {
      ...artifactObj,
      type: ENABLED_ARTIFACT_TYPES[selectedArtifact]
    }

    if (context === ModalViewFor.PRIMARY) {
      if (isPropagating) {
        artifacts['primary'] = { ...artifactObj }
      } else {
        if (isForOverrideSets) {
          artifacts.map(
            (artifact: { overrideSet: { identifier: string; artifacts: { primary: object; sidecars?: [] } } }) => {
              if (artifact?.overrideSet?.identifier === identifierName) {
                artifact.overrideSet.artifacts = {
                  ...artifact.overrideSet.artifacts,
                  primary: { ...artifactObj }
                }
              }
            }
          )
        } else {
          set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', { ...artifactObj })
        }
      }
    } else {
      if (isForOverrideSets) {
        artifacts.map(
          (artifact: {
            overrideSet: { identifier: string; artifacts: { sidecars: [{ sidecar: object }]; primary: object } }
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
    }

    updatePipeline(pipeline)
    hideConnectorModal()
    refetchConnectorList()
  }

  const getLastStepInitialData = (): any => {
    if (context === ModalViewFor.PRIMARY) {
      return primaryArtifact
    } else {
      return sideCarArtifact[sidecarIndex]?.sidecar
    }
  }

  const getConnectorDataValues = (): ConnectorDataType => {
    let spec
    if (context === ModalViewFor.PRIMARY) {
      spec = primaryArtifact?.spec
    } else {
      spec = sideCarArtifact[sidecarIndex]?.sidecar.spec
    }
    if (!spec) {
      return {
        connectorId: undefined
      }
    }
    return {
      connectorId: spec?.connectorRef
    }
  }

  const addNewArtifact = (viewType: number): void => {
    setModalContext(viewType)
    setConnectorView(false)

    if (viewType === ModalViewFor.SIDECAR) {
      setEditIndex(sideCarArtifact?.length)
    }
    showConnectorModal()
    refetchConnectorList()
  }

  const editArtifact = (viewType: number, type: CreationType, index?: number): void => {
    setModalContext(viewType)
    setConnectorView(false)
    switch (type) {
      case ENABLED_ARTIFACT_TYPES.Gcp:
        setSelectedArtifact(Connectors.GCP)
        break
      case ENABLED_ARTIFACT_TYPES.Aws:
        setSelectedArtifact(Connectors.AWS)
        break
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      default:
        setSelectedArtifact(Connectors.DOCKER)
    }

    if (viewType === ModalViewFor.SIDECAR && index !== undefined) {
      setEditIndex(index)
    }
    showConnectorModal()
    refetchConnectorList()
  }

  const removePrimary = (): void => {
    if (isForOverrideSets) {
      artifacts.map(
        (artifact: { overrideSet: { identifier: string; artifacts: { primary: object | null; sidecars: [] } } }) => {
          if (artifact?.overrideSet?.identifier === identifierName) {
            artifact.overrideSet.artifacts['primary'] = null
          }
        }
      )
    } else {
      delete artifacts.primary
    }
    primaryArtifact.spec = undefined
    setSelectedArtifact(Connectors.DOCKER)
    updatePipeline(pipeline)
  }

  const removeSidecar = (index: number): void => {
    sideCarArtifact.splice(index, 1)
    updatePipeline(pipeline)
  }

  const getIconProps = (): IconProps => {
    const iconProps: IconProps = {
      name: selectedArtifact === Connectors.Aws ? 'ecr-step' : getArtifactIconByType(selectedArtifact)
    }
    if (selectedArtifact === Connectors.DOCKER) {
      iconProps.color = Color.WHITE
    }
    return iconProps
  }

  const getImagePathProps = (): ImagePathProps => {
    const imagePathProps: ImagePathProps = {
      key: getString('connectors.stepFourName'),
      name: getString('connectors.stepFourName'),
      context,
      expressions,
      initialValues: getLastStepInitialData(),
      handleSubmit: (data: any) => {
        addArtifact(data)
      }
    }

    return imagePathProps
  }

  const getLabels = (): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: `${getString('select')} ${ENABLED_ARTIFACT_TYPES[selectedArtifact]} ${getString('repository')}`,
      newConnector: `${getString('newLabel')} ${selectedArtifact} ${getString('connector')}`
    }
  }

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    switch (selectedArtifact) {
      case Connectors.GCP:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep
              type={('Gcr' as unknown) as ConnectorInfoDTO['type']}
              name={getString('overview')}
              isEditMode={isEditMode}
            />
            <GcrAuthentication
              name={getString('connectors.GCR.stepTwoName')}
              identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
            <DelegateSelectorStep
              name={getString('delegate.DelegateselectionLabel')}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              buildPayload={buildGcpPayload}
              connectorInfo={undefined}
            />
            <VerifyOutOfClusterDelegate
              name={getString('connectors.stepThreeName')}
              isStep={true}
              isLastStep={false}
              type={'Gcr'}
            />
          </StepWizard>
        )
      case Connectors.AWS:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep type={Connectors.AWS} name={getString('overview')} isEditMode={isEditMode} />
            <StepAWSAuthentication
              name={getString('credentials')}
              identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              connectorInfo={undefined}
              onConnectorCreated={() => {
                //TO BE Removed
              }}
            />
            <DelegateSelectorStep
              name={getString('delegate.DelegateselectionLabel')}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              buildPayload={buildAWSPayload}
              connectorInfo={undefined}
            />
            <VerifyOutOfClusterDelegate
              name={getString('connectors.stepThreeName')}
              isStep={true}
              isLastStep={false}
              type={Connectors.AWS}
            />
          </StepWizard>
        )
      case Connectors.DOCKER:
      default:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep type={Connectors.DOCKER} name={getString('overview')} isEditMode={isEditMode} />
            <StepDockerAuthentication
              name={getString('details')}
              identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
            />
            <DelegateSelectorStep
              name={getString('delegate.DelegateselectionLabel')}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              buildPayload={buildDockerPayload}
              connectorInfo={undefined}
            />
            <VerifyOutOfClusterDelegate
              name={getString('connectors.stepThreeName')}
              isStep={true}
              isLastStep={false}
              type={Connectors.DOCKER}
            />
          </StepWizard>
        )
    }
  }, [connectorView, selectedArtifact, isEditMode])

  const getLastSteps = (): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []

    switch (selectedArtifact) {
      case Connectors.GCP:
        arr.push(<GCRImagePath {...getImagePathProps()} />)
        break
      case Connectors.AWS:
        arr.push(<ECRArtifact {...getImagePathProps()} />)
        break
      case Connectors.DOCKER:
      default:
        arr.push(<ImagePath {...getImagePathProps()} />)
        break
    }
    return arr
  }

  const changeArtifactType = (selected: ConnectorInfoDTO['type']): void => {
    setSelectedArtifact(selected)
  }
  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }

  const { expressions } = useVariablesExpression()
  const renderExistingArtifact = (): JSX.Element => {
    return (
      <div>
        <ConnectorRefSteps
          connectorData={getConnectorDataValues()}
          iconsProps={getIconProps()}
          types={allowedArtifactTypes}
          expressions={expressions}
          lastSteps={getLastSteps()}
          labels={getLabels()}
          selectedArtifact={selectedArtifact}
          changeArtifactType={changeArtifactType}
          newConnectorView={connectorView}
          newConnectorSteps={getNewConnectorSteps()}
          handleViewChange={handleConnectorViewChange}
        />
      </div>
    )
  }

  const [showConnectorModal, hideConnectorModal] = useModalHook(
    () => (
      <Dialog
        onClose={() => {
          hideConnectorModal()
          setConnectorView(false)
          setIsEditMode(false)
        }}
        {...DIALOG_PROPS}
        className={cx(css.modal, Classes.DIALOG)}
      >
        {renderExistingArtifact()}
      </Dialog>
    ),
    [context, selectedArtifact, connectorView, primaryArtifact, sidecarIndex, expressions, isEditMode]
  )

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
    />
  )
}
