import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { pick } from 'lodash-es'

import {
  Layout,
  Button,
  Formik,
  ModalErrorHandlerBinding,
  Toggle,
  ModalErrorHandler,
  FormikForm,
  FormInput,
  CodeBlock,
  Container,
  ButtonVariation,
  getErrorInfoFromErrorObject,
  shouldShowError
} from '@wings-software/uicore'

import {
  GitOpsProvider,
  useCreateGitOpsProvider,
  useUpdateGitOpsProvider,
  CreateGitOpsProviderQueryParams
} from 'services/cd-ng'
import { saveCurrentStepData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { String, useStrings } from 'framework/strings'
import { PageSpinner, useToaster } from '@common/components'

import type { BaseProviderStepProps } from '../../types'

import css from './SetupGitOpsServerStep.module.scss'

type SetupGitOpsServerStepProps = BaseProviderStepProps

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

const dummyYAML = `
- num: -1083669237
  tropical: true
  iron: -928716494.5760937
  instrument:
    - 469156903.1044102
    - topic:
        direct: 456028677.1854496
        yourself: -1746925063.3320909
        community: true
        remember: true
        arm: member
      stream: edge
      practice: true
      deeply:
        lucky: true
        save: false
        well: 271507302.4167981
        came: 468914455.00234985
        belong: true
      damage: 1708272278.8601089
    - false
    - getting
    - 1976659262
  bat: false
`
export default function SetupGitOpsServerStep(props: SetupGitOpsServerStepProps): React.ReactElement {
  const { prevStepData, nextStep, provider } = props
  const { showSuccess, showError } = useToaster()
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<Params>()
  const projectIdentifier = provider ? provider.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = provider ? provider.orgIdentifier : orgIdentifierFromUrl
  const [providerName, setProviderName] = useState(props?.provider?.name)
  const [highAvailability, setHighAvailability] = useState(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [loading, setLoading] = useState(false)
  const isEdit = props.isEditMode
  const { getString } = useStrings()

  const { mutate: createConnector, loading: creating } = useCreateGitOpsProvider({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateGitOpsProvider({
    queryParams: { accountIdentifier: accountId }
  })

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

  const afterSuccessHandler = (response: any): void => {
    props.onUpdateMode?.(true)
    nextStep?.({ ...props.provider, ...response?.data })
  }

  const handleSave = (formData: GitOpsProvider): void => {
    setLoading(true)
    const data: GitOpsProvider = {
      ...formData,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier
    }

    setProviderName(formData.name)

    handleCreateOrEdit(data)
      .then(res => {
        if (res.status === 'SUCCESS') {
          props.isEditMode
            ? showSuccess(getString('cd.updatedGitOpsServerSuccessfully'))
            : showSuccess(getString('cd.createdGitOpsServerSuccessfully'))

          setLoading(false)

          res.nextCallback?.()
        }
      })
      .catch(e => {
        if (shouldShowError(e)) {
          showError(getErrorInfoFromErrorObject(e))
        }
        setLoading(false)
      })
  }

  const handleSubmit = async (formData: GitOpsProvider): Promise<void> => {
    handleSave(formData)
  }

  const getInitialValues = (): any => {
    if (isEdit) {
      return pick(props.provider, ['name', 'identifier', 'description', 'tags', 'spec']) as GitOpsProvider
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        tags: {},
        spec: {
          namespace: '',
          highAvailability: false
        }
      }
    }
  }
  return (
    <>
      {creating || updating ? (
        <PageSpinner
          message={
            creating
              ? getString('cd.creatingGitOpsServer', { name: providerName })
              : getString('cd.updatingGitOpsServer', { name: providerName })
          }
        />
      ) : null}

      <Layout.Vertical spacing="xxlarge" className={css.stepContainer}>
        <div className={css.heading}>{props.name}</div>
        <Container className={css.connectorForm}>
          <Formik<GitOpsProvider>
            onSubmit={formData => {
              handleSubmit(formData)
            }}
            enableReinitialize={true}
            formName={`GitOpsProviderStepForm${provider?.spec?.type}`}
            validationSchema={Yup.object().shape({
              spec: Yup.object().shape({
                namespace: Yup.string().trim().required('Please enter namespace')
              })
            })}
            initialValues={{
              ...getInitialValues(),
              ...prevStepData
            }}
          >
            {formikProps => {
              saveCurrentStepData(props.getCurrentStepData, formikProps.values)
              return (
                <FormikForm>
                  <Container className={css.mainContainer} style={{ minHeight: 460, maxHeight: 460 }}>
                    <ModalErrorHandler
                      bind={setModalErrorHandler}
                      style={{
                        maxWidth: '740px',
                        marginBottom: '20px',
                        borderRadius: '3px',
                        borderColor: 'transparent'
                      }}
                    />
                    <div className={css.contentContainer}>
                      <div className={css.formContainer}>
                        <FormInput.Text className={css.adapterUrl} name="spec.namespace" label={'Namespace'} />
                        <Toggle
                          label={'High Availabilty'}
                          checked={highAvailability}
                          onToggle={isToggled => {
                            setHighAvailability(isToggled)
                          }}
                          data-testid={'HighAvailablility'}
                        />
                      </div>
                      <div className={css.aboutHarnessAdapterContainer}>
                        <CodeBlock allowCopy format="pre" snippet={dummyYAML} />
                      </div>
                    </div>
                  </Container>
                  <Layout.Horizontal>
                    <Button
                      variation={ButtonVariation.SECONDARY}
                      style={{ marginRight: '12px' }}
                      text={getString('back')}
                      icon="chevron-left"
                      onClick={() => props?.previousStep?.(props?.prevStepData)}
                      data-name="backToOverview"
                    />

                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      rightIcon="chevron-right"
                      disabled={loading || isSaveButtonDisabled}
                    >
                      <String stringID="saveAndContinue" />
                    </Button>
                  </Layout.Horizontal>
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
      </Layout.Vertical>
    </>
  )
}
