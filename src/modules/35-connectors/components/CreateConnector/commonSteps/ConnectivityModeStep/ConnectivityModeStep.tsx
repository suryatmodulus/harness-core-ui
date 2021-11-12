import React, { useState } from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  FontVariation,
  Formik,
  FormikForm,
  getErrorInfoFromErrorObject,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  shouldShowError,
  StepProps,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { noop, omit } from 'lodash-es'
import {
  Connector,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ConnectorRequestBody,
  CreateConnectorQueryParams,
  EntityGitDetails,
  ResponseConnectorResponse,
  useCreateConnector,
  useUpdateConnector
} from 'services/cd-ng'
import { PageSpinner, useToaster } from '@common/components'
import ConnectivityMode, { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ConnectorCreateEditProps } from '@connectors/constants'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { Entities } from '@common/interfaces/GitSyncInterface'

interface BuildPayloadProps {
  projectIdentifier: string
  orgIdentifier: string
  connectivityMode: ConnectivityModeType
}

interface ConnectivityModeStepProps {
  type: ConnectorConfigDTO['type']
  isEditMode: boolean
  setIsEditMode?: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  buildPayload: (data: BuildPayloadProps) => ConnectorRequestBody
  gitDetails?: EntityGitDetails
  disableGitSync?: boolean
  submitOnNextStep?: boolean
  connectivityMode?: ConnectivityModeType
  setConnectivityMode?: (val: ConnectivityModeType) => void
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  hideModal?: () => void
  customHandleCreate?: (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepData: StepProps<ConnectorConfigDTO> & ConnectivityModeStepProps
  ) => Promise<ConnectorInfoDTO | undefined>
  customHandleUpdate?: (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepData: StepProps<ConnectorConfigDTO> & ConnectivityModeStepProps
  ) => Promise<ConnectorInfoDTO | undefined>
}

const ConnectivityModeStep: React.FC<StepProps<ConnectorConfigDTO> & ConnectivityModeStepProps> = props => {
  const { showSuccess, showError } = useToaster()
  const { prevStepData, nextStep, connectorInfo, buildPayload, customHandleUpdate, customHandleCreate } = props
  const { getString } = useStrings()
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<any>()
  let gitDetails = props.gitDetails

  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const isGitSyncEnabled = useAppStore().isGitSyncEnabled && !props.disableGitSync && orgIdentifier && projectIdentifier
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [connectorPayloadRef, setConnectorPayloadRef] = useState<Connector | undefined>()
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  let stepDataRef: ConnectorConfigDTO | null = null
  const defaultInitialValues = { connectivityMode: ConnectivityModeType.Manager }

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

  const isSaveButtonDisabled = creating || updating

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
      <Layout.Vertical>
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Formik
          initialValues={{
            ...defaultInitialValues,
            ...prevStepData
          }}
          onSubmit={stepData => {
            if (props.submitOnNextStep || stepData.connectivityMode === ConnectivityModeType.Delegate) {
              nextStep?.({ ...prevStepData, ...stepData, projectIdentifier, orgIdentifier })
              return
            }

            const connectorData = {
              ...prevStepData,
              ...stepData,
              projectIdentifier: projectIdentifier,
              orgIdentifier: orgIdentifier
            }
            const data = buildPayload(connectorData)
            setConnectorPayloadRef(data)
            stepDataRef = stepData

            if (isGitSyncEnabled) {
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
                  ? customHandleUpdate?.(data, { ...prevStepData, ...stepData }, props)
                  : customHandleCreate?.(data, { ...prevStepData, ...stepData }, props)
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
          formName={`connectivityModeForm${props.type}`}
          // validationSchema={Yup.object().shape({
          //   name: NameSchema(),
          //   identifier: IdentifierSchema()
          // })}
          enableReinitialize
        >
          {formik => {
            return (
              <FormikForm>
                <Layout.Vertical style={{ minHeight: 460 }} width={'700px'} spacing={'medium'}>
                  <Text
                    font={{ variation: FontVariation.H3 }}
                    color={Color.BLACK}
                    tooltipProps={{ dataTooltipId: 'ConnectivityModeTitle' }}
                  >
                    {'How do you want to connect to the provider?'}
                  </Text>
                  <ConnectivityMode
                    formik={formik}
                    onChange={val => {
                      props.setConnectivityMode?.(val)
                      // console.log(props.connectivityMode)
                    }}
                  />
                </Layout.Vertical>
                <Layout.Horizontal padding={{ top: 'medium' }} margin={{ top: 'xxxlarge' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="awsBackButton"
                    variation={ButtonVariation.SECONDARY}
                  />
                  <Button
                    type="submit"
                    intent={'primary'}
                    text={getString(
                      formik.values.connectivityMode === ConnectivityModeType.Delegate ? 'continue' : 'saveAndContinue'
                    )}
                    disabled={isSaveButtonDisabled}
                    //   className={css.saveAndContinue}
                    rightIcon="chevron-right"
                    data-testid="connectivitySaveAndContinue"
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </>
  )
}

export default ConnectivityModeStep
