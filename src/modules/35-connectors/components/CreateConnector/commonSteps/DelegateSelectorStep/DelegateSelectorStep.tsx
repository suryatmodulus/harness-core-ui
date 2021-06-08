import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import {
  Layout,
  Button,
  Formik,
  Text,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  FormikForm as Form,
  StepProps,
  Color,
  useModalHook
} from '@wings-software/uicore'
import { Classes, Dialog } from '@blueprintjs/core'
// import * as Yup from 'yup'
import { noop, omit } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO,
  ResponseConnectorResponse,
  Connector,
  EntityGitDetails,
  ResponseMessage,
  useCreatePR,
  CreateConnectorQueryParams
} from 'services/cd-ng'

import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { useGitDiffEditorDialog } from '@common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { Entities } from '@common/interfaces/GitSyncInterface'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { ProgressOverlay, StepStatus } from '@common/modals/ProgressOverlay/ProgressOverlay'
import {
  DelegateOptions,
  DelegateSelector
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector'
import css from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector.module.scss'

interface BuildPayloadProps {
  projectIdentifier: string
  orgIdentifier: string
  delegateSelectors: Array<string>
}

interface ConnectorCreateEditProps {
  gitData?: SaveToGitFormInterface
  payload?: Connector
}

export interface DelegateSelectorProps {
  buildPayload: (data: BuildPayloadProps) => ConnectorRequestBody
  hideModal?: () => void
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode?: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  gitDetails?: EntityGitDetails
  customHandleCreate?: (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepData: StepProps<ConnectorConfigDTO> & DelegateSelectorProps
  ) => Promise<ConnectorInfoDTO | undefined>
  customHandleUpdate?: (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepData: StepProps<ConnectorConfigDTO> & DelegateSelectorProps
  ) => Promise<ConnectorInfoDTO | undefined>
}

type InitialFormData = { delegateSelectors: Array<string> }

const defaultInitialFormData: InitialFormData = {
  delegateSelectors: []
}

const NoMatchingDelegateWarning: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Text
      icon="warning-sign"
      iconProps={{ margin: { right: 'xsmall' }, color: Color.YELLOW_900 }}
      font={{ size: 'small', weight: 'semi-bold' }}
      data-name="delegateNoMatchWarning"
    >
      {getString('connectors.delegate.noMatchingDelegate')}
    </Text>
  )
}

const DelegateSelectorStep: React.FC<StepProps<ConnectorConfigDTO> & DelegateSelectorProps> = props => {
  const { prevStepData, nextStep, buildPayload, customHandleCreate, customHandleUpdate, connectorInfo } = props
  const { accountId, projectIdentifier: projectIdentifierFromUrl, orgIdentifier: orgIdentifierFromUrl } = useParams<
    any
  >()
  let gitDetails = props.gitDetails
  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const [initialValues, setInitialValues] = useState<InitialFormData>(defaultInitialFormData)
  const [delegateSelectors, setDelegateSelectors] = useState<Array<string>>([])
  const [mode, setMode] = useState<DelegateOptions>(
    DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType
      ? DelegateOptions.DelegateOptionsSelective
      : DelegateOptions.DelegateOptionsAny
  )
  const [delegatesFound, setDelegatesFound] = useState<boolean>(true)
  let stepDataRef: ConnectorConfigDTO | null = null
  const [connectorPayloadRef, setConnectorPayloadRef] = useState<Connector | undefined>()

  // git sync related state vars
  const { mutate: createPullRequest, loading: creatingPR } = useCreatePR({})
  const [connectorCreateUpdateStatus, setConnectorCreateUpdateStatus] = useState<StepStatus>()
  const [prCreateStatus, setPRCreateStatus] = useState<StepStatus>()
  const [prMetaData, setPRMetaData] = useState<
    Pick<SaveToGitFormInterface, 'branch' | 'targetBranch' | 'isNewBranch'>
  >()
  const [connectorCreateUpdateError, setConnectorCreateUpdateError] = useState<Record<string, any>>()
  const [connectorCreateUpdateResponse, setConnectorCreateUpdateResponse] = useState<ResponseConnectorResponse>({})
  //TODO Enable it when this experience gets finalized
  // const syncToGitViaManager = true

  const connectorName = (connectorInfo as ConnectorInfoDTO)?.name
  const fromBranch = prMetaData?.branch || ''
  const toBranch = prMetaData?.targetBranch || ''
  const connectorCreateUpdateStage = {
    status: connectorCreateUpdateStatus,
    intermediateLabel: props.isEditMode
      ? getString('connectors.updating', { name: connectorName })
      : getString('connectors.creating', { name: connectorName }),
    finalLabel:
      `${connectorCreateUpdateError?.data?.errors?.[0].fieldId} ${connectorCreateUpdateError?.data?.errors?.[0].error}` ||
      connectorCreateUpdateError?.data?.message ||
      connectorCreateUpdateError?.message
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
            if (connectorCreateUpdateStatus === 'SUCCESS') {
              afterSuccessHandler(connectorCreateUpdateResponse)
            }
          }}
        />
      </Dialog>
    )
  }, [
    creatingPR,
    connectorCreateUpdateStatus,
    connectorCreateUpdateError,
    prCreateStatus,
    prMetaData,
    connectorCreateUpdateResponse
  ])

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
            if (connectorCreateUpdateStatus === 'SUCCESS') {
              afterSuccessHandler(connectorCreateUpdateResponse)
            }
          }}
        />
      </Dialog>
    )
  }, [connectorCreateUpdateStatus, connectorCreateUpdateError, connectorCreateUpdateResponse])

  const afterSuccessHandler = (response: ResponseConnectorResponse): void => {
    props.onConnectorCreated?.(response?.data)
    if (prevStepData?.branch) {
      // updating connector branch to handle if new branch was created while commit
      prevStepData.branch = response?.data?.gitDetails?.branch
    }

    if (stepDataRef?.skipDefaultValidation) {
      props.hideModal?.()
    } else {
      nextStep?.({ ...prevStepData, ...stepDataRef } as ConnectorConfigDTO)
      props.setIsEditMode?.(true)
    }
  }

  // modal to show for git commit
  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (gitData: SaveToGitFormInterface): void => {
      handleCreateOrEdit({ gitData, payload: connectorPayloadRef as Connector })
    },
    onClose: noop
  })

  // modal to show when a git conflict occurs
  const { openGitDiffDialog } = useGitDiffEditorDialog<Connector>({
    onSuccess: (payload: Connector, objectId: EntityGitDetails['objectId'], gitData?: SaveToGitFormInterface): void => {
      try {
        handleCreateOrEdit({ payload, gitData }, objectId)
      } catch (e) {
        //ignore error
      }
    },
    onClose: noop
  })

  const handleCreateOrEdit = async (
    connectorData: ConnectorCreateEditProps,
    objectId?: EntityGitDetails['objectId']
  ): Promise<void> => {
    setConnectorCreateUpdateStatus('IN_PROGRESS')
    const { gitData } = connectorData
    if (isGitSyncEnabled && gitData?.createPr) {
      setPRMetaData({ branch: gitData?.branch, targetBranch: gitData?.targetBranch, isNewBranch: gitData?.isNewBranch })
      setPRCreateStatus('IN_PROGRESS')
      showCreateUpdateConnectorWithPRCreationModal()
    } else {
      showCreateUpdateConnectorModal()
    }
    const payload = connectorData.payload || (connectorPayloadRef as Connector)
    try {
      modalErrorHandler?.hide()
      // Create or Update connector
      let queryParams: CreateConnectorQueryParams = {}
      if (gitData) {
        queryParams = {
          accountIdentifier: accountId,
          ...omit(gitData, 'sourceBranch')
        }
        if (gitData.isNewBranch) {
          queryParams.baseBranch = prevStepData?.branch
        }
      }

      const response = props.isEditMode
        ? await updateConnector(payload, {
            queryParams: {
              ...queryParams,
              lastObjectId: objectId ?? gitDetails?.objectId
            }
          })
        : await createConnector(payload, { queryParams: queryParams })
      setConnectorCreateUpdateStatus(response.status)
      setConnectorCreateUpdateResponse(response)

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
      }
      // if connector creation/update fails, abort PR creation
      else {
        setPRCreateStatus('ABORTED')
      }
    } catch (e) {
      setConnectorCreateUpdateError(e)
      setConnectorCreateUpdateStatus('ERROR')
      setPRCreateStatus('ABORTED')
      if (
        isGitSyncEnabled &&
        ((e.data?.responseMessages as ResponseMessage[]) || [])?.findIndex(
          (mssg: ResponseMessage) => mssg.code === 'SCM_CONFLICT_ERROR'
        ) !== -1
      ) {
        openGitDiffDialog(payload, connectorData?.gitData)
      } else {
        const errorMessage = `${e.data?.errors?.[0].fieldId} ${e.data?.errors?.[0].error}`
        const message = e.data?.errors?.[0].fieldId ? errorMessage : e.message
        modalErrorHandler?.showDanger(message)
      }
    }
  }

  useEffect(() => {
    let delegate = (props.connectorInfo as ConnectorInfoDTO & InitialFormData)?.spec?.delegateSelectors || []
    if (prevStepData?.delegateSelectors) {
      delegate = prevStepData.delegateSelectors
    }
    if (props.isEditMode) {
      setInitialValues({ delegateSelectors: delegate })
      setDelegateSelectors(delegate)
    }
  }, [])

  const isSaveButtonDisabled =
    (DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType && delegateSelectors.length === 0) ||
    (mode === DelegateOptions.DelegateOptionsSelective && delegateSelectors.length === 0) ||
    creating ||
    updating
  return (
    <Layout.Vertical height={'inherit'} padding={{ left: 'small' }}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('delegate.DelegateselectionLabel')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="delegateSelectorStepForm"
        //   Enable when delegateSelector adds form validation
        // validationSchema={Yup.object().shape({
        //   delegateSelector: Yup.string().when('delegateType', {
        //     is: DelegateTypes.DELEGATE_IN_CLUSTER,
        //     then: Yup.string().trim().required(i18n.STEP.TWO.validation.delegateSelector)
        //   })
        // })}
        onSubmit={stepData => {
          const updatedStepData = {
            ...stepData,
            delegateSelectors: mode === DelegateOptions.DelegateOptionsAny ? [] : delegateSelectors
          }

          const connectorData: BuildPayloadProps = {
            ...prevStepData,
            ...updatedStepData,
            projectIdentifier: projectIdentifier,
            orgIdentifier: orgIdentifier
          }

          const data = buildPayload(connectorData)
          setConnectorPayloadRef(data)
          stepDataRef = updatedStepData
          if (isGitSyncEnabled) {
            // Using git context set at 1st step while creating new connector
            if (!props.isEditMode) {
              gitDetails = { branch: prevStepData?.branch, repoIdentifier: prevStepData?.repo }
            }
            openSaveToGitDialog(props.isEditMode, {
              type: Entities.CONNECTORS,
              name: data.connector?.name || '',
              identifier: data.connector?.identifier || '',
              gitDetails
            })
          } else {
            if (customHandleUpdate || customHandleCreate) {
              props.isEditMode
                ? customHandleUpdate?.(data, { ...prevStepData, ...updatedStepData }, props)
                : customHandleCreate?.(data, { ...prevStepData, ...updatedStepData }, props)
            } else {
              handleCreateOrEdit({ payload: data })
            }
          }
        }}
      >
        <Form>
          <DelegateSelector
            mode={mode}
            setMode={setMode}
            delegateSelectors={delegateSelectors}
            setDelegateSelectors={setDelegateSelectors}
            setDelegatesFound={setDelegatesFound}
            delegateSelectorMandatory={DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType}
          />
          <Layout.Horizontal padding={{ top: 'small' }} margin={{ top: 'xxxlarge' }} spacing="medium">
            <Button
              text={getString('back')}
              icon="chevron-left"
              onClick={() => props?.previousStep?.(props?.prevStepData)}
              data-name="awsBackButton"
            />
            <Button
              type="submit"
              intent={'primary'}
              text={getString('saveAndContinue')}
              className={css.saveAndContinue}
              disabled={isSaveButtonDisabled}
              rightIcon="chevron-right"
              data-name="delegateSaveAndContinue"
            />
            {!delegatesFound ? <NoMatchingDelegateWarning /> : <></>}
          </Layout.Horizontal>
        </Form>
      </Formik>
    </Layout.Vertical>
  )
}

export default DelegateSelectorStep
