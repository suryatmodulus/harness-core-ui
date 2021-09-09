import React, { useState } from 'react'
import { useParams } from 'react-router'
import * as Yup from 'yup'

import {
  Layout,
  Formik,
  FormInput,
  Heading,
  Button,
  FormikForm as Form,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@wings-software/uicore'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  Connector,
  CreateConnectorQueryParams
} from 'services/cd-ng'
import { getErrorInfoFromErrorObject, shouldShowError } from '@common/utils/errorUtils'
import { String, useStrings } from 'framework/strings'
import { PageSpinner, useToaster } from '@common/components'
import css from './ProviderDetailsStep.module.scss'

interface BuildPayloadProps {
  projectIdentifier: string
  orgIdentifier: string
  delegateSelectors: Array<string>
}

interface ConnectorCreateEditProps {
  payload?: Connector
}

const ProviderOverviewStep = (props: any) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { prevStepData, nextStep, buildPayload, customHandleCreate, customHandleUpdate, connectorInfo } = props

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<any>()
  const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const [connectorPayloadRef, setConnectorPayloadRef] = useState<Connector | undefined>()

  const handleCreateOrEdit = async (connectorData: ConnectorCreateEditProps): Promise<any> => {
    const payload = connectorData.payload || (connectorPayloadRef as Connector)
    modalErrorHandler?.hide()
    const queryParams: CreateConnectorQueryParams = {}

    const response = props.isEditMode
      ? await updateConnector(payload, {
          queryParams: {
            ...queryParams
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

  const afterSuccessHandler = (response: any): void => {
    nextStep?.({ ...props.connectorInfo, ...response?.data?.connector, ...prevStepData })
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      {creating || updating ? (
        <PageSpinner
          message={
            creating
              ? getString('connectors.creating', { name: connectorName })
              : getString('connectors.updating', { name: connectorName })
          }
        />
      ) : null}

      <Formik
        initialValues={{
          adapterUrl: props?.provider?.spec?.adapterUrl || ''
        }}
        validationSchema={Yup.object().shape({
          adapterUrl: Yup.string()
            .trim()
            .url('Please enter a valid Adapter URL')
            .required('Please enter a valid Adapter URL')
        })}
        formName="connectionDetails"
        onSubmit={(stepData: any) => {
          const updatedStepData = {
            ...stepData
          }

          const connectorData: BuildPayloadProps = {
            ...prevStepData,
            ...updatedStepData,
            projectIdentifier: projectIdentifier,
            orgIdentifier: orgIdentifier
          }

          const data = buildPayload(connectorData)
          setConnectorPayloadRef(data)

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
        }}
      >
        {() => (
          <Form className={css.fullHeight}>
            <ModalErrorHandler bind={setModalErrorHandler} />
            <Layout.Vertical spacing="large" className={css.containerLayout}>
              <Heading level={2} style={{ fontSize: '18px', color: 'black' }}>
                {'Provider Details'}
              </Heading>

              <Layout.Vertical spacing="large" className={css.stepFormContainer}>
                <FormInput.Text name="adapterUrl" label={'Adapter URL'} style={{ width: '60%' }} />

                <Layout.Horizontal className={css.layoutFooter} padding={{ top: 'small' }} spacing="medium">
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="commonGitBackButton"
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    intent="primary"
                    rightIcon="chevron-right"
                    disabled={isSaveButtonDisabled}
                  >
                    <String stringID="continue" />
                  </Button>
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default ProviderOverviewStep
