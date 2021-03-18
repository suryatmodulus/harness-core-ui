import React, { useCallback, useState } from 'react'
import { Layout, Text, Icon, Color, useModalHook, StepWizard, StepProps, Button } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import { get, set } from 'lodash-es'

import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { useStrings, String } from 'framework/exports'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepHelmAuth from '@connectors/components/CreateConnector/HelmRepoConnector/StepHelmRepoAuth'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { ManifestWizard } from './ManifestWizard/ManifestWizard'
import {
  getStageIndexFromPipeline,
  getFlattenedStages,
  getStatus
} from '../PipelineStudio/StageBuilder/StageBuilderUtil'
import {
  getManifestIconByType,
  ManifestDataType,
  ManifestToConnectorMap,
  ManifestStoreMap,
  manifestTypeIcons,
  manifestTypeText
} from './Manifesthelper'
import ManifestDetails from './ManifestWizardSteps/ManifestDetails'
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
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './ManifestSelection.module.scss'

const allowedManifestTypes: Array<ManifestTypes> = [
  ManifestDataType.K8sManifest,
  ManifestDataType.Values,
  ManifestDataType.HelmChart
]
const manifestStoreTypes: Array<ManifestStores> = [
  ManifestStoreMap.Git,
  ManifestStoreMap.Github,
  ManifestStoreMap.GitLab,
  ManifestStoreMap.Bitbucket
]

const ManifestListView = ({
  pipeline,
  updatePipeline,
  identifierName,
  isForOverrideSets,
  stage,
  isForPredefinedSets,
  isPropagating,
  overrideSetIdentifier,
  connectors,
  refetchConnectors
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

  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { getString } = useStrings()

  const getManifestList = useCallback(() => {
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
      set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets', [])
    }
    if (!get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests')) {
      // set(stage as {}, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    if (!get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests')) {
      set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
    }
    return !isForOverrideSets
      ? !isForPredefinedSets
        ? get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
        : get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
      : get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestOverrideSets', [])
  }, [isForOverrideSets, isPropagating, isForPredefinedSets, overrideSetIdentifier])

  let listOfManifests = getManifestList()

  if (isForOverrideSets) {
    listOfManifests = listOfManifests
      .map((overrideSets: { overrideSet: { identifier: string; manifests: [{}] } }) => {
        if (overrideSets?.overrideSet?.identifier === identifierName) {
          return overrideSets.overrideSet.manifests
        }
      })
      .filter((x: { overrideSet: { identifier: string; manifests: [{}] } }) => x !== undefined)[0]
  }

  const removeManifestConfig = (index: number): void => {
    listOfManifests.splice(index, 1)
    updatePipeline(pipeline)
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
      updatePipeline(pipeline)
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
      listOfManifests.map((overrideSets: { overrideSet: { identifier: string; manifests: [{}] } }) => {
        if (overrideSets.overrideSet.identifier === identifierName) {
          overrideSets.overrideSet.manifests.push(manifestObj)
        }
      })
    }

    updatePipeline(pipeline)
    hideConnectorModal()
    setConnectorView(false)
    refetchConnectors()
  }

  const changeManifestType = (selected: ManifestTypes): void => {
    setSelectedManifest(selected)
  }
  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
  }
  const handleStoreChange = (store?: ManifestStores): void => {
    setManifestStore(store || '')
  }

  const lastStepProps = (): ManifestLastStepProps => {
    return {
      key: getString('manifestType.manifestDetails'),
      name: getString('manifestType.manifestDetails'),
      expressions,
      stepName: getString('manifestType.manifestDetails'),
      initialValues: getLastStepInitialData(),
      handleSubmit: handleSubmit,
      selectedManifest
    }
  }

  const getLabels = (): ConnectorRefLabelType => {
    return {
      firstStepName: getString('manifestType.specifyManifestRepoType'),
      secondStepName: getString('manifestType.specifyManifestStore'),
      newConnector: getString('newConnector')
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
    if (manifestStore === ManifestStoreMap.Http) {
      return (
        <StepWizard title={getString('connectors.createNewConnector')}>
          <ConnectorDetailsStep
            type={ManifestToConnectorMap[manifestStore]}
            name={getString('overview')}
            isEditMode={isEditMode}
          />
          <StepHelmAuth
            name={getString('details')}
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            isEditMode={isEditMode}
            connectorInfo={undefined}
            setIsEditMode={setIsEditMode}
          />

          <VerifyOutOfClusterDelegate
            name={getString('connectors.stepThreeName')}
            isStep={true}
            isLastStep={false}
            type={ManifestToConnectorMap[manifestStore]}
          />
        </StepWizard>
      )
    }
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={ManifestToConnectorMap[manifestStore]}
          name={getString('overview')}
          isEditMode={isEditMode}
        />
        <GitDetailsStep
          type={ManifestToConnectorMap[manifestStore]}
          name={getString('details')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
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
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          isStep={true}
          isLastStep={false}
          type={ManifestToConnectorMap[manifestStore]}
        />
      </StepWizard>
    )
  }, [connectorView])
  const { expressions } = useVariablesExpression()

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setConnectorView(false)
      hideConnectorModal()
      setManifestStore('')
    }
    const storeTypes = manifestStoreTypes
    // Connectors.HttpHelmRepo is commented till BE is ready
    //  const storeTypes = selectedManifest === ManifestDataType.HelmChart
    //   ? [...manifestStoreTypes, Connectors.HttpHelmRepo]
    //   : manifestStoreTypes

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
          />
        </div>
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [selectedManifest, connectorView, manifestIndex, manifestStore, expressions.length, expressions])

  return (
    <Layout.Vertical spacing="small">
      <div className={cx(css.manifestList, css.listHeader)}>
        <span>{getString('cf.targets.ID')}</span>
        <span>{getString('pipelineSteps.serviceTab.manifestList.manifestFormat')}</span>
        <span>{getString('pipelineSteps.serviceTab.manifestList.manifestStore')}</span>
        <span>{getString('location')}</span>

        <span></span>
      </div>
      <Layout.Vertical spacing="medium">
        <section>
          {listOfManifests &&
            listOfManifests.map((data: ManifestConfigWrapper, index: number) => {
              const manifest = data['manifest']

              const { color } = getStatus(manifest?.spec?.store?.spec?.connectorRef, connectors, accountId)

              return (
                <section className={cx(css.manifestList, css.rowItem)} key={`${manifest?.identifier}-${index}`}>
                  <div className={css.columnId}>
                    <Icon inline name={manifestTypeIcons[manifest?.type as ManifestTypes]} size={20} />
                    <Text inline width={150} className={css.type} color={Color.BLACK} lineClamp={1}>
                      {manifest?.identifier}
                    </Text>
                  </div>
                  <div>{manifestTypeText[manifest?.type as ManifestTypes]}</div>
                  <div className={css.server}>
                    <Text
                      inline
                      icon={getManifestIconByType(manifest?.spec?.store.type)}
                      iconProps={{ size: 18 }}
                      width={200}
                      lineClamp={1}
                      style={{ color: Color.BLACK, fontWeight: 900 }}
                    >
                      {manifest?.spec?.store.type}
                    </Text>

                    <Text width={200} icon="full-circle" iconProps={{ size: 10, color }} />
                  </div>

                  {!!manifest?.spec?.store.spec.paths?.length && (
                    <span>
                      <Text width={150} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {typeof manifest?.spec?.store.spec.paths === 'string'
                          ? manifest?.spec?.store.spec.paths
                          : manifest?.spec?.store.spec.paths.join(', ')}
                      </Text>
                    </span>
                  )}
                  {!!manifest?.spec?.store.spec.folderPath && (
                    <span>
                      <Text width={150} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {manifest.spec.store?.spec?.folderPath}
                      </Text>
                    </span>
                  )}

                  {!!manifest?.spec?.chartName && (
                    <span>
                      <Text width={220} lineClamp={1} style={{ color: Color.GREY_500 }}>
                        {manifest.spec.chartName}
                      </Text>
                    </span>
                  )}

                  {!overrideSetIdentifier?.length && (
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
                        {/* <Icon
                              name="main-clone"
                              size={16}
                              style={{ cursor: 'pointer' }}
                              className={css.cloneIcon}
                              // onClick={() => editManifest(manifest)}
                            /> */}
                        <Icon name="bin-main" size={25} onClick={() => removeManifestConfig(index)} />
                      </Layout.Horizontal>
                    </span>
                  )}
                </section>
              )
            })}
        </section>

        {!overrideSetIdentifier?.length && (
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
