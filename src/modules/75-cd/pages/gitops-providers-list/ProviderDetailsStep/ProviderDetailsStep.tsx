import React, { useState } from 'react'
import { useParams } from 'react-router'
import * as Yup from 'yup'

import {
  Layout,
  Formik,
  FormInput,
  Container,
  Button,
  Text,
  Icon,
  FormikForm as Form,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation
} from '@wings-software/uicore'
import {
  ConnectedArgoGitOpsInfoDTO,
  CreateGitOpsProviderQueryParams,
  GitOpsProvider,
  useCreateGitOpsProvider,
  useUpdateGitOpsProvider
} from 'services/cd-ng'
import { getErrorInfoFromErrorObject, shouldShowError } from '@common/utils/errorUtils'
import { String, useStrings } from 'framework/strings'
import { PageSpinner, useToaster } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GitOpsProviderTypeEnum } from '@cd/utils/GitOpsUtils'
import aboutHarnessAdapterIllustration from '../images/aboutHarnessAdapterIllustration.svg'
import type { BaseProviderStepProps } from '../types'
import css from './ProviderDetailsStep.module.scss'

const aboutHarnessAdapterURL = `https://ngdocs.harness.io/article/ptlvh7c6z2-harness-argo-cd-git-ops-quickstart`

export type ProviderOverviewStepProps = BaseProviderStepProps

export default function ProviderOverviewStep(props: ProviderOverviewStepProps): React.ReactElement {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()

  const { prevStepData, nextStep, provider } = props

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<ProjectPathProps>()
  const projectIdentifier = provider ? provider.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = provider ? provider.orgIdentifier : orgIdentifierFromUrl
  const { mutate: createConnector, loading: creating } = useCreateGitOpsProvider({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateGitOpsProvider({
    queryParams: { accountIdentifier: accountId }
  })
  // const [connectorPayloadRef, setConnectorPayloadRef] = useState<Connector | undefined>()

  const handleCreateOrEdit = async (payload: GitOpsProvider): Promise<any> => {
    modalErrorHandler?.hide()
    const queryParams: CreateGitOpsProviderQueryParams = {}

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
  const connectorName = creating ? prevStepData?.name : props?.provider?.name

  const afterSuccessHandler = (response: any): void => {
    props.onUpdateMode?.(true)
    nextStep?.({ ...props.provider, ...prevStepData, ...response?.data })
  }

  return (
    <>
      {creating || updating ? (
        <PageSpinner
          message={
            creating
              ? getString('cd.creating', { name: connectorName })
              : getString('cd.updating', { name: connectorName })
          }
        />
      ) : null}
      <Layout.Vertical spacing="xxlarge" className={css.stepContainer}>
        <div className={css.heading}>Provider Details</div>
        <ModalErrorHandler bind={setModalErrorHandler} />

        <Container className={css.connectorForm}>
          <Formik<ConnectedArgoGitOpsInfoDTO>
            initialValues={{
              adapterUrl:
                (props?.prevStepData?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl ||
                (props?.provider?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl ||
                '',
              type: GitOpsProviderTypeEnum.ConnectedArgoProvider
            }}
            validationSchema={Yup.object().shape({
              adapterUrl: Yup.string()
                .trim()
                .url('Please enter a valid Adapter URL')
                .required('Please enter a valid Adapter URL')
            })}
            formName="connectionDetails"
            onSubmit={stepData => {
              const data: GitOpsProvider = {
                ...(prevStepData as GitOpsProvider),
                spec: {
                  ...stepData
                },
                projectIdentifier: projectIdentifier,
                orgIdentifier: orgIdentifier
              }
              // setConnectorPayloadRef(data)

              handleCreateOrEdit(data) /* Handling non-git flow */
                .then(res => {
                  if (res.status === 'SUCCESS') {
                    props.isEditMode
                      ? showSuccess(getString('cd.updatedSuccessfully'))
                      : showSuccess(getString('cd.createdSuccessfully'))

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
            }}
          >
            {() => (
              <Form>
                <Container style={{ minHeight: 460 }}>
                  <FormInput.Text
                    className={css.adapterUrl}
                    name="adapterUrl"
                    label={'Adapter URL'}
                    style={{ width: '60%' }}
                  />

                  <div>
                    <Text className={css.aboutHarnessAdapterQuestion} margin={{ top: 'medium', bottom: 'small' }}>
                      {getString('cd.whatIsHarnessAdapter')}
                    </Text>
                    <Text className={css.aboutHarnessAdapterAnswer} margin={{ top: 'small', bottom: 'small' }}>
                      {getString('cd.aboutHarnessAdapter')}
                    </Text>

                    <img src={aboutHarnessAdapterIllustration} className={css.aboutHarnessAdapterIllustration} />

                    <div className={css.aboutHarnessAdapterUrl}>
                      <Icon intent="primary" style={{ marginRight: '8px' }} size={16} name="info" />

                      <a href={aboutHarnessAdapterURL} rel="noreferrer" target="_blank">
                        {getString('cd.learnMoreAboutHarnessAdapter')}
                      </a>
                    </div>
                  </div>
                </Container>
                <Layout.Horizontal spacing="large">
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
                    <String stringID="saveAndContinue" />
                  </Button>
                </Layout.Horizontal>
              </Form>
            )}
          </Formik>
        </Container>
      </Layout.Vertical>
    </>
  )
}
