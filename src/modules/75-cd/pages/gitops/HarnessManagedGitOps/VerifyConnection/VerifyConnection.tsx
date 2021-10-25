/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import {
  Layout,
  Container,
  StepsProgress,
  Intent,
  Button,
  ButtonVariation,
  CodeBlock,
  Tabs
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useAgentServiceGet } from 'services/gitops'
import { useStrings } from 'framework/strings'
import type { BaseProviderStepProps } from '../types'
import css from './VerifyConnection.module.scss'

export enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

type TestConnectionProps = BaseProviderStepProps

export default function TestConnection(props: TestConnectionProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { prevStepData } = props
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.PROCESS)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const [verifyState, setVerifyState] = useState(false)
  const { getString } = useStrings()
  const handleSuccess = (): void => {
    props.onClose?.()
  }

  const params = {
    projectIdentifier,
    orgIdentifier,
    accountIdentifier: accountId
  }

  const { refetch } = useAgentServiceGet({
    identifier: prevStepData?.agentIdentifier as string,
    queryParams: { ...params },
    lazy: true
  })

  useEffect(() => {
    if (verifyState) {
      setCurrentStatus(Status.DONE)
      setCurrentIntent(Intent.PRIMARY)

      refetch()
    }
  }, [verifyState])

  // console.log('data, loading', data, loading, prevStepData)

  return (
    <Layout.Vertical className={css.stepContainer}>
      <div className={css.heading}>Apply YAML & Verify</div>

      <div className={css.contentContainer}>
        <Container className={css.connectorForm}>
          <Container style={{ height: 492, overflow: 'auto' }}>
            <Layout.Vertical spacing="medium" className={css.stepFormContainer}>
              <h4 className={css.selectConfigHeading}> Apply YAML and verify connection </h4>

              <div className={css.steps}>
                <div className={css.step}> 1. Connect to your cluster </div>
                <div className={css.step}>
                  2. Run the following command to apply the YAML file you downloaded <br />
                </div>
                <CodeBlock allowCopy format="pre" snippet={'kubectl apply-f harness-gitops-agent.yaml'} />
                <div className={css.step}> 3. Once YAML has been applied click Verify</div>
              </div>

              <div className={css.verifyYamlContainer}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('verify')}
                  data-name="verifyBtn"
                  onClick={() => setVerifyState(true)}
                />
              </div>

              {verifyState && (
                <div style={{ marginBottom: '32px' }}>
                  <StepsProgress
                    steps={[
                      'Heartbeat received',
                      'GitOps agent installed',
                      'Repo server installed',
                      'Redis cache installed',
                      'Application controller installed',
                      'Initialization complete'
                    ]}
                    intent={currentIntent}
                    current={6}
                    currentStatus={currentStatus}
                  />
                </div>
              )}
            </Layout.Vertical>
          </Container>

          <Layout.Horizontal spacing="large">
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('finish')}
              onClick={handleSuccess}
              className={css.nextButton}
            />
          </Layout.Horizontal>
        </Container>

        <Container className={css.info}>
          <Tabs
            id={'horizontalTabs'}
            defaultSelectedTabId={'tab1'}
            tabList={[
              {
                id: 'tab1',
                title: 'Common Problems',
                panel: (
                  <div>
                    <h3
                      style={{
                        textAlign: 'center',
                        color: '#000000',
                        marginBottom: '12px',
                        fontWeight: 500,
                        borderBottom: '0.5px solid #B0B1C4',
                        padding: '6px 0'
                      }}
                    >
                      Here is what you can do
                    </h3>

                    <h5> Check the status of your Harness GitOps Agent on your cluster </h5>

                    <CodeBlock
                      allowCopy
                      format="pre"
                      snippet={'kubectl describe pod <your-harness gitops agent-pod>'}
                    />

                    <h5> Check the Harness GitOps Agent Logs </h5>
                    <CodeBlock allowCopy format="pre" snippet={'kubectl logs -f <harness gitops agent> '} />
                    <div style={{ margin: '16px 0' }}>
                      If the pod is not up, in your cluster you see the harness gitops agent pod in a
                      CrashLoopBackOff:Kubernetes CLuster Resources are not available. Check the Kubernetes Cluster
                      Resources (CPU, Memory)
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <small> If the Harness GitOps Agent didn’t reach a healthy state </small>
                    </div>
                    <CodeBlock allowCopy format="pre" snippet={'kubectl describe pod_name -n harness gitops agent '} />

                    <h5>
                      Check the Health Check Endpoint in the harness gitops agent. Search YAML for healthCheckEndpoint
                    </h5>
                  </div>
                )
              },
              { id: 'tab2', title: 'Troubleshooting', panel: <div></div> }
            ]}
          />
        </Container>
      </div>
    </Layout.Vertical>
  )
}
