import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, noop, omit } from 'lodash-es'
import { Button, Layout, Container, Icon, Text, Color } from '@wings-software/uicore'
import { parse } from 'yaml'
import moment from 'moment'
import { useToaster, useConfirmationDialog, StringUtils } from '@common/exports'
import {
  ConnectorInfoDTO,
  ConnectorResponse,
  ResponseJsonNode,
  ResponseYamlSnippets,
  ResponsePageSecretResponseWrapper,
  ConnectorConnectivityDetails,
  useGetYamlSchema,
  Connector,
  EntityGitDetails,
  useUpdateConnector,
  CreateConnectorQueryParams
} from 'services/cd-ng'
import VisualYamlToggle, { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import TestConnection from '@connectors/components/TestConnection/TestConnection'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { UseGetMockData } from '@common/utils/testUtils'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import { ConnectorStatus } from '@connectors/constants'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { shouldShowError } from '@common/utils/errorUtils'
import { getUrlValueByType, isSMConnector } from './utils/ConnectorUtils'
import SavedConnectorDetails from './views/savedDetailsView/SavedConnectorDetails'
import css from './ConnectorView.module.scss'

export interface ConnectorViewProps {
  type: ConnectorInfoDTO['type']
  response: ConnectorResponse
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
  setSelectedView: (selection: SelectedView) => void
}

const ConnectorView: React.FC<ConnectorViewProps> = (props: ConnectorViewProps) => {
  const { showSuccess, showError } = useToaster()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    accountId: string
    projectIdentifier: string
    orgIdentifier: string
  }>()
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const [enableEdit, setEnableEdit] = useState(false)
  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const [connector, setConnector] = useState<ConnectorInfoDTO>(props.response?.connector || ({} as ConnectorInfoDTO))
  const [connectorForYaml, setConnectorForYaml] = useState<ConnectorInfoDTO>(
    props.response?.connector || ({} as ConnectorInfoDTO)
  )

  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [isValidYAML] = React.useState<boolean>(true)
  const { getString } = useStrings()
  const isHarnessManaged = props.response?.harnessManaged
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

  const handleModeSwitch = (newView: SelectedView): boolean => {
    if (newView === selectedView) return false
    if (newView === SelectedView.VISUAL) {
      try {
        const connectorJSONEq = props.response?.connector || ({} as ConnectorInfoDTO)
        setSelectedView(newView)
        setConnector(connectorJSONEq)
        setConnectorForYaml(connectorJSONEq)
      } /* istanbul ignore next */ catch (err) {
        showError(err.name ? `${err.name}: ${err.message}` : err)
      }
    } else {
      setSelectedView(SelectedView.YAML)
    }
    return true
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<Connector>({
    onSuccess: (
      gitDetails: SaveToGitFormInterface,
      payload?: Connector,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> => handleSaveYaml({ gitData: gitDetails, payload }, objectId),
    onClose: noop
  })

  /* excluding below method from coverage since it's called only by YAMLBuilder */
  /* istanbul ignore next */
  const handleSaveYaml = async (
    connectorData?: {
      gitData?: SaveToGitFormInterface
      payload?: Connector
    },
    objectId?: EntityGitDetails['objectId']
  ): Promise<UseSaveSuccessResponse> => {
    const { gitData, payload } = connectorData || {}
    const connectorJSONEq = !isEmpty(payload) ? payload : parse(yamlHandler?.getLatestYaml?.() || '')
    const errorMap = yamlHandler?.getYAMLValidationErrorMap?.()
    if (errorMap && errorMap.size > 0) {
      showError(getString('yamlBuilder.yamlError'))
      return {
        status: 'ERROR'
      }
    } else {
      let queryParams: CreateConnectorQueryParams = {}
      if (gitData) {
        queryParams = {
          accountIdentifier: accountId,
          ...omit(gitData, 'sourceBranch')
        }
      }
      const response = await updateConnector(connectorJSONEq, {
        queryParams: {
          ...queryParams,
          lastObjectId: objectId ?? props.response?.gitDetails?.objectId,
          baseBranch: props.response?.gitDetails?.branch
        }
      })
      if (response.status === 'SUCCESS' && response?.data?.connector) {
        setEnableEdit(false)
        setConnector(response?.data?.connector)
        setConnectorForYaml(response?.data?.connector)
      }
      return {
        status: response.status,
        nextCallback: () => props.refetchConnector()
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

  const {
    data: connectorSchema,
    loading: isFetchingSchema,
    refetch
  } = useGetYamlSchema({
    queryParams: {
      entityType: 'Connectors',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    },
    mock: props.mockSchemaData,
    lazy: true
  })

  React.useEffect(() => {
    if (selectedView === SelectedView.YAML && enableEdit) {
      refetch()
    }
  }, [enableEdit])

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
            <VisualYamlToggle
              initialSelectedView={SelectedView.VISUAL}
              beforeOnChange={(nextMode, callback) => {
                const shouldSwitchMode = handleModeSwitch(nextMode)
                shouldSwitchMode && callback(nextMode)
              }}
            />
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
          {/* Edit mode */}
          {enableEdit ? (
            selectedView === SelectedView.YAML ? (
              <>
                {isFetchingSchema || (!isGitSyncEnabled && updating) ? (
                  <PageSpinner
                    message={
                      updating ? getString('connectors.updating', { name: connector?.name }) : getString('loading')
                    }
                  />
                ) : null}
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
                        if (isGitSyncEnabled && !isSMConnector(connector.type)) {
                          openSaveToGitDialog({
                            isEditing: true,
                            resource: {
                              type: 'Connectors',
                              name: props.response.connector?.name || '',
                              identifier: props.response.connector?.identifier || '',
                              gitDetails: props.response.gitDetails
                            },
                            payload: parse(yamlHandler?.getLatestYaml?.() || '')
                          })
                        } else {
                          handleSaveYaml()
                            .then(res => {
                              if (res.status === 'SUCCESS') {
                                showSuccess(getString('connectors.updatedSuccessfully'))
                                res.nextCallback?.()
                              } else {
                                /* TODO handle error with API status 200 */
                              }
                            })
                            .catch(e => {
                              if (shouldShowError(e)) {
                                showError(e.data?.message || e.message)
                              }
                            })
                        }
                      }}
                      margin={{ top: 'large' }}
                      title={isValidYAML ? '' : getString('invalidYaml')}
                      disabled={!isGitSyncEnabled && !hasConnectorChanged}
                    />
                    <Button text={getString('cancel')} margin={{ top: 'large' }} onClick={resetEditor} />
                  </Layout.Horizontal>
                </div>
              </>
            ) : null
          ) : /* View-only mode */
          selectedView === SelectedView.VISUAL ? (
            <Layout.Horizontal spacing="medium" height="100%" width="100%">
              <SavedConnectorDetails connector={connector}></SavedConnectorDetails>
            </Layout.Horizontal>
          ) : (
            <Layout.Horizontal spacing="medium" className={css.fullWidth}>
              <div className={css.yamlView} data-test="yamlBuilderContainer">
                <YamlBuilder
                  {...yamlBuilderReadOnlyModeProps}
                  showSnippetSection={false}
                  onEnableEditMode={() => state.setEnableEdit(true)}
                  isEditModeSupported={canEditConnector}
                />
              </div>
            </Layout.Horizontal>
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
      {selectedView === SelectedView.VISUAL ? (
        <ConnectorActivityDetails connector={props.response}></ConnectorActivityDetails>
      ) : null}
    </Layout.Horizontal>
  )
}

export default ConnectorView
