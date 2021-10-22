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
  Container,
  Text,
  ButtonVariation
} from '@wings-software/uicore'
import { V1Agent, useAgentServiceCreate } from 'services/gitops'

import { getErrorInfoFromErrorObject, shouldShowError } from '@common/utils/errorUtils'
import { saveCurrentStepData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { String, useStrings } from 'framework/strings'
import { PageSpinner, useToaster } from '@common/components'

import type { BaseProviderStepProps } from '../types'

import css from './SetupGitOpsServerStep.module.scss'

type SetupGitOpsServerStepProps = BaseProviderStepProps

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

const dummyYAML = `
num: -1083669237
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
      direct: 456028677.1854496
      yourself: -1746925063.3320909
      community: true
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

  const { mutate: createAgent, loading: creating } = useAgentServiceCreate({})
  // const { mutate: updateConnector, loading: updating } = useAgentServiceUpdate(agentIdentifier, {})

  const handleCreateOrEdit = async (payload: V1Agent): Promise<any> => {
    modalErrorHandler?.hide()
    // const queryParams: UseAgentServiceCreateProps = {}

    // const response = props.isEditMode
    //   ? await updateConnector(payload, {
    //       queryParams: {
    //         ...queryParams
    //       }
    //     })
    //   :

    const response = await createAgent(payload)

    return {
      status: response,
      nextCallback: afterSuccessHandler.bind(null, response)
    }
  }

  const isSaveButtonDisabled = creating /* || updating */

  const afterSuccessHandler = (response: any): void => {
    props.onUpdateMode?.(true)
    nextStep?.({ ...props.provider, ...response })
  }

  const handleSave = (formData: V1Agent): void => {
    setLoading(true)
    const data: V1Agent = {
      ...formData,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier,
      accountIdentifier: accountId
    }

    setProviderName(formData.name)

    handleCreateOrEdit(data)
      .then(res => {
        // if (res.status === 'SUCCESS') {
        props.isEditMode
          ? showSuccess(getString('cd.updatedGitOpsServerSuccessfully'))
          : showSuccess(getString('cd.createdGitOpsServerSuccessfully'))

        setLoading(false)

        res.nextCallback?.()
        // }
      })
      .catch(e => {
        if (shouldShowError(e)) {
          showError(getErrorInfoFromErrorObject(e))
        }
        setLoading(false)
      })
  }

  const handleSubmit = async (formData: V1Agent): Promise<void> => {
    handleSave(formData)
  }

  const getInitialValues = (): any => {
    if (isEdit) {
      return pick(props.provider, ['name', 'identifier', 'description', 'tags']) as V1Agent
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        tags: {},
        metaData: {
          namespace: '',
          highAvailability: false
        }
      }
    }
  }
  return (
    <>
      {creating /* || updating */ ? (
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
          <Formik<V1Agent>
            onSubmit={formData => {
              handleSubmit(formData)
            }}
            enableReinitialize={true}
            formName={`GitOpsServerStepForm${provider?.type}`}
            validationSchema={Yup.object().shape({
              metaData: Yup.object().shape({
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
                        <FormInput.Text className={css.adapterUrl} name="metaData.namespace" label={'Namespace'} />
                        <Text className={css.highAvailabilityLabel}> High Availabilty </Text>
                        <Toggle
                          label={''}
                          checked={highAvailability}
                          onToggle={isToggled => {
                            setHighAvailability(isToggled)
                          }}
                          data-testid={'HighAvailablility'}
                        />

                        <hr className={css.headerSeparator} />
                        <div className={css.configureProxyTitle}>Configure Proxy Settings (optional)</div>
                        <div className={css.configureProxyDesc}>
                          If the connection to Harness is through a proxy, configure the proxy settings PROXY_HOST,
                          PROXY_USER, and PROXY_PASSWORD in harness-gitops agent.yaml
                          <div className={css.configureProxyDocLink}>
                            Please refer to
                            <a href="" target="_blank">
                              &nbsp; documentation &nbsp;
                            </a>
                            page.
                          </div>
                        </div>
                      </div>

                      <div className={css.yamlContainer}>
                        <div className={css.aboutHarnessAdapterContainer}>
                          <div className={css.copyYaml}>
                            harness-gitops-Agent.yaml
                            <Button variation={ButtonVariation.ICON} icon="copy-alt" />
                          </div>
                          {/* <CodeBlock allowCopy format="pre" snippet={dummyYAML} /> */}

                          <div className={css.codeBlock}>
                            <pre>{dummyYAML}</pre>
                          </div>
                        </div>

                        <Button
                          style={{
                            marginTop: '16px'
                          }}
                          padding={'large'}
                          variation={ButtonVariation.SECONDARY}
                          text={'Download YAML file'}
                          icon="download"
                        />
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
