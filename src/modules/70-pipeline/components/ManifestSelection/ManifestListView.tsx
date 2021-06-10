import React, { useCallback, useMemo, useState } from 'react'
import { Layout, Text, Icon, Color, useModalHook, StepWizard, StepProps, Button } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import { get, set } from 'lodash-es'

import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import produce from 'immer'
import { String, useStrings } from 'framework/strings'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepHelmAuth from '@connectors/components/CreateConnector/HelmRepoConnector/StepHelmRepoAuth'
import type {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ManifestConfig,
  ManifestConfigWrapper,
  StageElementConfig
} from 'services/cd-ng'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import {
  buildAWSPayload,
  buildBitbucketPayload,
  buildGcpPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload,
  buildHelmPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import GcpAuthentication from '@connectors/components/CreateConnector/GcpConnector/StepAuth/GcpAuthentication'

import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { ManifestWizard } from './ManifestWizard/ManifestWizard'
import {
  getStageIndexFromPipeline,
  getFlattenedStages,
  getStatus,
  getConnectorNameFromValue
} from '../PipelineStudio/StageBuilder/StageBuilderUtil'
import {
  ManifestIconByType,
  ManifestDataType,
  ManifestToConnectorMap,
  ManifestStoreMap,
  manifestTypeIcons,
  manifestTypeLabels
} from './Manifesthelper'
import ManifestDetails from './ManifestWizardSteps/ManifestDetails/ManifestDetails'
import type { ConnectorRefLabelType } from '../ArtifactsSelection/ArtifactInterface'
import type {
  ManifestStepInitData,
  ManifestTypes,
  ManifestListViewProps,
  ManifestLastStepProps,
  ManifestStores
} from './ManifestInterface'
import HelmWithGIT from './ManifestWizardSteps/HelmWithGIT/HelmWithGIT'
import HelmWithHttp from './ManifestWizardSteps/HelmWithHttp/HelmWithHttp'
import OpenShiftTemplateWithGit from './ManifestWizardSteps/OSTemplateWithGit/OSTemplateWithGit'
import HelmWithGcs from './ManifestWizardSteps/HelmWithGcs/HelmWithGcs'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import HelmWithS3 from './ManifestWizardSteps/HelmWithS3/HelmWithS3'
import KustomizeWithGIT from './ManifestWizardSteps/KustomizeWithGIT/KustomizeWithGIT'
import OpenShiftParamWithGit from './ManifestWizardSteps/OpenShiftParam/OSWithGit'
import css from './ManifestSelection.module.scss'

const allowedManifestTypes: Array<ManifestTypes> = [
  ManifestDataType.K8sManifest,
  ManifestDataType.Values,
  ManifestDataType.HelmChart,
  ManifestDataType.Kustomize,
  ManifestDataType.OpenshiftTemplate,
  ManifestDataType.OpenshiftParam
]
const manifestStoreTypes: Array<ManifestStores> = [
  ManifestStoreMap.Git,
  ManifestStoreMap.Github,
  ManifestStoreMap.GitLab,
  ManifestStoreMap.Bitbucket
]

const ManifestListView = ({
  pipeline,
  updateStage,
  identifierName,
  isForOverrideSets,
  stage,
  isForPredefinedSets,
  isPropagating,
  overrideSetIdentifier,
  connectors,
  refetchConnectors,
  isReadonly
}: ManifestListViewProps): JSX.Element => {
  const [selectedManifest, setSelectedManifest] = useState(allowedManifestTypes[0])
  const [connectorView, setConnectorView] = useState(false)
  const [manifestStore, setManifestStore] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const [manifestIndex, setEditIndex] = useState(0)

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: true,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()

  let listOfManifests = useMemo(() => {
    if (overrideSetIdentifier && overrideSetIdentifier.length) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      const { stages } = getFlattenedStages(pipeline)
      const overrideSets = get(
        stages[index],
        'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets',
        []
      )

      const selectedOverrideSet = overrideSets.find(
        ({ overrideSet }: { overrideSet: { identifier: string } }) => overrideSet.identifier === overrideSetIdentifier
      )

      return get(selectedOverrideSet, 'overrideSet.manifests', [])
    }
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    if (!get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets')) {
      set(stage as any, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets', [])
    }
    if (!get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests')) {
      // set(stage as {}, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    if (!get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests')) {
      set(stage as any, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
    }
    return !isForOverrideSets
      ? !isForPredefinedSets
        ? get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
        : get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
      : get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets', [])
  }, [
    overrideSetIdentifier,
    isPropagating,
    stage,
    isForOverrideSets,
    isForPredefinedSets,
    stage?.stage?.spec?.serviceConfig?.useFromStage?.stage,
    pipeline
  ])

  if (isForOverrideSets) {
    listOfManifests = listOfManifests
      .map((overrideSets: { overrideSet: { identifier: string; manifests: [any] } }) => {
        if (overrideSets?.overrideSet?.identifier === identifierName) {
          return overrideSets.overrideSet.manifests
        }
      })
      .filter((x: { overrideSet: { identifier: string; manifests: [any] } }) => x !== undefined)[0]
  }

  const removeManifestConfig = (index: number): void => {
    listOfManifests.splice(index, 1)

    if (stage) {
      updateStage(
        produce(stage, draft => {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', listOfManifests)
        }).stage as StageElementConfig
      )
    }
  }

  const addNewManifest = (): void => {
    setEditIndex(listOfManifests.length)
    showConnectorModal()
  }

  const editManifest = (manifestType: ManifestTypes, store: ManifestStores, index: number): void => {
    setSelectedManifest(manifestType)
    setManifestStore(store)
    setConnectorView(false)
    setEditIndex(index)
    showConnectorModal()
  }

  const getLastStepInitialData = (): ManifestConfig => {
    const initValues = get(listOfManifests[manifestIndex], 'manifest', null)
    return initValues
  }

  const getInitialValues = (): ManifestStepInitData => {
    const initValues = get(listOfManifests[manifestIndex], 'manifest.spec.store.spec', null)

    if (initValues) {
      const values = {
        ...initValues,
        store: listOfManifests[manifestIndex]?.manifest.spec?.store?.type,
        connectorRef: initValues?.connectorRef
      }
      return values
    }
    return {
      store: manifestStore,
      connectorRef: undefined
    }
  }

  const handleSubmit = (manifestObj: ManifestConfigWrapper): void => {
    manifestObj = {
      ...manifestObj,
      manifest: {
        ...manifestObj.manifest,
        type: selectedManifest
      }
    }

    if (isPropagating) {
      if (listOfManifests?.length > 0) {
        listOfManifests.splice(manifestIndex, 1, manifestObj)
      } else {
        listOfManifests.push(manifestObj)
      }
      hideConnectorModal()
      return
    }
    if (!isForOverrideSets) {
      if (listOfManifests?.length > 0) {
        listOfManifests.splice(manifestIndex, 1, manifestObj)
      } else {
        listOfManifests.push(manifestObj)
      }
    } else {
      listOfManifests.map((overrideSets: { overrideSet: { identifier: string; manifests: [any] } }) => {
        if (overrideSets.overrideSet.identifier === identifierName) {
          overrideSets.overrideSet.manifests.push(manifestObj)
        }
      })
    }

    if (stage) {
      updateStage(
        produce(stage, draft => {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', listOfManifests)
        }).stage as StageElementConfig
      )
    }
    hideConnectorModal()
    setConnectorView(false)
    refetchConnectors()
  }

  const changeManifestType = (selected: ManifestTypes): void => {
    setSelectedManifest(selected)
  }
  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = (store?: ManifestStores): void => {
    setManifestStore(store || '')
  }

  const lastStepProps = (): ManifestLastStepProps => {
    return {
      key: getString('pipeline.manifestType.manifestDetails'),
      name: getString('pipeline.manifestType.manifestDetails'),
      expressions,
      stepName: getString('pipeline.manifestType.manifestDetails'),
      initialValues: getLastStepInitialData(),
      handleSubmit: handleSubmit,
      selectedManifest,
      manifestIdsList: listOfManifests.map((item: ManifestConfigWrapper) => item.manifest?.identifier),
      isReadonly: isReadonly
    }
  }

  const getLabels = (): ConnectorRefLabelType => {
    return {
      firstStepName: getString('pipeline.manifestType.specifyManifestRepoType'),
      secondStepName: `${getString('common.specify')} ${manifestTypeLabels[selectedManifest]} ${getString('store')}`
    }
  }

  const getIconProps = (): IconProps => {
    const iconProps: IconProps = {
      name: manifestTypeIcons[selectedManifest]
    }

    if (selectedManifest === ManifestDataType.HelmChart) {
      iconProps.color = Color.WHITE
    }
    return iconProps
  }

  const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
    if (type === Connectors.GIT) {
      return buildGitPayload
    }
    if (type === Connectors.GITHUB) {
      return buildGithubPayload
    }
    if (type === Connectors.BITBUCKET) {
      return buildBitbucketPayload
    }
    if (type === Connectors.GITLAB) {
      return buildGitlabPayload
    }
    return () => ({})
  }

  const getLastSteps = (): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    let manifestDetailStep = null

    switch (true) {
      case selectedManifest === ManifestDataType.HelmChart &&
        [ManifestStoreMap.Git, ManifestStoreMap.Github, ManifestStoreMap.GitLab, ManifestStoreMap.Bitbucket].includes(
          manifestStore as ManifestStores
        ):
        manifestDetailStep = <HelmWithGIT {...lastStepProps()} />
        break

      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.Http:
        manifestDetailStep = <HelmWithHttp {...lastStepProps()} />
        break

      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.S3:
        manifestDetailStep = <HelmWithS3 {...lastStepProps()} />
        break
      case selectedManifest === ManifestDataType.HelmChart && manifestStore === ManifestStoreMap.Gcs:
        manifestDetailStep = <HelmWithGcs {...lastStepProps()} />
        break

      case selectedManifest === ManifestDataType.OpenshiftTemplate &&
        [ManifestStoreMap.Git, ManifestStoreMap.Github, ManifestStoreMap.GitLab, ManifestStoreMap.Bitbucket].includes(
          manifestStore as ManifestStores
        ):
        manifestDetailStep = <OpenShiftTemplateWithGit {...lastStepProps()} />
        break

      case selectedManifest === ManifestDataType.Kustomize &&
        [ManifestStoreMap.Git, ManifestStoreMap.Github, ManifestStoreMap.GitLab, ManifestStoreMap.Bitbucket].includes(
          manifestStore as ManifestStores
        ):
        manifestDetailStep = <KustomizeWithGIT {...lastStepProps()} />
        break
      case selectedManifest === ManifestDataType.OpenshiftParam &&
        [ManifestStoreMap.Git, ManifestStoreMap.Github, ManifestStoreMap.GitLab, ManifestStoreMap.Bitbucket].includes(
          manifestStore as ManifestStores
        ):
        manifestDetailStep = <OpenShiftParamWithGit {...lastStepProps()} />
        break

      case [ManifestDataType.K8sManifest, ManifestDataType.Values].includes(selectedManifest) &&
        [ManifestStoreMap.Git, ManifestStoreMap.Github, ManifestStoreMap.GitLab, ManifestStoreMap.Bitbucket].includes(
          manifestStore as ManifestStores
        ):
      default:
        manifestDetailStep = <ManifestDetails {...lastStepProps()} />

        break
    }

    arr.push(manifestDetailStep)
    return arr
  }

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    const buildPayload = getBuildPayload(ManifestToConnectorMap[manifestStore])
    switch (manifestStore) {
      case ManifestStoreMap.Http:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep
              type={ManifestToConnectorMap[manifestStore]}
              name={getString('overview')}
              isEditMode={isEditMode}
              gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
            />
            <StepHelmAuth
              name={getString('details')}
              identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              isEditMode={isEditMode}
              connectorInfo={undefined}
              setIsEditMode={setIsEditMode}
            />
            <DelegateSelectorStep
              name={getString('delegate.DelegateselectionLabel')}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              connectorInfo={undefined}
              buildPayload={buildHelmPayload}
            />

            <VerifyOutOfClusterDelegate
              name={getString('connectors.stepThreeName')}
              connectorInfo={undefined}
              isStep={true}
              isLastStep={false}
              type={ManifestToConnectorMap[manifestStore]}
            />
          </StepWizard>
        )
      case ManifestStoreMap.S3:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep
              type={ManifestToConnectorMap[manifestStore]}
              name={getString('overview')}
              isEditMode={isEditMode}
              gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
            />
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
              connectorInfo={undefined}
              isStep={true}
              isLastStep={false}
              type={ManifestToConnectorMap[manifestStore]}
            />
          </StepWizard>
        )
      case ManifestStoreMap.Gcs:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep
              type={Connectors.GCP}
              name={getString('overview')}
              isEditMode={isEditMode}
              connectorInfo={undefined}
              gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
            />
            <GcpAuthentication
              name={getString('details')}
              identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              onConnectorCreated={() => {
                //TO BE Removed
              }}
              connectorInfo={undefined}
            />
            <DelegateSelectorStep
              name={getString('delegate.DelegateselectionLabel')}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              buildPayload={buildGcpPayload}
              onConnectorCreated={() => {
                //TO BE Removed
              }}
              connectorInfo={undefined}
            />
            <VerifyOutOfClusterDelegate
              name={getString('connectors.stepThreeName')}
              connectorInfo={undefined}
              isStep={true}
              isLastStep={false}
              type={Connectors.GCP}
            />
          </StepWizard>
        )

      default:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep
              type={ManifestToConnectorMap[manifestStore]}
              name={getString('overview')}
              isEditMode={isEditMode}
              gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
            />
            <GitDetailsStep
              type={ManifestToConnectorMap[manifestStore]}
              name={getString('details')}
              isEditMode={isEditMode}
              connectorInfo={undefined}
            />
            {ManifestToConnectorMap[manifestStore] === Connectors.GIT ? (
              <StepGitAuthentication
                name={getString('credentials')}
                onConnectorCreated={() => {
                  // Handle on success
                }}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                connectorInfo={undefined}
                accountId={accountId}
                orgIdentifier={orgIdentifier}
                projectIdentifier={projectIdentifier}
              />
            ) : null}
            {ManifestToConnectorMap[manifestStore] === Connectors.GITHUB ? (
              <StepGithubAuthentication
                name={getString('credentials')}
                onConnectorCreated={() => {
                  // Handle on success
                }}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                connectorInfo={undefined}
                accountId={accountId}
                orgIdentifier={orgIdentifier}
                projectIdentifier={projectIdentifier}
              />
            ) : null}
            {ManifestToConnectorMap[manifestStore] === Connectors.BITBUCKET ? (
              <StepBitbucketAuthentication
                name={getString('credentials')}
                onConnectorCreated={() => {
                  // Handle on success
                }}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                connectorInfo={undefined}
                accountId={accountId}
                orgIdentifier={orgIdentifier}
                projectIdentifier={projectIdentifier}
              />
            ) : null}
            {ManifestToConnectorMap[manifestStore] === Connectors.GITLAB ? (
              <StepGitlabAuthentication
                name={getString('credentials')}
                identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
                onConnectorCreated={() => {
                  // Handle on success
                }}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                connectorInfo={undefined}
                accountId={accountId}
                orgIdentifier={orgIdentifier}
                projectIdentifier={projectIdentifier}
              />
            ) : null}
            <DelegateSelectorStep
              name={getString('delegate.DelegateselectionLabel')}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              buildPayload={buildPayload}
              connectorInfo={undefined}
            />
            <VerifyOutOfClusterDelegate
              name={getString('connectors.stepThreeName')}
              connectorInfo={undefined}
              isStep={true}
              isLastStep={false}
              type={ManifestToConnectorMap[manifestStore]}
            />
          </StepWizard>
        )
    }
  }, [connectorView, manifestStore, isEditMode])

  const { expressions } = useVariablesExpression()

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setConnectorView(false)
      hideConnectorModal()
      setManifestStore('')
      setIsEditMode(false)
    }
    const storeTypes =
      selectedManifest === ManifestDataType.HelmChart
        ? [...manifestStoreTypes, ManifestStoreMap.Http, ManifestStoreMap.S3, ManifestStoreMap.Gcs]
        : manifestStoreTypes
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          <ManifestWizard
            types={allowedManifestTypes}
            manifestStoreTypes={storeTypes}
            labels={getLabels()}
            selectedManifest={selectedManifest}
            newConnectorView={connectorView}
            expressions={expressions}
            changeManifestType={changeManifestType}
            handleConnectorViewChange={handleConnectorViewChange}
            handleStoreChange={handleStoreChange}
            initialValues={getInitialValues()}
            newConnectorSteps={getNewConnectorSteps()}
            lastSteps={getLastSteps()}
            iconsProps={getIconProps()}
            isReadonly={isReadonly}
          />
        </div>
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [selectedManifest, connectorView, manifestIndex, manifestStore, expressions.length, expressions, isEditMode])

  return (
    <Layout.Vertical spacing="small">
      {!!listOfManifests?.length && (
        <div className={cx(css.manifestList, css.listHeader)}>
          <span>{getString('common.ID')}</span>
          <span>{getString('pipelineSteps.serviceTab.manifestList.manifestType')}</span>
          <span>{getString('pipelineSteps.serviceTab.manifestList.manifestStore')}</span>
          <span>{getString('location')}</span>

          <span></span>
        </div>
      )}
      <Layout.Vertical spacing="medium">
        <section>
          {listOfManifests &&
            listOfManifests.map((data: ManifestConfigWrapper, index: number) => {
              const manifest = data['manifest']

              const { color } = getStatus(manifest?.spec?.store?.spec?.connectorRef, connectors, accountId)
              const connectorName = getConnectorNameFromValue(manifest?.spec?.store?.spec?.connectorRef, connectors)

              return (
                <section className={cx(css.manifestList, css.rowItem)} key={`${manifest?.identifier}-${index}`}>
                  <div className={css.columnId}>
                    <Icon inline name={manifestTypeIcons[manifest?.type as ManifestTypes]} size={20} />
                    <Text inline width={150} className={css.type} color={Color.BLACK} lineClamp={1}>
                      {manifest?.identifier}
                    </Text>
                  </div>
                  <div>{manifestTypeLabels[manifest?.type as ManifestTypes]}</div>
                  <div className={css.connectorNameField}>
                    <Icon
                      padding={{ right: 'small' }}
                      name={ManifestIconByType[manifest?.spec?.store.type as ManifestStores]}
                      size={18}
                    />
                    <Text className={css.connectorName} lineClamp={1}>
                      {connectorName ?? manifest?.spec?.store.spec.connectorRef}
                    </Text>
                    <Icon name="full-circle" size={12} color={color} />
                  </div>

                  {!!manifest?.spec?.store.spec.paths?.length && (
                    <span>
                      <Text width={200} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {typeof manifest?.spec?.store.spec.paths === 'string'
                          ? manifest?.spec?.store.spec.paths
                          : manifest?.spec?.store.spec.paths.join(', ')}
                      </Text>
                    </span>
                  )}
                  {!!manifest?.spec?.store.spec.folderPath && (
                    <span>
                      <Text width={200} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {manifest.spec.store?.spec?.folderPath}
                      </Text>
                    </span>
                  )}

                  {!!(manifest?.spec?.chartName && !manifest?.spec?.store.spec.folderPath) && (
                    <span>
                      <Text width={220} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {manifest.spec.chartName}
                      </Text>
                    </span>
                  )}

                  {!overrideSetIdentifier?.length && !isReadonly && (
                    <span className={css.lastColumn}>
                      <Layout.Horizontal spacing="medium" className={css.actionGrid}>
                        <Icon
                          name="Edit"
                          size={16}
                          onClick={() =>
                            editManifest(
                              manifest?.type as ManifestTypes,
                              manifest?.spec?.store.type as ManifestStores,
                              index
                            )
                          }
                        />

                        <Icon name="bin-main" size={25} onClick={() => removeManifestConfig(index)} />
                      </Layout.Horizontal>
                    </span>
                  )}
                </section>
              )
            })}
        </section>

        {!overrideSetIdentifier?.length && !isReadonly && (
          <Text
            intent="primary"
            style={{ cursor: 'pointer', marginBottom: 'var(--spacing-medium)' }}
            onClick={() => addNewManifest()}
          >
            <String stringID="pipelineSteps.serviceTab.manifestList.addManifest" />
          </Text>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ManifestListView
