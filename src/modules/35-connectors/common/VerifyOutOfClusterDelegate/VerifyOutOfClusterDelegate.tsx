/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  StepsProgress,
  Layout,
  Button,
  Text,
  Intent,
  Color,
  StepProps,
  Container,
  ButtonVariation,
  FontVariation
} from '@wings-software/uicore'
import { useGetDelegateFromId } from 'services/portal'
import {
  useGetTestConnectionResult,
  ResponseConnectorValidationResult,
  ConnectorConfigDTO,
  Error,
  ConnectorInfoDTO,
  EntityGitDetails
} from 'services/cd-ng'

import type { StepDetails } from '@connectors/interfaces/ConnectorInterface'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import {
  GetTestConnectionValidationTextByType,
  removeErrorCode,
  DelegateTypes
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import css from './VerifyOutOfClusterDelegate.module.scss'

interface RenderUrlInfo {
  type: string
  url?: string
}

interface VerifyOutOfClusterDelegateProps {
  type: string
  isStep: boolean
  onClose?: () => void
  setIsEditMode?: (val: boolean) => void // Remove after removing all usages
  url?: string
  isLastStep?: boolean
  name?: string
  connectorInfo: ConnectorInfoDTO | void
  gitDetails?: EntityGitDetails
  stepIndex?: number // will make this mandatory once all usages sends the value
}
export interface VerifyOutOfClusterStepProps extends ConnectorConfigDTO {
  isEditMode?: boolean
}

export const STEP = {
  TEST_CONNECTION: 'TEST_CONNECTION'
}
export const StepIndex = new Map([[STEP.TEST_CONNECTION, 1]])

const RenderUrlInfo: React.FC<StepProps<VerifyOutOfClusterStepProps> & RenderUrlInfo> = props => {
  const { getString } = useStrings()

  const getLabel = (): string => {
    switch (props.type) {
      case Connectors.KUBERNETES_CLUSTER:
        return getString('connectors.testConnectionStep.url.k8s')
      case Connectors.DOCKER:
        return getString('connectors.testConnectionStep.url.docker')
      case Connectors.NEXUS:
        return getString('connectors.testConnectionStep.url.nexus')
      case Connectors.ARTIFACTORY:
        return getString('connectors.testConnectionStep.url.artifactory')

      case Connectors.APP_DYNAMICS:
        return getString('connectors.testConnectionStep.url.appD')

      case Connectors.SPLUNK:
        return getString('connectors.testConnectionStep.url.splunk')

      case Connectors.VAULT:
        return getString('connectors.testConnectionStep.url.vault')
      case 'Gcr':
        return getString('connectors.testConnectionStep.url.gcr')
      case Connectors.BITBUCKET:
      case Connectors.GITLAB:
      case Connectors.GITHUB:
      case Connectors.GIT:
        return getString('connectors.testConnectionStep.url.bitbucket')
      default:
        return ''
    }
  }
  const getValue = () => {
    switch (props.type) {
      case Connectors.KUBERNETES_CLUSTER:
        return props.prevStepData?.masterUrl
      case Connectors.HttpHelmRepo:
        return props.prevStepData?.helmRepoUrl
      case Connectors.DOCKER:
        return props.prevStepData?.dockerRegistryUrl
      case Connectors.NEXUS:
        return props.prevStepData?.nexusServerUrl

      case Connectors.ARTIFACTORY:
        return props.prevStepData?.artifactoryServerUrl

      case Connectors.APP_DYNAMICS:
        return props.prevStepData?.spec?.controllerUrl

      case Connectors.SPLUNK:
        return props.prevStepData?.splunkUrl

      case Connectors.VAULT:
        return props.prevStepData?.spec?.vaultUrl
      case Connectors.BITBUCKET:
      case Connectors.GITLAB:
      case Connectors.GITHUB:
      case Connectors.GIT:
        return props.prevStepData?.url

      default:
        return ''
    }
  }

  const value = props.url || getValue()

  return value ? (
    <Layout.Horizontal padding={{ top: 'xsmall' }} spacing="xsmall">
      <Text color={Color.GREY_400} font={{ size: 'small' }} className={css.subHeading}>
        {getLabel()}
      </Text>
      <Text color={Color.GREY_600} font={{ size: 'small' }} className={css.subHeading} lineClamp={1} width={'600px'}>
        {value}
      </Text>
    </Layout.Horizontal>
  ) : (
    <></>
  )
}

const VerifyOutOfClusterDelegate: React.FC<StepProps<VerifyOutOfClusterStepProps> & VerifyOutOfClusterDelegateProps> =
  props => {
    const { prevStepData, nextStep, isLastStep = false, connectorInfo } = props
    const branch = props.isStep ? prevStepData?.branch : props.gitDetails?.branch
    const repoIdentifier = props.isStep ? prevStepData?.repo : props.gitDetails?.repoIdentifier
    const {
      accountId,
      projectIdentifier: projectIdentifierFromUrl,
      orgIdentifier: orgIdentifierFromUrl
    } = useParams<ProjectPathProps>()
    const projectIdentifier = connectorInfo ? connectorInfo.projectIdentifier : projectIdentifierFromUrl
    const orgIdentifier = connectorInfo ? connectorInfo.orgIdentifier : orgIdentifierFromUrl

    const [viewDetails, setViewDetails] = useState<boolean>(false)
    const [testConnectionResponse, setTestConnectionResponse] = useState<ResponseConnectorValidationResult>()
    const [stepDetails, setStepDetails] = useState<StepDetails>({
      step: 1,
      intent: Intent.WARNING,
      status: 'PROCESS'
    })

    const { getString } = useStrings()

    const getPermissionsLink = (): string => {
      switch (props.type) {
        case Connectors.KUBERNETES_CLUSTER:
          return 'https://ngdocs.harness.io/article/sjjik49xww-kubernetes-cluster-connector-settings-reference'
        case Connectors.DOCKER:
          return 'https://ngdocs.harness.io/article/u9bsd77g5a-docker-registry-connector-settings-reference'
        case Connectors.AWS:
          return 'https://ngdocs.harness.io/article/m5vkql35ca-aws-connector-settings-reference'
        case Connectors.NEXUS:
          return 'https://ngdocs.harness.io/article/faor0dc98d-nexus-connector-settings-reference'
        case Connectors.ARTIFACTORY:
          return 'https://ngdocs.harness.io/article/euueiiai4m-artifactory-connector-settings-reference'
        case Connectors.GCP:
        case 'Gcr':
          return 'https://ngdocs.harness.io/article/yykfduond6-gcs-connector-settings-reference'
        case Connectors.GIT:
          return 'https://ngdocs.harness.io/category/xyexvcc206-ref-source-repo-provider'
        case Connectors.GITHUB:
          return 'https://ngdocs.harness.io/article/v9sigwjlgo-git-hub-connector-settings-reference'
        case Connectors.GITLAB:
          return 'https://ngdocs.harness.io/article/5abnoghjgo-git-lab-connector-settings-reference'
        case Connectors.BITBUCKET:
          return 'https://ngdocs.harness.io/article/iz5tucdwyu-bitbucket-connector-settings-reference'
        case Connectors.Jira:
          return 'https://ngdocs.harness.io/article/e6s32ec7i7'
        case Connectors.SERVICE_NOW:
          return 'https://ngdocs.harness.io/article/illz8off8q'
        case Connectors.HttpHelmRepo:
          return 'https://ngdocs.harness.io/article/a0jotsvsi7'
        default:
          return ''
      }
    }

    const { mutate: reloadTestConnection, loading } = useGetTestConnectionResult({
      identifier: connectorInfo && connectorInfo.identifier ? connectorInfo.identifier : prevStepData?.identifier || '',
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier,
        branch,
        repoIdentifier
      },
      requestOptions: {
        headers: {
          'content-type': 'application/json'
        }
      }
    })

    const {
      data: delegate,
      error: delegateError,
      refetch: refetchDelegateFromId,
      loading: loadingDelegate
    } = useGetDelegateFromId({
      delegateId: testConnectionResponse?.data?.delegateId || '',
      queryParams: { accountId },
      lazy: true
    })

    const renderError = () => {
      const { responseMessages = null } = testConnectionResponse?.data as Error
      const genericHandler = (
        <Layout.Vertical>
          <Layout.Horizontal className={css.errorResult}>
            <Text
              color={Color.GREY_900}
              lineClamp={1}
              font={{ size: 'small', weight: 'semi-bold' }}
              margin={{ top: 'small', bottom: 'small' }}
            >
              {testConnectionResponse?.data?.errorSummary}
            </Text>
            {testConnectionResponse?.data?.errors && (
              <Button
                text="View Details"
                intent="primary"
                font={{ size: 'small' }}
                minimal
                onClick={() => setViewDetails(!viewDetails)}
                rightIcon={viewDetails ? 'chevron-up' : 'chevron-down'}
                iconProps={{ size: 12 }}
              />
            )}
          </Layout.Horizontal>
          {viewDetails ? (
            <div className={css.errorMsg}>
              <pre>{JSON.stringify({ errors: removeErrorCode(testConnectionResponse?.data?.errors) }, null, ' ')}</pre>
            </div>
          ) : null}
        </Layout.Vertical>
      )
      return (
        <Layout.Vertical className={css.stepError}>
          {responseMessages ? (
            <ErrorHandler responseMessages={responseMessages} className={css.errorHandler} />
          ) : (
            genericHandler
          )}
          {/* TODO: when install delegate behaviour is known {testConnectionResponse?.data?.delegateId ? ( */}
          <Layout.Horizontal spacing="small">
            {props.isStep ? (
              <Button
                text={getString('editCredentials')}
                variation={ButtonVariation.SECONDARY}
                onClick={() => {
                  const isTransitionToCredentialsStepSuccessful = props.gotoStep?.({
                    stepIdentifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
                    prevStepData
                  })
                  if (!isTransitionToCredentialsStepSuccessful) {
                    props.previousStep?.({ ...prevStepData })
                  }
                  props.setIsEditMode?.(true) // Remove after all usages
                }}
                withoutBoxShadow
              />
            ) : null}
            <Text
              onClick={() => window.open(getPermissionsLink(), '_blank')}
              className={cx(css.veiwPermission, { [css.marginAuto]: props.isStep })}
              intent="primary"
            >
              {getString('connectors.testConnectionStep.viewPermissions')}
            </Text>
          </Layout.Horizontal>
          {/* ) : (
          <Button text={getString('connectors.testConnectionStep.installNewDelegate')} disabled width="160px" />
        )} */}
        </Layout.Vertical>
      )
    }

    const getStepOne = () => {
      return (
        <Layout.Vertical width={'100%'}>
          <Text color={Color.GREY_600}>{GetTestConnectionValidationTextByType(props.type)}</Text>
          {!loading && testConnectionResponse?.data?.delegateId ? (
            <Text padding={{ top: 'xsmall' }} color={Color.GREY_900} font={{ size: 'small' }}>
              {getString('connectors.testConnectionStep.executingOn')}
              {loadingDelegate
                ? getString('loading')
                : delegateError
                ? getString('connectors.testConnectionStep.noDelegate')
                : delegate?.resource?.hostName}
            </Text>
          ) : null}

          {stepDetails.step === StepIndex.get(STEP.TEST_CONNECTION) ? (
            stepDetails.status === 'ERROR' ? (
              testConnectionResponse?.data?.errorSummary ||
              testConnectionResponse?.data?.errors ||
              (testConnectionResponse?.data as Error)?.responseMessages ? (
                renderError()
              ) : (
                <Text padding={{ top: 'small' }}>{getString('connectors.testConnectionStep.placeholderError')}</Text>
              )
            ) : null
          ) : null}
        </Layout.Vertical>
      )
    }

    const executeEstablishConnection = async (): Promise<void> => {
      if (stepDetails.step === StepIndex.get(STEP.TEST_CONNECTION)) {
        if (stepDetails.status === 'PROCESS') {
          try {
            const result = await reloadTestConnection()

            setTestConnectionResponse(result)
            if (result?.data?.status === 'SUCCESS') {
              setStepDetails({
                step: 2,
                intent: Intent.SUCCESS,
                status: 'DONE'
              })
              props.completedStep?.(props.stepIndex as number)
            } else {
              setStepDetails({
                step: 1,
                intent: Intent.DANGER,
                status: 'ERROR'
              })
            }
          } catch (err) {
            setTestConnectionResponse(err)
            setStepDetails({
              step: 1,
              intent: Intent.DANGER,
              status: 'ERROR'
            })
          }
        }
      }
    }
    useEffect(() => {
      executeEstablishConnection()
    }, [])

    useEffect(() => {
      if (testConnectionResponse?.data?.delegateId) {
        refetchDelegateFromId()
      }
    }, [testConnectionResponse?.data?.delegateId])
    return (
      <Layout.Vertical>
        <Layout.Vertical>
          <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
            {getString('connectors.stepThreeName')}
          </Text>
          {prevStepData?.delegateType === DelegateTypes.DELEGATE_IN_CLUSTER ? null : (
            <RenderUrlInfo type={props.type} prevStepData={prevStepData} url={props.url} />
          )}
          <Container className={cx(css.content, { [css.contentMinHeight]: props.isStep })} padding={{ top: 'xxlarge' }}>
            <StepsProgress
              steps={[getStepOne()]}
              intent={stepDetails.intent}
              current={stepDetails.step}
              currentStatus={stepDetails.status}
            />

            {stepDetails.status === 'DONE' ? (
              <Text color={Color.GREEN_600} font={{ weight: 'bold' }} padding={{ top: 'large' }}>
                {getString('connectors.testConnectionStep.verificationSuccessful')}
              </Text>
            ) : null}
          </Container>
        </Layout.Vertical>
        {props.isStep ? (
          isLastStep ? (
            <Layout.Horizontal spacing="large" className={css.btnWrapper}>
              <Button
                intent="primary"
                onClick={() => {
                  props.onClose?.()
                }}
                text={getString('finish')}
                variation={ButtonVariation.SECONDARY}
              />
            </Layout.Horizontal>
          ) : (
            <Layout.Horizontal spacing="large" className={css.btnWrapper}>
              <Button
                variation={ButtonVariation.PRIMARY}
                onClick={() => {
                  nextStep?.({ ...prevStepData })
                }}
                text={getString('continue')}
              />
            </Layout.Horizontal>
          )
        ) : null}
      </Layout.Vertical>
    )
  }

export default VerifyOutOfClusterDelegate
