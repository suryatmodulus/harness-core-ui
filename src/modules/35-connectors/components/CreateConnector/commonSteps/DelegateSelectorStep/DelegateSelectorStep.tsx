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
import { DelegateSelectors } from '@common/components'
import { useToaster } from '@common/exports'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO,
  ResponseConnectorResponse,
  Connector
} from 'services/cd-ng'

import useSaveToGitDialog from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { Entities } from '@common/interfaces/GitSyncInterface'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import css from './DelegateSelectorStep.module.scss'

interface BuildPayloadProps {
  projectIdentifier: string
  orgIdentifier: string
  delegateSelectors: Array<string>
}

interface ConnectorCreateEditProps {
  gitData?: SaveToGitFormInterface
  payload?: Connector
}

interface DelegateSelectorProps {
  buildPayload: (data: BuildPayloadProps) => ConnectorRequestBody
  hideModal?: () => void
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode?: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
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

  const afterSuccessHandler = (response: ResponseConnectorResponse): void => {
    props.onConnectorCreated?.(response?.data)
    showSuccess(
      getString(props.isEditMode ? 'connectors.successfullUpdate' : 'connectors.successfullCreate', {
        name: prevStepData?.name
      })
    )

    if (!delegateSelectors.length && stepDataRef?.skipDefaultValidation) {
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

  const handleCreateOrEdit = async (connectorData: ConnectorCreateEditProps): Promise<void> => {
    const { gitData } = connectorData
    const payload = connectorData.payload || (connectorPayloadRef as Connector)

    try {
      modalErrorHandler?.hide()
      const queryParams = gitData ? { accountIdentifier: accountId, ...gitData } : {}

      const response = props.isEditMode
        ? await updateConnector(payload, {
            queryParams: gitData ? { ...queryParams, lastObjectId: payload.connector?.identifier } : queryParams
          })
        : await createConnector(payload, { queryParams: queryParams })
      afterSuccessHandler(response)
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
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
            openSaveToGitDialog(props.isEditMode, {
              type: Entities.CONNECTORS,
              name: data.connector?.name || '',
              identifier: data.connector?.identifier || ''
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

          <Layout.Vertical padding={{ top: 'xxlarge', bottom: 'large' }} className={css.formData}>
            <>
              <Text margin={{ bottom: 'medium' }}>{getString('delegate.DelegateselectionConnectorText')}</Text>
              <DelegateSelectors
                className={css.formInput}
                fill
                allowNewTag={false}
                placeholder={getString('delegate.DelegateselectionPlaceholder')}
                selectedItems={delegateSelectors}
                onChange={data => {
                  setDelegateSelectors(data as Array<string>)
                }}
              ></DelegateSelectors>
            </>
          </Layout.Vertical>
          <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
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
                (DelegateTypes.DELEGATE_IN_CLUSTER === prevStepData?.delegateType && delegateSelectors.length === 0) ||
                creating ||
                updating
              }
              rightIcon="chevron-right"
            />
          </Layout.Horizontal>
        </Form>
      </Formik>
    </Layout.Vertical>
  )
}

export default DelegateSelectorStep
