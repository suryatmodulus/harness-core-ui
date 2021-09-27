import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { Button, ButtonVariation, Color, Container, FontVariation, Layout, Text } from '@wings-software/uicore'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { useStrings } from 'framework/strings'
import type { GovernanceMetadata } from 'services/pipeline-ng'
import css from './ExecutionPolicyEvaluationsView.module.scss'

export interface PolicySetEvaluationsProps {
  accountId: string
  metadata: GovernanceMetadata
}

const policyPassed = (severity: string): boolean => severity !== 'error'

export const PolicySetEvaluations: React.FC<PolicySetEvaluationsProps> = ({ metadata, accountId: _accountId }) => {
  const failure = !!metadata.deny
  const { getString } = useStrings()
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())

  const details = get(metadata, 'details') as Array<{
    deny: boolean
    policySetId: string
    policyMetadata: Array<{ policyId: string; policyName: string; severity: string; denyMessages: string[] }>
  }>

  // console.log({ metadata, accountId, details })

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
      <Text margin={{ top: 'large' }} font={{ variation: FontVariation.UPPERCASED }}>
        {getString('pipeline.policyEvaluations.evaluatedTime', { time: '1 minute ago' })}
      </Text>

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
      {details.map(({ deny, policyMetadata, policySetId }) => {
        // TODO: API MUST RETURN policy set name and description
        const name = 'Policy Set: CD Guardrails'
        const desc = 'Basic description of the set'

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
                <Container style={{ flexGrow: 1 }}>
                  <Text font={{ variation: FontVariation.BODY2 }}>{name}</Text>
                  <Text font={{ variation: FontVariation.TINY }}>{desc}</Text>
                </Container>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.status}>
                  <ExecutionStatusLabel status={deny ? 'Failed' : 'Success'} />
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.details}>
                  <Button variation={ButtonVariation.ICON} icon="main-link" />
                </Text>
              </Layout.Horizontal>

              {expandedSets.has(policySetId) &&
                policyMetadata?.map(({ policyId, policyName, severity, denyMessages }) => {
                  return (
                    <Layout.Horizontal spacing="xsmall" padding={{ top: 'medium' }} key={policyId}>
                      <Container style={{ flexGrow: 1 }}>
                        <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_7}>
                          {policyName}
                        </Text>
                        {!policyPassed(severity) && !!denyMessages?.length && (
                          <Layout.Horizontal
                            spacing="xsmall"
                            padding={{ left: 'xxxlarge', top: 'xsmall' }}
                            style={{ alignItems: 'center' }}
                          >
                            <Text font={{ variation: FontVariation.UPPERCASED }}>{getString('details')}</Text>
                            {denyMessages.map(message => (
                              <Text key={message} font={{ variation: FontVariation.BODY }} color={Color.RED_500}>
                                {message}
                              </Text>
                            ))}
                          </Layout.Horizontal>
                        )}
                      </Container>

                      <Text className={css.status}>
                        <ExecutionStatusLabel status={policyPassed(severity) ? 'Success' : 'Failed'} />
                      </Text>

                      <Text className={css.details}></Text>
                    </Layout.Horizontal>
                  )
                })}
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
