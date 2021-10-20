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
import type { StringsContextValue } from 'framework/strings/StringsContext'
import routes from '@common/RouteDefinitions'
import type { GovernanceMetadata } from 'services/pipeline-ng'
import css from './ExecutionPolicyEvaluationsView.module.scss'

export interface PolicySetEvaluationsProps {
  accountId: string
  metadata: GovernanceMetadata
  headingErrorMessage?: string
}

export interface PolicySetEvaluationsModalProps extends PolicySetEvaluationsProps {
  modalTitle?: string
}

interface PolicyEvaluationResponse {
  identifier: string
  policyName: string
  severity: string
  status: string
  denyMessages: string[]
}

interface PolicySetEvaluationResponse {
  deny: boolean
  identifier: string
  policySetName: string
  policyMetadata: PolicyEvaluationResponse[]
}

enum PolicyEvaluationStatus {
  ERROR = 'error',
  WARNING = 'warning',
  PASS = 'pass'
}

const statusToColor = (status: string): Color => {
  switch (status) {
    case PolicyEvaluationStatus.ERROR:
      return Color.ERROR
    case PolicyEvaluationStatus.WARNING:
      return Color.WARNING
  }

  return Color.SUCCESS
}

const statusToLabel = (getString: StringsContextValue['getString'], status: string): string => {
  let label: string | undefined = getString?.('passed')?.toUpperCase()

  switch (status) {
    case PolicyEvaluationStatus.ERROR:
      label = getString?.('failed')?.toUpperCase()
      break
    case PolicyEvaluationStatus.WARNING:
      label = getString?.('pipeline.policyEvaluations.warn')?.toUpperCase()
      break
  }

  return label || ''
}

export const PolicySetEvaluations: React.FC<PolicySetEvaluationsProps> = ({ metadata, headingErrorMessage }) => {
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
      setExpandedSets(new Set([details[0].identifier]))
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
        {headingErrorMessage ||
          getString(
            failure ? 'pipeline.policyEvaluations.failureHeading' : 'pipeline.policyEvaluations.successHeading'
          )}
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
          {getString('common.policiesSets.table.name').toUpperCase()}
        </Text>
        <Text width={250} font={{ variation: FontVariation.TABLE_HEADERS }}>
          {getString('status').toUpperCase()}
        </Text>
        <Text width={100} font={{ variation: FontVariation.TABLE_HEADERS }}>
          {getString('details').toUpperCase()}
        </Text>
      </Layout.Horizontal>

      {/* Data content */}
      {details.map(({ deny, policyMetadata, identifier, policySetName }) => {
        return (
          <Layout.Horizontal
            key={identifier}
            padding="large"
            margin={{ bottom: 'medium' }}
            className={css.policySetItem}
            spacing="small"
          >
            <Button
              variation={ButtonVariation.ICON}
              icon={expandedSets.has(identifier) ? 'main-chevron-up' : 'main-chevron-down'}
              onClick={() => {
                if (expandedSets.has(identifier)) {
                  expandedSets.delete(identifier)
                } else {
                  expandedSets.add(identifier)
                }
                setExpandedSets(new Set(expandedSets))
              }}
            />

            <Container style={{ flexGrow: 1 }}>
              <Layout.Horizontal spacing="xsmall" className={expandedSets.has(identifier) ? css.firstRow : ''}>
                <Text font={{ variation: FontVariation.BODY2 }} className={css.policySetName}>
                  {getString('pipeline.policyEvaluations.policySetName', { name: policySetName || identifier })}
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.status}>
                  <ExecutionStatusLabel
                    status={deny ? 'Failed' : 'Success'}
                    label={deny ? undefined : getString('passed').toUpperCase()}
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

              {expandedSets.has(identifier) && (
                <>
                  {!policyMetadata?.length && (
                    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} padding={{ top: 'medium' }}>
                      {getString('pipeline.policyEvaluations.emptyPolicySet')}
                    </Text>
                  )}
                  {policyMetadata?.map(({ identifier: policyIdentifier, policyName, status, denyMessages }) => {
                    return (
                      <Layout.Horizontal spacing="xsmall" padding={{ top: 'medium' }} key={policyIdentifier}>
                        <Container style={{ flexGrow: 1 }}>
                          <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_7}>
                            <Link to={routes.toPolicyEditPage({ accountId, policyIdentifier: policyIdentifier })}>
                              {policyName}
                            </Link>
                          </Text>
                          {!!denyMessages?.length && (
                            <Layout.Horizontal
                              spacing="xsmall"
                              padding={{ left: 'xxxlarge', top: 'xsmall' }}
                              style={{ alignItems: 'center' }}
                            >
                              <Text font={{ variation: FontVariation.UPPERCASED }}>{getString('details')}</Text>
                              <Container padding={{ left: 'small' }}>
                                {denyMessages.map(message => (
                                  <Text
                                    key={message}
                                    font={{ variation: FontVariation.BODY }}
                                    color={statusToColor(status)}
                                  >
                                    - {message}
                                  </Text>
                                ))}
                              </Container>
                            </Layout.Horizontal>
                          )}
                        </Container>

                        <Text className={css.status}>
                          <ExecutionStatusLabel
                            status={status === PolicyEvaluationStatus.PASS ? 'Success' : 'Failed'}
                            label={statusToLabel(getString, status)}
                            className={status === PolicyEvaluationStatus.WARNING ? css.warningStatus : ''}
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

export const PolicyEvaluationsFailureModal: React.FC<Partial<PolicySetEvaluationsModalProps>> = ({
  metadata,
  accountId,
  modalTitle: title,
  headingErrorMessage: failureMessage
}) => {
  const [opened, setOpened] = useState(true)
  const { getString } = useStrings()
  if (!accountId || !metadata) {
    return null
  }

  return (
    <Dialog
      isOpen={opened}
      onClose={() => setOpened(false)}
      title={
        <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ top: 'medium' }}>
          {title || getString('pipeline.policyEvaluations.failureModalTitle')}
        </Heading>
      }
      enforceFocus={false}
      style={{ width: 900, height: 600 }}
    >
      <Container style={{ overflow: 'auto' }}>
        <PolicySetEvaluations metadata={metadata} accountId={accountId} headingErrorMessage={failureMessage} />
      </Container>
    </Dialog>
  )
}
