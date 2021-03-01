import React from 'react'
import {
  Layout,
  Text,
  Icon,
  Color,
  useModalHook,
  RUNTIME_INPUT_VALUE,
  StepWizard,
  StepProps
} from '@wings-software/uicore'
import cx from 'classnames'
import { useParams } from 'react-router-dom'

import get from 'lodash-es/get'
import set from 'lodash-es/set'

import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { String } from 'framework/exports'
import { useGetConnectorListV2, PageConnectorResponse, ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import { PipelineContext } from '@pipeline/exports'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors } from '@connectors/constants'

import { PredefinedOverrideSets } from '@pipeline/components/PredefinedOverrideSets/PredefinedOverrideSets'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { useStrings } from 'framework/exports'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import StepDockerAuthentication from '@connectors/components/CreateConnector/DockerConnector/StepAuth/StepDockerAuthentication'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import GcrAuthentication from '@connectors/components/CreateConnector/GcrConnector/StepAuth/GcrAuthentication'
import {
  getStageIndexFromPipeline,
  getFlattenedStages,
  getStatus
} from '../PipelineStudio/StageBuilder/StageBuilderUtil'

import ConnectorRefSteps from './ConnectorRefSteps/ConnectorRefSteps'
import { ImagePath } from './ArtifactRepository/ImagePath'
import { GCRImagePath } from './ArtifactRepository/GCRImagePath'
import css from './ArtifactsSelection.module.scss'

enum TagTypes {
  Value = 'value',
  Regex = 'regex'
}
enum ModalViewFor {
  PRIMARY = 1,
  SIDECAR = 2
}

const ENABLED_ARTIFACT_TYPES: { [key: string]: CreationType } = {
  DockerRegistry: 'Dockerhub',
  Gcp: 'Gcr'
}

const allowedArtifactTypes: Array<ConnectorInfoDTO['type']> = ['DockerRegistry', 'Gcp']
export type CreationType = 'Dockerhub' | 'Gcr'
export interface OrganizationCreationType {
  type: CreationType
}

export interface ConnectorDataType {
  connectorId: string | undefined
  identifier: string
  imagePath: string
  tag: string
  tagRegex: string
  tagType: TagTypes
  registryHostname?: string
}
export interface ConnectorRefLabelType {
  firstStepName: string
  secondStepName: string
  newConnector: string
  selectConnector: string
}

export default function ArtifactsSelection({
  isForOverrideSets,
  identifierName,
  isForPredefinedSets,
  isPropagating,
  overrideSetIdentifier = ''
}: {
  isForOverrideSets: boolean
  isForPredefinedSets?: boolean
  identifierName?: string
  isPropagating?: boolean
  overrideSetIdentifier?: string
}): JSX.Element {
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

  const getPrimaryArtifactPath = (): any => {
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
    if (!get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', null)) {
      set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', {})
    } else return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary', null)
  }

  const getSidecarPath = (): any => {
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
  }

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

  const refetchConnectorList = async () => {
    const { data: connectorResponse } = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
    setFetchedConnectorResponse(connectorResponse)
  }

  React.useEffect(() => {
    refetchConnectorList()
  }, [primaryArtifact, sideCarArtifact])

  const addArtifact = (data: {
    connectorId: undefined | { value: string }
    imagePath: string
    identifier?: string
    tag?: string
    tagRegex?: string
    tagType?: string
    registryHostname?: string
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
        artifacts['primary'] = {
          type: ENABLED_ARTIFACT_TYPES[selectedArtifact],
          spec: {
            connectorRef: data.connectorId?.value ? data.connectorId.value : data.connectorId,
            imagePath: data.imagePath,
            ...tagData,
            ...registryHostData
          }
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
        sideCarArtifact.splice(sidecarIndex, 1, { sidecar: sideCarObject })
      }
    }
    updatePipeline(pipeline)
    hideConnectorModal()
  }
  const getInitialValues = (): ConnectorDataType => {
    let spec
    if (context === ModalViewFor.PRIMARY) {
      spec = primaryArtifact?.spec
    } else {
      spec = sideCarArtifact[sidecarIndex]?.sidecar.spec
    }
    if (!spec) {
      return {
        connectorId: undefined,
        identifier: '',
        imagePath: '',
        tag: RUNTIME_INPUT_VALUE,
        tagType: TagTypes.Value,
        tagRegex: ''
      }
    }
    const initialValues = {
      identifier: sideCarArtifact[sidecarIndex]?.sidecar.identifier,
      connectorId: spec?.connectorRef,
      imagePath: spec.imagePath,
      tagType: spec.tag ? TagTypes.Value : TagTypes.Regex,
      tag: spec.tag,
      tagRegex: spec.tagRegex,
      ...(selectedArtifact === Connectors.GCP ? { registryHostname: spec.registryHostname } : {})
    }

    return initialValues
  }

  const addNewArtifact = (viewType: number): void => {
    setModalContext(viewType)
    if (viewType === ModalViewFor.SIDECAR) {
      const newSidecarIndex = sideCarArtifact?.length ? sideCarArtifact?.length + 1 : 0
      setEditIndex(newSidecarIndex)
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
      artifacts['primary'] = null
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

  const getLabels = (): ConnectorRefLabelType => {
    return {
      firstStepName: getString('connectors.specifyArtifactRepoType'),
      secondStepName: getString('connectors.specifyArtifactRepo'),
      newConnector: getString('connectors.newArtifactRepository'),
      selectConnector: 'DockerRegistry'
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
          <VerifyOutOfClusterDelegate
            name={getString('connectors.stepThreeName')}
            isStep={true}
            isLastStep={false}
            type={Connectors.DOCKER}
          />
        </StepWizard>
      )
    }
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

    const imagePathStep =
      selectedArtifact === Connectors.DOCKER ? (
        <ImagePath
          key={getString('connectors.stepFourName')}
          name={getString('connectors.stepFourName')}
          context={context}
          handleSubmit={(data: {
            connectorId: undefined | { value: string }
            imagePath: string
            tag?: string
            tagRegex?: string
          }) => {
            addArtifact(data)
          }}
          initialValues={getInitialValues()}
        />
      ) : (
        <GCRImagePath
          key={getString('connectors.stepFourName')}
          name={getString('connectors.stepFourName')}
          context={context}
          handleSubmit={(data: {
            connectorId: undefined | { value: string }
            imagePath: string
            tag?: string
            tagRegex?: string
          }) => {
            addArtifact(data)
          }}
          initialValues={getInitialValues()}
        />
      )

    arr.push(imagePathStep)
    return arr
  }

  const changeArtifactType = (selected: ConnectorInfoDTO['type']): void => {
    setSelectedArtifact(selected)
  }
  const renderExistingArtifact = (): JSX.Element => {
    return (
      <div>
        <ConnectorRefSteps
          connectorData={getInitialValues()}
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

  const { color } = getStatus(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse, accountId)
  return (
    <Layout.Vertical>
      {isForPredefinedSets && <PredefinedOverrideSets context="ARTIFACT" currentStage={stage} />}

      <Layout.Vertical spacing="small">
        <div className={cx(css.artifactList, css.listHeader)}>
          <span></span>
          <span>{getString('artifactRepository')}</span>
          <span> {getString('location')}</span>
          <span></span>
          <span></span>
        </div>

        <Layout.Vertical>
          <section>
            {primaryArtifact && Object.keys(primaryArtifact).length > 0 && (
              <section className={cx(css.artifactList, css.rowItem)} key={'Dockerhub'}>
                <div>
                  <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                    Primary
                  </Text>
                </div>

                <div className={css.server}>
                  <Text
                    inline
                    icon={getConnectorIconByType(primaryArtifact.type)}
                    iconProps={{ size: 18 }}
                    width={180}
                    lineClamp={1}
                    style={{ color: Color.BLACK, fontWeight: 900 }}
                  >
                    {primaryArtifact.type}
                  </Text>

                  <Text width={200} icon="full-circle" iconProps={{ size: 10, color }} />
                </div>
                <div>
                  <Text width={110} lineClamp={1} style={{ color: Color.GREY_500 }}>
                    {primaryArtifact?.spec?.imagePath}
                  </Text>
                </div>
                <div>{/* WIP artifact validation */}</div>
                {overrideSetIdentifier.length === 0 && (
                  <span>
                    <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                      <Icon
                        name="Edit"
                        size={16}
                        onClick={() => editArtifact(ModalViewFor.PRIMARY, primaryArtifact.type)}
                      />
                      {/* <Icon
                            name="main-clone"
                            size={16}
                            style={{ cursor: 'pointer' }}
                            className={css.cloneIcon}
                            // onClick={() => cloneArtifact(manifest)}
                          /> */}
                      <Icon name="bin-main" size={25} onClick={removePrimary} />
                    </Layout.Horizontal>
                  </span>
                )}
              </section>
            )}
          </section>
          {sideCarArtifact && sideCarArtifact.length > 0 && (
            <section>
              {sideCarArtifact.map(
                (
                  data: {
                    sidecar: {
                      type: string
                      identifier: string
                      spec: {
                        connectorRef: string
                        imagePath: string
                      }
                    }
                  },
                  index: number
                ) => {
                  const { sidecar } = data
                  const { color: sideCarConnectionColor } = getStatus(
                    sidecar?.spec?.connectorRef,
                    fetchedConnectorResponse,
                    accountId
                  )
                  return (
                    <section className={cx(css.artifactList, css.rowItem)} key={sidecar?.identifier + index}>
                      <div>
                        <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
                          {getString('sidecar')}
                          <Text lineClamp={1} className={css.artifactId}>
                            ({getString('cf.targets.ID')}: {sidecar.identifier})
                          </Text>
                        </Text>
                      </div>
                      <div className={css.server}>
                        <Text
                          inline
                          icon={getConnectorIconByType(sidecar.type)}
                          iconProps={{ size: 18 }}
                          width={180}
                          lineClamp={1}
                          style={{ color: Color.BLACK, fontWeight: 900 }}
                        >
                          {sidecar.type}
                        </Text>

                        <Text width={200} icon="full-circle" iconProps={{ size: 10, color: sideCarConnectionColor }} />
                      </div>
                      <div>
                        <Text width={110} lineClamp={1} style={{ color: Color.GREY_500 }}>
                          {sidecar?.spec?.imagePath}
                        </Text>
                      </div>
                      <div>{/* WIP artifact validation */}</div>
                      {overrideSetIdentifier.length === 0 && (
                        <span>
                          <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                            <Icon
                              name="Edit"
                              size={16}
                              onClick={() => {
                                editArtifact(ModalViewFor.SIDECAR, sidecar.type as CreationType, index)
                              }}
                            />
                            {/* <Icon
                                  name="main-clone"
                                  size={16}
                                  style={{ cursor: 'pointer' }}
                                  className={css.cloneIcon}
                                  // onClick={() => cloneArtifact(manifest)}
                                /> */}
                            <Icon name="bin-main" size={25} onClick={() => removeSidecar(index)} />
                          </Layout.Horizontal>
                        </span>
                      )}
                    </section>
                  )
                }
              )}
            </section>
          )}
          {sideCarArtifact && sideCarArtifact.length > 0 && overrideSetIdentifier.length === 0 && (
            <div className={css.paddingVertical}>
              <Text intent="primary" style={{ cursor: 'pointer' }} onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}>
                <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
              </Text>
            </div>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical>
        {(!primaryArtifact || !Object.keys(primaryArtifact).length) && overrideSetIdentifier.length === 0 && (
          <div className={css.rowItem}>
            <Text onClick={() => addNewArtifact(ModalViewFor.PRIMARY)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addPrimary" />
            </Text>
          </div>
        )}
        {(!sideCarArtifact || sideCarArtifact?.length === 0) && overrideSetIdentifier.length === 0 && (
          <div className={css.rowItem}>
            <Text onClick={() => addNewArtifact(ModalViewFor.SIDECAR)}>
              <String stringID="pipelineSteps.serviceTab.artifactList.addSidecar" />
            </Text>
          </div>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
