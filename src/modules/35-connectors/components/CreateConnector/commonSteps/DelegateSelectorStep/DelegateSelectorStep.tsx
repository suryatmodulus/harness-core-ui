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
import { useStrings } from 'framework/exports'
import { DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { DelegateSelectors } from '@common/components'
import { useToaster } from '@common/exports'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO
} from 'services/cd-ng'

import css from './DelegateSelectorStep.module.scss'

interface BuildPayloadProps {
  projectIdentifier: string
  orgIdentifier: string
  delegateSelectors: Array<string>
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
  const { prevStepData, nextStep, buildPayload, customHandleCreate, customHandleUpdate } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<any>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })
  const [loadConnector, setLoadConnector] = useState(false)
  const [initialValues, setInitialValues] = useState<InitialFormData>(defaultInitialFormData)
  const [delegateSelectors, setDelegateSelectors] = useState<Array<string>>([])

  const handleCreate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      const response = await createConnector(data)
      setLoadConnector(false)
      props.onConnectorCreated?.(response.data)
      showSuccess(`Connector '${prevStepData?.name}' created successfully`)
      if (!delegateSelectors.length && stepData.skipDefaultValidation) {
        props.hideModal?.()
      } else {
        nextStep?.({ ...prevStepData, ...stepData } as ConnectorConfigDTO)
        props.setIsEditMode?.(true)
      }
    } catch (e) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const handleUpdate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      const response = await updateConnector(data)
      setLoadConnector(false)
      props.onConnectorCreated?.(response.data)
      showSuccess(`Connector '${prevStepData?.name}' updated successfully`)
      if (!delegateSelectors.length && stepData.skipDefaultValidation) {
        props.hideModal?.()
      } else {
        nextStep?.({ ...prevStepData, ...stepData } as ConnectorConfigDTO)
      }
    } catch (error) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(error.data?.message || error.message)
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

          if (props.isEditMode) {
            customHandleUpdate
              ? customHandleUpdate(data, { ...prevStepData, ...stepData }, props)
              : handleUpdate(data, stepData)
          } else {
            customHandleCreate
              ? customHandleCreate(data, { ...prevStepData, ...stepData }, props)
              : handleCreate(data, stepData)
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
                loadConnector
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
