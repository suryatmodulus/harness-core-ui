import React, { useRef, useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  ModalErrorHandlerBinding,
  Text,
  Icon,
  ModalErrorHandler,
  FormikForm,
  Container,
  ButtonVariation,
  Collapse
} from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { pick } from 'lodash-es'
import { GitOpsProvider, validateProviderIdentifierIsUniquePromise, Failure } from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import { saveCurrentStepData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import type { BaseProviderStepProps } from '../../types'
import aboutHarnessAdapterIllustration from '../../images/harnessManagedGitOpsServerIllustration.svg'
const aboutHarnessAdapterURL = `https://ngdocs.harness.io/article/ptlvh7c6z2-harness-argo-cd-git-ops-quickstart`
import css from './GitOpsServerOverviewStep.module.scss'

export type ProviderOverviewStepProps = BaseProviderStepProps

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

const ProviderOverviewStep: React.FC<ProviderOverviewStepProps> = props => {
  const { prevStepData, nextStep, provider } = props
  const {
    accountId,
    projectIdentifier: projectIdentifierFromUrl,
    orgIdentifier: orgIdentifierFromUrl
  } = useParams<Params>()
  const projectIdentifier = provider ? provider.projectIdentifier : projectIdentifierFromUrl
  const orgIdentifier = provider ? provider.orgIdentifier : orgIdentifierFromUrl

  const mounted = useRef(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [loading, setLoading] = useState(false)
  const isEdit = props.isEditMode
  const { getString } = useStrings()

  const handleSubmit = async (formData: GitOpsProvider): Promise<void> => {
    mounted.current = true
    if (isEdit) {
      nextStep?.(formData)
      return
    }
    setLoading(true)
    try {
      const response = await validateProviderIdentifierIsUniquePromise({
        queryParams: {
          identifier: formData.identifier,
          accountIdentifier: accountId,
          orgIdentifier: orgIdentifier,
          projectIdentifier: projectIdentifier
        }
      })
      setLoading(false)

      if ('SUCCESS' !== response.status) {
        modalErrorHandler?.showDanger((response as Failure)?.message || '')
        return
      }
      if (response.data) {
        nextStep?.(formData)
      } else {
        modalErrorHandler?.showDanger(
          getString('cd.duplicateGitOpsServerIdError', {
            providerName: formData.name,
            providerIdentifier: formData.identifier
          })
        )
      }
    } catch (error) {
      setLoading(false)
      modalErrorHandler?.showDanger(error.message)
    }
  }

  const getInitialValues = (): GitOpsProvider => {
    if (isEdit) {
      return pick(props.provider, ['name', 'identifier', 'description', 'tags', 'spec']) as GitOpsProvider
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        tags: {},
        spec: {
          type: 'MANAGED_ARGO_PROVIDER'
        }
      }
    }
  }

  return (
    <>
      <Layout.Vertical spacing="xxlarge" className={css.stepContainer}>
        <div className={css.heading}>{getString('overview')}</div>
        <Container className={css.connectorForm}>
          <Formik<GitOpsProvider>
            onSubmit={formData => {
              handleSubmit(formData)
            }}
            enableReinitialize={true}
            formName={`GitOpsProviderStepForm${provider?.spec?.type}`}
            validationSchema={Yup.object().shape({
              name: NameSchema(),
              identifier: IdentifierSchema()
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
                        <NameIdDescriptionTags
                          className={css.formElm}
                          formikProps={formikProps}
                          identifierProps={{ inputName: 'name', isIdentifierEditable: !isEdit }}
                          tooltipProps={{
                            dataTooltipId: `GitOpsProviderStepFormNameIdDescriptionTags`
                          }}
                        />
                      </div>

                      <div className={css.aboutHarnessAdapterContainer}>
                        <div className={css.aboutHarnessAdapterUrl}>
                          <Icon intent="primary" style={{ marginRight: '8px' }} size={16} name="info" />

                          <a href={aboutHarnessAdapterURL} rel="noreferrer" target="_blank">
                            {getString('cd.learnMoreAboutHarnessAdapter')}
                          </a>
                        </div>

                        <img src={aboutHarnessAdapterIllustration} className={css.aboutHarnessAdapterIllustration} />

                        <Text className={css.aboutHarnessAdapterQuestion} margin={{ bottom: 'small' }}>
                          {getString('cd.whatIsHarnessManagedGitOpsServer')}
                        </Text>
                        <Text className={css.aboutHarnessAdapterAnswer} margin={{ top: 'small', bottom: 'small' }}>
                          {getString('cd.aboutHarnessManagedGitOpsServer')}
                        </Text>

                        <div className={css.info}>
                          <Collapse isOpen={false} heading={'Components that will be installed'} isRemovable={false}>
                            <div className={css.installedComponents}>
                              <div className={css.installedComponent}>
                                <svg
                                  width="9"
                                  height="9"
                                  viewBox="0 0 9 9"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="4.5" cy="4.5" r="4.5" fill="#03C0CD" />
                                </svg>
                                &nbsp; GitOps agent
                              </div>
                              <div className={css.installedComponent}>
                                <svg
                                  width="9"
                                  height="9"
                                  viewBox="0 0 9 9"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="4.5" cy="4.5" r="4.5" fill="#03C0CD" />
                                </svg>
                                &nbsp; Repo server
                              </div>
                              <div className={css.installedComponent}>
                                <svg
                                  width="9"
                                  height="9"
                                  viewBox="0 0 9 9"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="4.5" cy="4.5" r="4.5" fill="#03C0CD" />
                                </svg>
                                &nbsp; Redis cache
                              </div>
                              <div className={css.installedComponent}>
                                <svg
                                  width="9"
                                  height="9"
                                  viewBox="0 0 9 9"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="4.5" cy="4.5" r="4.5" fill="#03C0CD" />
                                </svg>
                                &nbsp; Application controller
                              </div>
                            </div>
                          </Collapse>

                          <Collapse isOpen={false} heading={'Required permissions'} isRemovable={false}>
                            <div className={css.requiredPermissions}>
                              <div>
                                - Permission to create Deployment, Service, Statefulset, Network Policy, Service
                                Account, Role, ClusterRole, RoleBinding, ClusterRoleBinding, ConfigMap, Secret (For the
                                Harness GitOps Server)
                              </div>
                              <div>- Permission to apply CustomResourceDefinition For the Harness GitOps Server)</div>
                            </div>
                          </Collapse>
                        </div>
                      </div>
                    </div>
                  </Container>
                  <Layout.Horizontal>
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      rightIcon="chevron-right"
                      disabled={loading}
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

export default ProviderOverviewStep
