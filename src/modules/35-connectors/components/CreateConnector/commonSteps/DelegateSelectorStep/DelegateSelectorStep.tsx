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
  Color
} from '@wings-software/uicore'
// import * as Yup from 'yup'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { PageSpinner } from '@common/components'
import { useToaster } from '@common/exports'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO,
  ResponseConnectorResponse,
  Connector,
  EntityGitDetails,
  ResponseMessage
} from 'services/cd-ng'

import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { useGitDiffEditorDialog } from '@common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { Entities } from '@common/interfaces/GitSyncInterface'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { DelegateSelector } from './DelegateSelector/DelegateSelector'

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

const DelegateSelectorStep: React.FC<StepProps<ConnectorConfigDTO> & DelegateSelectorProps> = props => {
  const { prevStepData, nextStep, buildPayload, customHandleCreate, customHandleUpdate, connectorInfo } = props
  const { accountId, projectIdentifier: projectIdentifierFromUrl, orgIdentifier: orgIdentifierFromUrl } = useParams<
    any
  >()
  let gitDetails = props.gitDetails
  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const { showSuccess } = useToaster()
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
  let stepDataRef: ConnectorConfigDTO | null = null
  const [connectorPayloadRef, setConnectorPayloadRef] = useState<Connector | undefined>()
  //TODO @vardan api to fetch this flag is currently WIP, will replace later with api response
  const isSyncingToGitViaManager = true

  const afterSuccessHandler = (response: ResponseConnectorResponse): void => {
    props.onConnectorCreated?.(response?.data)
    showSuccess(
      getString(props.isEditMode ? 'connectors.successfullUpdate' : 'connectors.successfullCreate', {
        name: prevStepData?.name
      })
    )

    if (stepDataRef?.skipDefaultValidation) {
      props.hideModal?.()
    } else {
      nextStep?.({ ...prevStepData, ...stepDataRef } as ConnectorConfigDTO)
      props.setIsEditMode?.(true)
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (gitData: SaveToGitFormInterface): void => {
      handleCreateOrEdit({ gitData, payload: connectorPayloadRef as Connector })
    },
    onClose: noop
  })

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
    const { gitData } = connectorData
    const payload = connectorData.payload || (connectorPayloadRef as Connector)

    try {
      modalErrorHandler?.hide()
      const queryParams = gitData ? { accountIdentifier: accountId, ...gitData } : {}

      const response = props.isEditMode
        ? await updateConnector(payload, {
            queryParams: gitData ? { ...queryParams, lastObjectId: objectId ?? gitDetails?.objectId } : queryParams
          })
        : await createConnector(payload, { queryParams: queryParams })
      afterSuccessHandler(response)
    } catch (e) {
      if (
        (e.data?.responseMessages as ResponseMessage[])?.findIndex(
          (mssg: ResponseMessage) => mssg.code === 'SCM_CONFLICT_ERROR'
        ) !== -1
      ) {
        openGitDiffDialog(payload, connectorData?.gitData)
      } else {
        modalErrorHandler?.showDanger(e.data?.message || e.message)
      }
    }
  }

  useEffect(() => {
    const delegate = (props.connectorInfo as ConnectorInfoDTO & InitialFormData)?.spec?.delegateSelectors || []
    if (props.isEditMode) {
      setInitialValues({ delegateSelectors: delegate })
      setDelegateSelectors(delegate)
    }
  }, [])
  return (
    <Layout.Vertical height={'inherit'} padding={{ left: 'small' }}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('delegateSelection')}
      </Text>
      {updating ? (
        <PageSpinner
          message={
            isSyncingToGitViaManager
              ? getString('common.submittingRequest')
              : getString('common.submittingRequestToGit')
          }
        />
      ) : (
        <Formik
          initialValues={{
            ...initialValues,
            ...prevStepData
          }}
          //   Enable when delegateSelector adds form validation
          // validationSchema={Yup.object().shape({
          //   delegateSelector: Yup.string().when('delegateType', {
          //     is: DelegateTypes.DELEGATE_IN_CLUSTER,
          //     then: Yup.string().trim().required(i18n.STEP.TWO.validation.delegateSelector)
          //   })
          // })}
          onSubmit={stepData => {
            const connectorData: BuildPayloadProps = {
              ...prevStepData,
              ...stepData,
              delegateSelectors,
              projectIdentifier: projectIdentifier,
              orgIdentifier: orgIdentifier
            }

            const data = buildPayload(connectorData)
            setConnectorPayloadRef(data)
            stepDataRef = stepData
            if (isGitSyncEnabled) {
              // Using git conext set at 1st step while creating new connector
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
                  ? customHandleUpdate?.(data, { ...prevStepData, ...stepData }, props)
                  : customHandleCreate?.(data, { ...prevStepData, ...stepData }, props)
              } else {
                handleCreateOrEdit({ payload: data })
              }
            }
          }}
        >
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />
            <DelegateSelector delegateSelectors={delegateSelectors} setDelegateSelectors={setDelegateSelectors} />
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
                disabled={
                  (DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType &&
                    delegateSelectors.length === 0) ||
                  creating ||
                  updating
                }
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </Form>
        </Formik>
      )}
    </Layout.Vertical>
  )
}

export default DelegateSelectorStep
