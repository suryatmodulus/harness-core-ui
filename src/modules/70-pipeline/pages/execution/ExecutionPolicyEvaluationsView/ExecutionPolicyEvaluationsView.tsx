import React, { useEffect, useState } from 'react'
import { Link, useParams, useHistory } from 'react-router-dom'
import { Dialog } from '@blueprintjs/core'
import { get } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import { Button, ButtonVariation, Color, Container, FontVariation, Heading, Layout, Text } from '@wings-software/uicore'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { GovernanceMetadata } from 'services/pipeline-ng'
import css from './ExecutionPolicyEvaluationsView.module.scss'

export interface PolicySetEvaluationsProps {
  accountId: string
  metadata: GovernanceMetadata
}

interface PolicyEvaluationResponse {
  identifier: string
  policyName: string
  severity: string
  denyMessages: string[]
}

interface PolicySetEvaluationResponse {
  deny: boolean
  policySetId: string
  policySetName: string
  policyMetadata: PolicyEvaluationResponse[]
}

const policyPassed = (_severity: string, denyMessages: string[]): boolean => !denyMessages?.length

export const PolicySetEvaluations: React.FC<PolicySetEvaluationsProps> = ({ metadata, accountId: _accountId }) => {
  const failure = !!metadata.deny
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())
  const details = get(metadata, 'details') as PolicySetEvaluationResponse[]
  const timestamp = Number(get(metadata, 'timestamp') || 0)

  useEffect(() => {
    // Always expand if there's only one item
    if (details?.length === 1) {
      setExpandedSets(new Set([details[0].policySetId]))
    }
  }, [details])

  return (
    <Container padding="xlarge">
      {/* Alert on top */}
      <Text
        background={failure ? Color.RED_100 : Color.GREEN_100}
        icon={failure ? 'warning-sign' : 'tick-circle'}
        iconProps={{ style: { color: failure ? 'var(--red-500)' : 'var(--green-500)' } }}
        font={{ variation: FontVariation.BODY1 }}
        padding="small"
      >
        {getString(failure ? 'pipeline.policyEvaluations.failureHeading' : 'pipeline.policyEvaluations.successHeading')}
      </Text>

      {/* Evaluation time */}
      {(timestamp && (
        <Text margin={{ top: 'large' }} font={{ variation: FontVariation.UPPERCASED }}>
          {getString('pipeline.policyEvaluations.evaluatedTime')}
          <ReactTimeago date={timestamp} live />
        </Text>
      )) ||
        null}

      {/* Detail header */}
      <Layout.Horizontal margin={{ top: 'large', bottom: 'medium' }}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }} style={{ flexGrow: 1 }}>
          {getString('pipeline.policyEvaluations.policySet').toUpperCase()}
        </Text>
        <Text width={250} font={{ variation: FontVariation.TABLE_HEADERS }}>
          {getString('status').toUpperCase()}
        </Text>
        <Text width={100} font={{ variation: FontVariation.TABLE_HEADERS }}>
          {getString('details').toUpperCase()}
        </Text>
      </Layout.Horizontal>

      {/* Data content */}
      {details.map(({ deny, policyMetadata, policySetId, policySetName }) => {
        return (
          <Layout.Horizontal
            key={policySetId}
            padding="large"
            margin={{ bottom: 'medium' }}
            className={css.policySetItem}
            spacing="small"
          >
            <Button
              variation={ButtonVariation.ICON}
              icon={expandedSets.has(policySetId) ? 'main-chevron-up' : 'main-chevron-down'}
              onClick={() => {
                if (expandedSets.has(policySetId)) {
                  expandedSets.delete(policySetId)
                } else {
                  expandedSets.add(policySetId)
                }
                setExpandedSets(new Set(expandedSets))
              }}
            />

            <Container style={{ flexGrow: 1 }}>
              <Layout.Horizontal spacing="xsmall" className={expandedSets.has(policySetId) ? css.firstRow : ''}>
                <Text font={{ variation: FontVariation.BODY2 }} className={css.policySetName}>
                  {getString('pipeline.policyEvaluations.policySetName', { name: policySetName || policySetId })}
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.status}>
                  <ExecutionStatusLabel
                    status={deny ? 'Failed' : 'Success'}
                    label={deny ? undefined : getString('pipeline.policyEvaluations.passed').toUpperCase()}
                  />
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.details}>
                  <Button
                    variation={ButtonVariation.ICON}
                    icon="main-link"
                    onClick={() => {
                      // TODO: Update to evaluation detailed page when it's built
                      history.push(routes.toPolicyEvaluationsPage({ accountId }))
                    }}
                  />
                </Text>
              </Layout.Horizontal>

              {expandedSets.has(policySetId) && (
                <>
                  {!policyMetadata?.length && (
                    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} padding={{ top: 'medium' }}>
                      {getString('pipeline.policyEvaluations.emptyPolicySet')}
                    </Text>
                  )}
                  {policyMetadata?.map(({ identifier, policyName, severity, denyMessages }) => {
                    return (
                      <Layout.Horizontal spacing="xsmall" padding={{ top: 'medium' }} key={identifier}>
                        <Container style={{ flexGrow: 1 }}>
                          <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_7}>
                            <Link to={routes.toPolicyEditPage({ accountId, policyIdentifier: identifier })}>
                              {policyName}
                            </Link>
                          </Text>
                          {!policyPassed(severity, denyMessages) && !!denyMessages?.length && (
                            <Layout.Horizontal
                              spacing="xsmall"
                              padding={{ left: 'xxxlarge', top: 'xsmall' }}
                              style={{ alignItems: 'center' }}
                            >
                              <Text font={{ variation: FontVariation.UPPERCASED }}>{getString('details')}</Text>
                              <Container padding={{ left: 'small' }}>
                                {denyMessages.map(message => (
                                  <Text key={message} font={{ variation: FontVariation.BODY }} color={Color.RED_500}>
                                    - {message}
                                  </Text>
                                ))}
                              </Container>
                            </Layout.Horizontal>
                          )}
                        </Container>

                        <Text className={css.status}>
                          <ExecutionStatusLabel
                            status={policyPassed(severity, denyMessages) ? 'Success' : 'Failed'}
                            label={deny ? undefined : getString('pipeline.policyEvaluations.passed').toUpperCase()}
                          />
                        </Text>

                        <Text className={css.details}></Text>
                      </Layout.Horizontal>
                    )
                  })}
                </>
              )}
            </Container>
          </Layout.Horizontal>
        )
      })}
    </Container>
  )
}

export default function ExecutionPolicyEvaluationsView(): React.ReactElement | null {
  const { accountId } = useParams<PipelineType<ExecutionPathProps>>()

  const context = useExecutionContext()
  const status = (context?.pipelineExecutionDetail?.pipelineExecutionSummary?.status || '').toUpperCase()

  // When build/execution is not resolved from context, render nothing
  // Spinner is already provided by the parent
  if (!status) {
    return null
  }

  const governanceMetadata = context.pipelineExecutionDetail?.pipelineExecutionSummary?.governanceMetadata

  return (
    <div className={css.main}>
      {!!governanceMetadata && <PolicySetEvaluations metadata={governanceMetadata} accountId={accountId} />}
    </div>
  )
}

export const PolicyEvaluationsFailureModal: React.FC<Partial<PolicySetEvaluationsProps>> = ({
  metadata,
  accountId
}) => {
  const [opened, setOpened] = useState(true)
  if (!accountId || !metadata) {
    return null
  }

  return (
    <Dialog
      isOpen={opened}
      onClose={() => setOpened(false)}
      title={
        <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ top: 'medium' }}>
          Policy Set Evaluations
        </Heading>
      }
      enforceFocus={false}
      style={{ width: 900, height: 600 }}
    >
      <Container style={{ overflow: 'auto' }}>
        <PolicySetEvaluations metadata={metadata} accountId={accountId} />
      </Container>
    </Dialog>
  )
}
