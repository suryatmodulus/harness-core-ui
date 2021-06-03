import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, noop } from 'lodash-es'
import { Classes, Dialog } from '@blueprintjs/core'
import { Button, Layout, Container, Icon, Text, Color, useModalHook } from '@wings-software/uicore'
import { parse } from 'yaml'
import cx from 'classnames'
import moment from 'moment'
import { useToaster, useConfirmationDialog, StringUtils } from '@common/exports'
import {
  ConnectorInfoDTO,
  ConnectorRequestBody,
  ConnectorResponse,
  ResponseJsonNode,
  ResponseYamlSnippets,
  ResponsePageSecretResponseWrapper,
  ConnectorConnectivityDetails,
  UpdateConnectorQueryParams,
  useGetYamlSchema,
  Connector,
  EntityGitDetails,
  ResponseMessage,
  useCreatePR,
  ResponseConnectorResponse
} from 'services/cd-ng'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import TestConnection from '@connectors/components/TestConnection/TestConnection'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { UseGetMockData } from '@common/utils/testUtils'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { Connectors, ConnectorStatus } from '@connectors/constants'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { useGitDiffEditorDialog } from '@common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { ProgressOverlay, StepStatus } from '@common/modals/ProgressOverlay/ProgressOverlay'
import { getUrlValueByType } from './utils/ConnectorUtils'
import SavedConnectorDetails from './views/savedDetailsView/SavedConnectorDetails'
import css from './ConnectorView.module.scss'

export interface ConnectorViewProps {
  type: ConnectorInfoDTO['type']
  response: ConnectorResponse
  updateConnector: (
    data: ConnectorRequestBody,
    queryParams?: UpdateConnectorQueryParams
  ) => Promise<ResponseConnectorResponse>
  refetchConnector: () => Promise<any>
  mockMetaData?: UseGetMockData<ResponseYamlSnippets>
  mockSnippetData?: UseGetMockData<ResponseJsonNode>
  mockSchemaData?: UseGetMockData<ResponseJsonNode>
  mockSecretData?: UseGetMockData<ResponsePageSecretResponseWrapper>
}

interface ConnectorActivityDetailsProp {
  connector: ConnectorResponse
}

interface ConnectorViewState {
  enableEdit: boolean
  setEnableEdit: (val: boolean) => void
  connector: ConnectorInfoDTO
  setConnector: (object: ConnectorInfoDTO) => void
  selectedView: string
  setSelectedView: (selection: string) => void
}

const SelectedView = {
  VISUAL: 'VISUAL',
  YAML: 'YAML'
}

const ConnectorView: React.FC<ConnectorViewProps> = (props: ConnectorViewProps) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    accountId: string
    projectIdentifier: string
    orgIdentifier: string
  }>()
  const [enableEdit, setEnableEdit] = useState(false)
  const [selectedView, setSelectedView] = useState(SelectedView.VISUAL)
  const [connector, setConnector] = useState<ConnectorInfoDTO>(props.response?.connector || ({} as ConnectorInfoDTO))
  const [connectorForYaml, setConnectorForYaml] = useState<ConnectorInfoDTO>(
    props.response?.connector || ({} as ConnectorInfoDTO)
  )

  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [isValidYAML] = React.useState<boolean>(true)
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false)
  const { getString } = useStrings()
  // TODO: remove the connector condition after migrating CEAWS connector to 35-connectors module
  const isHarnessManaged = props.response?.harnessManaged || props.response.connector?.type === Connectors.CEAWS
  const [hasConnectorChanged, setHasConnectorChanged] = useState<boolean>(false)
  const { isGitSyncEnabled } = useAppStore()

  const [canEditConnector] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: connector.identifier
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    []
  )

  const onConnectorChange = (isEditorDirty: boolean): void => {
    setHasConnectorChanged(isEditorDirty)
  }

  const state: ConnectorViewState = {
    enableEdit,
    setEnableEdit,
    connector,
    setConnector,
    selectedView,
    setSelectedView
  }
  const { showError } = useToaster()
  // git sync related state vars
  const { mutate: createPullRequest, loading: creatingPR } = useCreatePR({})
  const [connectorCreateUpdateStatus, setConnectorCreateUpdateStatus] = useState<StepStatus>()
  const [prCreateStatus, setPRCreateStatus] = useState<StepStatus>()
  const [prMetaData, setPRMetaData] = useState<
    Pick<SaveToGitFormInterface, 'branch' | 'targetBranch' | 'isNewBranch'>
  >()
  const [connectorCreateUpdateError, setConnectorCreateUpdateError] = useState<Record<string, any>>()
  //

  const connectorName = (connector as ConnectorInfoDTO)?.name
  const fromBranch = prMetaData?.branch || ''
  const toBranch = prMetaData?.targetBranch || ''
  const connectorCreateUpdateStage = {
    status: connectorCreateUpdateStatus,
    intermediateLabel: getString('connectors.updating', { name: connectorName }),
    finalLabel: connectorCreateUpdateError?.data?.message || connectorCreateUpdateError?.message
  }
  const setupBranchStage = {
    status: connectorCreateUpdateStatus,
    intermediateLabel: getString('common.gitSync.settingUpNewBranch', {
      branch: fromBranch
    })
  }
  const pushingChangesToBranch = {
    status: connectorCreateUpdateStatus,
    intermediateLabel: getString('common.gitSync.pushingChangestoBranch', {
      branch: fromBranch
    })
  }
  const createPRStage = {
    status: prCreateStatus,
    intermediateLabel: getString('common.gitSync.creatingPR', {
      fromBranch,
      toBranch
    }),
    finalLabel: getString('common.gitSync.unableToCreatePR')
  }

  // modal to show while creating/updating a connector and creating a PR
  const [
    showCreateUpdateConnectorWithPRCreationModal,
    hideCreateUpdateConnectorWithPRCreationModal
  ] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        className={Classes.DIALOG}
        style={{
          minWidth: 600,
          paddingBottom: 0,
          maxHeight: 500
        }}
      >
        <ProgressOverlay
          preFirstStage={prMetaData?.isNewBranch ? setupBranchStage : undefined}
          firstStage={connectorCreateUpdateStage}
          postFirstStage={pushingChangesToBranch}
          secondStage={createPRStage}
          onClose={() => {
            hideCreateUpdateConnectorWithPRCreationModal()
            props.refetchConnector()
            state.setEnableEdit(false)
          }}
        />
      </Dialog>
    )
  }, [creatingPR, connectorCreateUpdateStatus, connectorCreateUpdateError, prCreateStatus, prMetaData])

  //modal to show while only creating/updating a connector
  const [showCreateUpdateConnectorModal, hideCreateUpdateConnectorModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        className={Classes.DIALOG}
        style={{
          minWidth: 600,
          paddingBottom: 0,
          maxHeight: 500
        }}
      >
        <ProgressOverlay
          firstStage={connectorCreateUpdateStage}
          onClose={() => {
            hideCreateUpdateConnectorModal()
            props.refetchConnector()
            state.setEnableEdit(false)
          }}
        />
      </Dialog>
    )
  }, [connectorCreateUpdateStatus, connectorCreateUpdateError])

  // modal to show when a git conflict occurs
  const { openGitDiffDialog } = useGitDiffEditorDialog<Connector>({
    onSuccess: (payload: Connector, objectId: EntityGitDetails['objectId'], gitData?: SaveToGitFormInterface): void => {
      try {
        handleSaveYaml({ payload, gitData }, objectId)
      } catch (e) {
        //ignore error
      }
    },
    onClose: noop
  })

  const onSubmit = async (
    connectorPayload: ConnectorRequestBody,
    gitData?: SaveToGitFormInterface,
    queryParams?: UpdateConnectorQueryParams
  ) => {
    setConnectorCreateUpdateStatus('IN_PROGRESS')
    if (isGitSyncEnabled && gitData?.createPr) {
      setPRMetaData({ branch: gitData?.branch, targetBranch: gitData?.targetBranch, isNewBranch: gitData?.isNewBranch })
      setPRCreateStatus('IN_PROGRESS')
      showCreateUpdateConnectorWithPRCreationModal()
    } else {
      showCreateUpdateConnectorModal()
    }
    try {
      const response = await props.updateConnector(connectorPayload, queryParams)
      setConnectorCreateUpdateStatus(response.status)
      // if connector creation/update succeeds, raise a PR, if specified
      if (response.status === 'SUCCESS') {
        if (isGitSyncEnabled && gitData?.createPr) {
          try {
            const _response = await createPullRequest(
              {
                sourceBranch: gitData?.branch || '',
                targetBranch: gitData?.targetBranch || '',
                title: gitData?.commitMsg || ''
              },
              {
                queryParams: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier,
                  yamlGitConfigIdentifier: gitData?.repoIdentifier || ''
                }
              }
            )
            setPRCreateStatus(_response?.status)
          } catch (e) {
            setPRCreateStatus('ERROR')
          }
        }
      } // if connector creation/update fails, abort PR creation
      else {
        setPRCreateStatus('ABORTED')
      }
    } /* istanbul ignore next */ catch (e) {
      if (
        isGitSyncEnabled &&
        ((e.data?.responseMessages as ResponseMessage[]) || [])?.findIndex(
          (mssg: ResponseMessage) => mssg.code === 'SCM_CONFLICT_ERROR'
        ) !== -1
      ) {
        openGitDiffDialog(connectorPayload, gitData)
      } else {
        setConnectorCreateUpdateStatus('ERROR')
        setPRCreateStatus('ABORTED')
        setConnectorCreateUpdateError(e)
      }
    }
    setIsUpdating(false)
  }

  const handleModeSwitch = (targetMode: string): void => {
    if (targetMode === SelectedView.VISUAL) {
      try {
        const connectorJSONEq = props.response?.connector || ({} as ConnectorInfoDTO)
        setSelectedView(targetMode)
        setConnector(connectorJSONEq)
        setConnectorForYaml(connectorJSONEq)
      } /* istanbul ignore next */ catch (err) {
        showError(err.name ? `${err.name}: ${err.message}` : err)
      }
    } else {
      fetchingConnectorSchema()
      setSelectedView(targetMode)
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (gitDetails: SaveToGitFormInterface): void => handleSaveYaml({ gitData: gitDetails }),
    onClose: noop
  })

  /* excluding below method from coverage since it's called only by YAMLBuilder */
  /* istanbul ignore next */
  const handleSaveYaml = (
    connectorData?: {
      gitData?: SaveToGitFormInterface
      payload?: Connector
    },
    objectId?: EntityGitDetails['objectId']
  ): void => {
    const { gitData, payload } = connectorData || {}
    let connectorJSONEq
    try {
      connectorJSONEq = !isEmpty(payload) ? payload : parse(yamlHandler?.getLatestYaml?.() || '')
      if (connectorJSONEq) {
        const errorMap = yamlHandler?.getYAMLValidationErrorMap?.()
        if (errorMap && errorMap.size > 0) {
          showError(getString('yamlBuilder.yamlError'))
        } else {
          const queryParams = gitData
            ? {
                accountIdentifier: accountId,
                ...gitData,
                lastObjectId: objectId ?? props.response?.gitDetails?.objectId
              }
            : {}
          onSubmit(connectorJSONEq, gitData, queryParams)
          setConnector(connectorJSONEq?.connector)
          setConnectorForYaml(connectorJSONEq?.connector)
        }
      }
    } /* istanbul ignore next */ catch (e) {
      // yaml parse errors
      if (e?.toString().includes('YAMLSemanticError')) {
        showError(e?.message || e)
      }
    }
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: data => {
      setConnector(data?.connector as ConnectorInfoDTO)
      setConnectorForYaml(data?.connector as ConnectorInfoDTO)
      state.setEnableEdit(false)
    },
    onClose: () => {
      state.setEnableEdit(false)
      props.refetchConnector()
    }
  })

  useEffect(() => {
    if (props.response?.connector) {
      setConnector(props.response.connector)
      setConnectorForYaml(props.response.connector)
    }
  }, [props.response])

  const { data: connectorSchema, loading: isFetchingSchema, refetch: fetchingConnectorSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Connectors',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    },
    mock: props.mockSchemaData,
    lazy: true
  })

  const RenderConnectorStatus = (status: ConnectorConnectivityDetails['status']): React.ReactElement => {
    if (status !== 'SUCCESS' && status !== 'FAILURE') {
      return (
        <Text inline={true} font={{ size: 'medium' }}>
          {getString('na')}
        </Text>
      )
    }
    return (
      <>
        <Icon
          inline={true}
          name={status === 'SUCCESS' ? 'deployment-success-new' : 'warning-sign'}
          size={18}
          padding={{ left: 'medium' }}
          color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
        ></Icon>
        <Text inline={true} font={{ size: 'medium' }} color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}>
          {status === ConnectorStatus.FAILURE ? getString('failed') : getString('success')}
        </Text>
      </>
    )
  }

  const getValue = (value?: number) => {
    return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
  }

  const ConnectorActivityDetails: React.FC<ConnectorActivityDetailsProp> = (
    activityDetailsProp: ConnectorActivityDetailsProp
  ) => {
    const lastTestedAt = getValue(activityDetailsProp.connector?.status?.testedAt)
    const lastConnectedAt = getValue(activityDetailsProp.connector?.status?.lastConnectedAt)

    return (
      <Layout.Vertical className={css.activityContainer}>
        <Container className={css.activitySummary}>
          <Layout.Horizontal spacing="small">
            <Text font={{ weight: 'bold', size: 'medium' }} inline={true} color={Color.GREY_800}>
              {getString('connectivityStatus')}
            </Text>
            {RenderConnectorStatus(activityDetailsProp.connector?.status?.status)}
          </Layout.Horizontal>
          <Text margin={{ top: 'small', bottom: 'small' }}>
            {getString('lastStatusCheckAt')} {lastTestedAt ? `${lastTestedAt}` : getString('na')}
          </Text>
          <Text margin={{ top: 'small', bottom: 'medium' }}>
            {getString('lastSuccessfulStatusCheckAt')} {lastConnectedAt ? `${lastConnectedAt}` : getString('na')}
          </Text>
          <TestConnection
            connector={connector}
            gitDetails={activityDetailsProp?.connector.gitDetails}
            // ToDo:  delegateName={connector?.spec?.credential?.spec?.delegateName || ''}
            testUrl={getUrlValueByType(connector?.type || '', connector)}
            refetchConnector={props.refetchConnector}
          />
        </Container>
        <Container>
          <Text
            font={{ weight: 'bold', size: 'medium' }}
            margin={{ top: 'large', bottom: 'large' }}
            color={Color.GREY_800}
          >
            {getString('changeHistory')}
          </Text>
          <Text color={Color.GREY_800}>{getString('lastUpdated')}</Text>
          <Text margin={{ top: 'small', bottom: 'small' }}>
            {getValue(activityDetailsProp.connector.lastModifiedAt)}{' '}
          </Text>
          <Text color={Color.GREY_800}>{getString('connectorCreated')}</Text>
          <Text margin={{ top: 'small', bottom: 'medium' }}>{getValue(activityDetailsProp.connector.createdAt)} </Text>
        </Container>
      </Layout.Vertical>
    )
  }

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('continueWithoutSavingText'),
    titleText: getString('continueWithoutSavingTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        setEnableEdit(false)
        setConnectorForYaml(props.response?.connector || ({} as ConnectorInfoDTO))
        setHasConnectorChanged(false)
      }
    }
  })

  const resetEditor = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
    openDialog()
  }

  const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
    fileName: `${connectorForYaml?.name ?? 'Connector'}.yaml`,
    entityType: 'Connectors',
    existingJSON: { connector: connectorForYaml },
    isReadOnlyMode: true,
    height: 'calc(100vh - 350px)',
    yamlSanityConfig: {
      removeEmptyString: false
    }
  }

  return (
    <Layout.Horizontal padding="large" height="inherit">
      <Layout.Vertical width={enableEdit && selectedView === SelectedView.YAML ? '100%' : '67%'} padding="small">
        <Container className={css.buttonContainer}>
          {state.enableEdit ? null : (
            <div className={css.optionBtns}>
              <div
                className={cx(
                  css.item,
                  { [css.selected]: selectedView === SelectedView.VISUAL },
                  { [css.disabled]: !isValidYAML }
                )}
                onClick={() => handleModeSwitch(SelectedView.VISUAL)}
              >
                {getString('visual')}
              </div>
              <div
                className={cx(css.item, { [css.selected]: selectedView === SelectedView.YAML })}
                onClick={() => handleModeSwitch(SelectedView.YAML)}
                data-test="connectorViewYaml"
              >
                {getString('yaml')}
              </div>
            </div>
          )}
          {state.enableEdit || isHarnessManaged ? null : (
            <RbacButton
              id="editDetailsBtn"
              text={getString('editDetails')}
              icon="edit"
              permission={{
                permission: PermissionIdentifier.UPDATE_CONNECTOR,
                resource: {
                  resourceType: ResourceType.CONNECTOR,
                  resourceIdentifier: connector.identifier
                }
              }}
              onClick={() => {
                state.setEnableEdit(true)
                selectedView === SelectedView.VISUAL
                  ? openConnectorModal(true, props.type, {
                      connectorInfo: connector,
                      gitDetails: { ...props.response?.gitDetails, getDefaultFromOtherRepo: false }
                    })
                  : undefined
              }}
              withoutBoxShadow
            />
          )}
        </Container>
        <Layout.Horizontal height="100%">
          {isUpdating ? <PageSpinner message={getString('connectors.updating', { name: connector?.name })} /> : null}
          {enableEdit ? (
            selectedView === SelectedView.VISUAL ? null : isFetchingSchema ? (
              <PageSpinner />
            ) : (
              <div className={css.fullWidth}>
                <YamlBuilder
                  {...yamlBuilderReadOnlyModeProps}
                  // snippets={snippetMetaData?.data?.yamlSnippets}
                  // onSnippetCopy={onSnippetCopy}
                  // snippetFetchResponse={snippetFetchResponse}
                  schema={connectorSchema?.data}
                  isReadOnlyMode={false}
                  bind={setYamlHandler}
                  onChange={onConnectorChange}
                  showSnippetSection={false}
                />
                <Layout.Horizontal spacing="small">
                  <Button
                    id="saveYAMLChanges"
                    intent="primary"
                    text={getString('saveChanges')}
                    onClick={() => {
                      if (isGitSyncEnabled) {
                        openSaveToGitDialog(true, {
                          type: 'Connectors',
                          name: props.response.connector?.name || '',
                          identifier: props.response.connector?.identifier || '',
                          gitDetails: props.response.gitDetails
                        })
                      } else {
                        handleSaveYaml()
                      }
                    }}
                    margin={{ top: 'large' }}
                    title={isValidYAML ? '' : getString('invalidYaml')}
                    disabled={!hasConnectorChanged}
                  />
                  <Button text={getString('cancel')} margin={{ top: 'large' }} onClick={resetEditor} />
                </Layout.Horizontal>
              </div>
            )
          ) : selectedView === SelectedView.VISUAL ? (
            <Layout.Horizontal spacing="medium" height="100%" width="100%">
              <SavedConnectorDetails connector={connector}></SavedConnectorDetails>
            </Layout.Horizontal>
          ) : isFetchingSchema ? (
            <PageSpinner />
          ) : (
            <Layout.Horizontal spacing="medium" className={css.fullWidth}>
              <div className={css.yamlView} data-test="yamlBuilderContainer">
                <YamlBuilder
                  {...yamlBuilderReadOnlyModeProps}
                  showSnippetSection={false}
                  onEnableEditMode={() => setEnableEdit(true)}
                  isEditModeSupported={canEditConnector}
                />
              </div>
            </Layout.Horizontal>
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
      {enableEdit && selectedView === SelectedView.YAML ? null : (
        <ConnectorActivityDetails connector={props.response}></ConnectorActivityDetails>
      )}
    </Layout.Horizontal>
  )
}

export default ConnectorView
