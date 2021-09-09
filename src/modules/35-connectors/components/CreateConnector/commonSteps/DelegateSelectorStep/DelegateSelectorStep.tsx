import React, { useState } from 'react'
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
  Color
} from '@wings-software/uicore'
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
  CreateConnectorQueryParams
} from 'services/cd-ng'

import { useSaveToGitDialog, UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { Entities } from '@common/interfaces/GitSyncInterface'
import { PageSpinner, useToaster } from '@common/components'
import { getErrorInfoFromErrorObject, shouldShowError } from '@common/utils/errorUtils'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import {
  DelegateOptions,
  DelegateSelector,
  DelegatesFoundState
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector'
import { CredTypeValues, HashiCorpVaultAccessTypes } from '@connectors/interfaces/ConnectorInterface'
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
  disableGitSync?: boolean
  submitOnNextStep?: boolean
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

const NoMatchingDelegateWarning: React.FC<{ delegatesFound: DelegatesFoundState }> = props => {
  const { getString } = useStrings()
  const { delegatesFound } = props
  if (delegatesFound === DelegatesFoundState.ActivelyConnected) {
    return <></>
  }
  const message =
    delegatesFound === DelegatesFoundState.NotConnected
      ? getString('connectors.delegate.noMatchingDelegatesActive')
      : getString('connectors.delegate.noMatchingDelegate')
  const dataName =
    delegatesFound === DelegatesFoundState.NotConnected ? 'delegateNoActiveMatchWarning' : 'delegateNoMatchWarning'
  return (
    <Text
      icon="warning-sign"
      iconProps={{ margin: { right: 'xsmall' }, color: Color.YELLOW_900 }}
      font={{ size: 'small', weight: 'semi-bold' }}
      data-name={dataName}
    >
      {message}
    </Text>
  )
}

const DelegateSelectorStep: React.FC<StepProps<ConnectorConfigDTO> & DelegateSelectorProps> = props => {
  const { showSuccess, showError } = useToaster()
  const { prevStepData, nextStep, buildPayload, customHandleCreate, customHandleUpdate, connectorInfo } = props
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<any>()
  let gitDetails = props.gitDetails
  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const { getString } = useStrings()
  const isGitSyncEnabled = useAppStore().isGitSyncEnabled && !props.disableGitSync && orgIdentifier && projectIdentifier
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const isDelegateSelectorMandatory = (): boolean => {
    return (
      DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType ||
      DelegateTypes.DELEGATE_IN_CLUSTER_IRSA === prevStepData?.delegateType ||
      CredTypeValues.AssumeIAMRole === prevStepData?.credType ||
      CredTypeValues.AssumeRoleSTS === prevStepData?.credType ||
      HashiCorpVaultAccessTypes.VAULT_AGENT === prevStepData?.accessType
    )
  }
  const initialDelegateSelectors = (() => {
    if (!props.isEditMode) {
      return []
    }
    let delegate = (props.connectorInfo as ConnectorInfoDTO & InitialFormData)?.spec?.delegateSelectors || []
    if (prevStepData?.delegateSelectors) {
      delegate = prevStepData.delegateSelectors
    }
    return delegate
  })()
  const initialValues = { delegateSelectors: initialDelegateSelectors }
  const [delegateSelectors, setDelegateSelectors] = useState<Array<string>>(initialDelegateSelectors)
  const [mode, setMode] = useState<DelegateOptions>(
    delegateSelectors.length || isDelegateSelectorMandatory()
      ? DelegateOptions.DelegateOptionsSelective
      : DelegateOptions.DelegateOptionsAny
  )
  const [delegatesFound, setDelegatesFound] = useState<DelegatesFoundState>(DelegatesFoundState.ActivelyConnected)
  let stepDataRef: ConnectorConfigDTO | null = null
  const [connectorPayloadRef, setConnectorPayloadRef] = useState<Connector | undefined>()

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
  const { openSaveToGitDialog } = useSaveToGitDialog<Connector>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: Connector,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      handleCreateOrEdit({ gitData, payload: payload || (connectorPayloadRef as Connector) }, objectId),
    onClose: noop
  })

  const handleCreateOrEdit = async (
    connectorData: ConnectorCreateEditProps,
    objectId?: EntityGitDetails['objectId']
  ): Promise<UseSaveSuccessResponse> => {
    const { gitData } = connectorData
    const payload = connectorData.payload || (connectorPayloadRef as Connector)
    modalErrorHandler?.hide()
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

    return {
      status: response.status,
      nextCallback: afterSuccessHandler.bind(null, response)
    }
  }

  const isSaveButtonDisabled =
    (isDelegateSelectorMandatory() && delegateSelectors.length === 0) ||
    (mode === DelegateOptions.DelegateOptionsSelective && delegateSelectors.length === 0) ||
    creating ||
    updating
  const connectorName = creating
    ? (prevStepData as ConnectorConfigDTO)?.name
    : (connectorInfo as ConnectorInfoDTO)?.name
  return (
    <>
      {!isGitSyncEnabled && (creating || updating) ? (
        <PageSpinner
          message={
            creating
              ? getString('connectors.creating', { name: connectorName })
              : getString('connectors.updating', { name: connectorName })
          }
        />
      ) : null}
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

            if (props.submitOnNextStep) {
              nextStep?.({ ...prevStepData, ...updatedStepData, projectIdentifier, orgIdentifier })
              return
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
              openSaveToGitDialog({
                isEditing: props.isEditMode,
                resource: {
                  type: Entities.CONNECTORS,
                  name: data.connector?.name || '',
                  identifier: data.connector?.identifier || '',
                  gitDetails
                },
                payload: data
              })
            } else {
              if (customHandleUpdate || customHandleCreate) {
                props.isEditMode
                  ? customHandleUpdate?.(data, { ...prevStepData, ...updatedStepData }, props)
                  : customHandleCreate?.(data, { ...prevStepData, ...updatedStepData }, props)
              } else {
                handleCreateOrEdit({ payload: data }) /* Handling non-git flow */
                  .then(res => {
                    if (res.status === 'SUCCESS') {
                      props.isEditMode
                        ? showSuccess(getString('connectors.updatedSuccessfully'))
                        : showSuccess(getString('connectors.createdSuccessfully'))

                      res.nextCallback?.()
                    } else {
                      /* TODO handle error with API status 200 */
                    }
                  })
                  .catch(e => {
                    if (shouldShowError(e)) {
                      showError(getErrorInfoFromErrorObject(e))
                    }
                  })
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
              delegateSelectorMandatory={isDelegateSelectorMandatory()}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
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
                text={getString(props.submitOnNextStep ? 'continue' : 'saveAndContinue')}
                className={css.saveAndContinue}
                disabled={isSaveButtonDisabled}
                rightIcon="chevron-right"
                data-testid="delegateSaveAndContinue"
              />
              <NoMatchingDelegateWarning delegatesFound={delegatesFound} />
            </Layout.Horizontal>
          </Form>
        </Formik>
      </Layout.Vertical>
    </>
  )
}

export default DelegateSelectorStep
