import React, { useState } from 'react'
import { Color, useModalHook, RUNTIME_INPUT_VALUE, StepWizard, StepProps } from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import get from 'lodash-es/get'
import set from 'lodash-es/set'

import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useGetConnectorListV2, PageConnectorResponse, ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/exports'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors } from '@connectors/constants'

import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/exports'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import StepDockerAuthentication from '@connectors/components/CreateConnector/DockerConnector/StepAuth/StepDockerAuthentication'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import GcrAuthentication from '@connectors/components/CreateConnector/GcrConnector/StepAuth/GcrAuthentication'
import { buildDockerPayload, buildGcpPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { getStageIndexFromPipeline, getFlattenedStages } from '../PipelineStudio/StageBuilder/StageBuilderUtil'

import ConnectorRefSteps from './ConnectorRefSteps/ConnectorRefSteps'
import { ImagePath } from './ArtifactRepository/ImagePath'
import { ECRArtifact } from './ArtifactRepository/ECRArtifact'
import { GCRImagePath } from './ArtifactRepository/GCRImagePath'
import ArtifactListView, { ModalViewFor } from './ArtifactListView/ArtifactListView'
import type {
  ArtifactsSelectionProps,
  ConnectorDataType,
  ConnectorRefLabelType,
  CreationType,
  ImagePathProps,
  ImagePathTypes
} from './ArtifactInterface'
import css from './ArtifactsSelection.module.scss'

enum TagTypes {
  Value = 'value',
  Regex = 'regex'
}

const ENABLED_ARTIFACT_TYPES: { [key: string]: CreationType } = {
  DockerRegistry: 'Dockerhub',
  Gcp: 'Gcr'
}
// TODO : ADD 'ECR' WHEN TYPE IS ADDED
const allowedArtifactTypes: Array<ConnectorInfoDTO['type']> = ['DockerRegistry', 'Gcp']

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
  } = React.useContext(PipelineContext)

  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedArtifact, setSelectedArtifact] = React.useState(Connectors.DOCKER)
  const [connectorView, setConnectorView] = React.useState(false)
  const [context, setModalContext] = React.useState(ModalViewFor.PRIMARY)
  const [sidecarIndex, setEditIndex] = React.useState(0)
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const [isDelegateRequired, setIsDelegateRequired] = useState(false)

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

  const getPrimaryArtifactPath = React.useCallback((): any => {
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

  const getSidecarPath = React.useCallback((): any => {
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

  const sideCarArtifacts =
    sideCarArtifact && sideCarArtifact.length
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

  connectorScopeIdentifierList.join(...sideCarArtifacts)

  const connectorIdentifiers = connectorScopeIdentifierList.map(item => item.identifier)

  const refetchConnectorList = async (): Promise<void> => {
    const { data: connectorResponse } = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
    setFetchedConnectorResponse(connectorResponse)
  }

  React.useEffect(() => {
    refetchConnectorList()
  }, [stage])

  const addArtifact = (data: {
    connectorId: undefined | { value: string }
    imagePath: string
    identifier?: string
    tag?: string
    tagRegex?: string
    tagType?: string
    registryHostname?: string
    region?: { name: string; value: string }
  }): void => {
    const tagData =
      data.tagType === TagTypes.Value
        ? { tag: data.tag }
        : data.tagType === TagTypes.Regex
        ? { tagRegex: data.tagRegex }
        : { tag: '' }

    const registryHostData = selectedArtifact === Connectors.GCP ? { registryHostname: data.registryHostname } : {}

    if (context === ModalViewFor.PRIMARY) {
      if (isPropagating) {
        artifacts['primary'] = {
          type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
          spec: {
            connectorRef: data.connectorId?.value ? data.connectorId.value : data.connectorId,
            imagePath: data.imagePath,
            ...tagData,
            ...registryHostData
          }
        }
      } else {
        if (isForOverrideSets) {
          artifacts.map(
            (artifact: { overrideSet: { identifier: string; artifacts: { primary: object; sidecars?: [] } } }) => {
              if (artifact?.overrideSet?.identifier === identifierName) {
                const sideCars = artifact?.overrideSet.artifacts.sidecars
                artifact.overrideSet.artifacts = {
                  primary: {
                    type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
                    identifier: data.identifier,
                    spec: {
                      connectorRef: data.connectorId?.value ? data.connectorId.value : data.connectorId,
                      imagePath: data.imagePath,
                      ...tagData,
                      ...(selectedArtifact === Connectors.GCP ? { registryHostname: data.registryHostname } : {})
                    }
                  }
                }
                if (sideCars) {
                  artifact.overrideSet.artifacts['sidecars'] = sideCars
                }
              }
            }
          )
        } else {
          set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', {
            type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
            spec: {
              connectorRef: data.connectorId?.value ? data.connectorId.value : data.connectorId,
              imagePath: data.imagePath,
              ...tagData,
              ...registryHostData
            }
          })
        }
      }
    } else {
      const sideCarObject: {
        type: string
        identifier: string
        spec: {
          connectorRef: string | undefined | { value: string }
          imagePath: string
          tag?: string
          tagRegex?: string
          registryHostname?: string
        }
      } = {
        type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
        identifier: data.identifier as string,
        spec: {
          connectorRef: data.connectorId?.value ? data.connectorId.value : data.connectorId,
          imagePath: data.imagePath,
          ...tagData,
          ...registryHostData
        }
      }

      if (isForOverrideSets) {
        artifacts.map(
          (artifact: {
            overrideSet: { identifier: string; artifacts: { sidecars: [{ sidecar: object }]; primary: object } }
          }) => {
            if (artifact?.overrideSet?.identifier === identifierName) {
              if (artifact.overrideSet.artifacts['sidecars']) {
                artifact.overrideSet.artifacts['sidecars'].push({ sidecar: sideCarObject })
              } else {
                const primary = artifact.overrideSet.artifacts?.primary || null

                artifact.overrideSet.artifacts = {
                  primary: primary,
                  sidecars: [{ sidecar: sideCarObject }]
                }
              }
            }
          }
        )
      } else {
        if (sideCarArtifact?.length) {
          sideCarArtifact.splice(sidecarIndex, 1, { sidecar: sideCarObject })
        } else {
          sideCarArtifact.push({ sidecar: sideCarObject })
        }
      }
    }
    updatePipeline(pipeline)
    hideConnectorModal()
  }

  const addArtifactForEcr = (data: {
    connectorId: undefined | { value: string }
    identifier?: string
    imagePath: string
    region?: { name: string; value: string }
  }): void => {
    if (context === ModalViewFor.PRIMARY) {
      if (isPropagating) {
        artifacts['primary'] = {
          type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
          spec: {
            awsConnector: data.connectorId?.value ? data.connectorId.value : data.connectorId,
            imagePath: data.imagePath,
            region: data.region?.value
          }
        }
      }
      if (isForOverrideSets) {
        artifacts.map(
          (artifact: { overrideSet: { identifier: string; artifacts: { primary: object; sidecars?: [] } } }) => {
            if (artifact?.overrideSet?.identifier === identifierName) {
              const sideCars = artifact?.overrideSet.artifacts.sidecars
              artifact.overrideSet.artifacts = {
                primary: {
                  type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
                  identifier: data.identifier,
                  spec: {
                    awsConnector: data.connectorId?.value ? data.connectorId.value : data.connectorId,
                    imagePath: data.imagePath,
                    region: data.region?.value
                  }
                }
              }
              if (sideCars) {
                artifact.overrideSet.artifacts['sidecars'] = sideCars
              }
            }
          }
        )
      } else {
        set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', {
          type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
          spec: {
            awsConnector: data.connectorId?.value ? data.connectorId.value : data.connectorId,
            imagePath: data.imagePath,
            region: data.region?.value
          }
        })
      }
    } else {
      const sideCarObject: {
        type: string
        identifier: string
        spec: {
          awsConnector: string | undefined | { value: string }
          imagePath: string
          region: string | undefined
        }
      } = {
        type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
        identifier: data.identifier as string,
        spec: {
          awsConnector: data.connectorId?.value ? data.connectorId.value : data.connectorId,
          imagePath: data.imagePath,
          region: data.region?.value
        }
      }

      if (isForOverrideSets) {
        artifacts.map(
          (artifact: {
            overrideSet: { identifier: string; artifacts: { sidecars: [{ sidecar: object }]; primary: object } }
          }) => {
            if (artifact?.overrideSet?.identifier === identifierName) {
              if (artifact.overrideSet.artifacts['sidecars']) {
                artifact.overrideSet.artifacts['sidecars'].push({ sidecar: sideCarObject })
              } else {
                const primary = artifact.overrideSet.artifacts?.primary || null

                artifact.overrideSet.artifacts = {
                  primary: primary,
                  sidecars: [{ sidecar: sideCarObject }]
                }
              }
            }
          }
        )
      } else {
        if (sideCarArtifact?.length) {
          sideCarArtifact.splice(sidecarIndex, 1, { sidecar: sideCarObject })
        } else {
          sideCarArtifact.push({ sidecar: sideCarObject })
        }
      }
    }
    updatePipeline(pipeline)
    hideConnectorModal()
  }

  const getInitialValues = (): ImagePathTypes => {
    let spec
    if (context === ModalViewFor.PRIMARY) {
      spec = primaryArtifact?.spec
    } else {
      spec = sideCarArtifact[sidecarIndex]?.sidecar.spec
    }
    if (!spec) {
      return {
        identifier: '',
        imagePath: '',
        tag: RUNTIME_INPUT_VALUE,
        tagType: TagTypes.Value,
        tagRegex: ''
      }
    }
    const initialValues = {
      identifier: sideCarArtifact[sidecarIndex]?.sidecar.identifier,
      imagePath: spec.imagePath,
      tagType: spec.tag ? TagTypes.Value : TagTypes.Regex,
      tag: spec.tag,
      tagRegex: spec.tagRegex,
      ...(selectedArtifact === Connectors.GCP ? { registryHostname: spec.registryHostname } : {})
    }

    return initialValues
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
  }

  const editArtifact = (viewType: number, type: CreationType, index?: number): void => {
    setModalContext(viewType)
    setConnectorView(false)
    if (type === ENABLED_ARTIFACT_TYPES.Gcp) {
      setSelectedArtifact(Connectors.GCP)
    } else {
      setSelectedArtifact(Connectors.DOCKER)
    }
    if (viewType === ModalViewFor.SIDECAR && index !== undefined) {
      setEditIndex(index)
    }
    showConnectorModal()
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
      name: getConnectorIconByType(selectedArtifact)
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
      initialValues: getInitialValues(),
      handleSubmit: (data: {
        connectorId: undefined | { value: string }
        imagePath: string
        tag?: string
        tagRegex?: string
      }) => {
        if (selectedArtifact === Connectors.AWS) {
          addArtifactForEcr(data)
        } else {
          addArtifact(data)
        }
      }
    }

    return imagePathProps
  }

  const getLabels = (): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: getString('connectors.specifyArtifactRepo'),
      newConnector: getString('connectors.newArtifactRepository')
    }
  }

  const getNewConnectorSteps = React.useCallback((): JSX.Element => {
    if (selectedArtifact === Connectors.DOCKER) {
      return (
        <StepWizard title={getString('connectors.createNewConnector')}>
          <ConnectorDetailsStep type={Connectors.DOCKER} name={getString('overview')} isEditMode={isEditMode} />
          <StepDockerAuthentication
            name={getString('details')}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
          />
          <DelegateSelectorStep
            name={getString('delegateSelectorOptional')}
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
    const delegateStepName = isDelegateRequired
      ? getString('delegate.DelegateName')
      : getString('delegateSelectorOptional')
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={('Gcr' as unknown) as ConnectorInfoDTO['type']}
          name={getString('overview')}
          isEditMode={isEditMode}
        />
        <GcrAuthentication
          name={getString('connectors.GCR.stepTwoName')}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          setIsDelegateRequired={setIsDelegateRequired}
        />
        <DelegateSelectorStep
          name={delegateStepName}
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
  }, [connectorView])

  const getLastSteps = (): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []

    switch (selectedArtifact) {
      case Connectors.Docker:
        arr.push(<ImagePath {...getImagePathProps()} />)
        break
      case Connectors.GCR:
        arr.push(<GCRImagePath {...getImagePathProps()} />)
        break
      case Connectors.AWS:
        arr.push(<ECRArtifact {...getImagePathProps()} />)
        break
      default:
        break
    }

    return arr
  }

  const changeArtifactType = (selected: ConnectorInfoDTO['type']): void => {
    setSelectedArtifact(selected)
  }
  const renderExistingArtifact = (): JSX.Element => {
    return (
      <div>
        <ConnectorRefSteps
          connectorData={getConnectorDataValues()}
          iconsProps={getIconProps()}
          types={allowedArtifactTypes}
          lastSteps={getLastSteps()}
          labels={getLabels()}
          selectedArtifact={selectedArtifact}
          changeArtifactType={changeArtifactType}
          newConnectorView={connectorView}
          newConnectorSteps={getNewConnectorSteps()}
          handleViewChange={isConnectorView => setConnectorView(isConnectorView)}
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
        }}
        {...DIALOG_PROPS}
        className={cx(css.modal, Classes.DIALOG)}
      >
        {renderExistingArtifact()}
      </Dialog>
    ),
    [context, selectedArtifact, connectorView, primaryArtifact, sidecarIndex]
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
    />
  )
}
