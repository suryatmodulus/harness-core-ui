import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { get } from 'lodash-es'
import ReactTimeago from 'react-timeago'
import { Button, ButtonVariation, Color, Container, FontVariation, Layout, Text, Intent } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { Evaluation, EvaluationDetails, EvaluatedPolicy } from 'services/pm'
import { EvaluationStatus, evaluationStatusToColor } from '@governance/utils/GovernanceUtils'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { EvaluationStatusLabel } from '../../components/EvaluationStatus/EvaluationStatusLabel'
import css from './EvaluationView.module.scss'

export interface EvaluationViewProps {
  accountId: string
  module?: Module

  // data from Pipeline execution's governanceMetadata and from OPA execution API is
  // slightly different. Hence this field has type unknown and will be converted to correct
  // data types depends on where this component is used (in Pipeline or in Governance)
  // @see https://harness.slack.com/archives/C029RA4PFJT/p1635106132101700?thread_ts=1634943427.098500&cid=C029RA4PFJT
  metadata: unknown

  noHeadingMessage?: boolean
  headingErrorMessage?: string
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  accountId,
  module,
  metadata: _metadata,
  noHeadingMessage,
  headingErrorMessage
}) => {
  const { getString } = useStrings()
  const history = useHistory()
  const [expandedSets, setExpandedSets] = useState<Set<string>>(new Set())
  const metadata = _metadata as Evaluation
  const failure = metadata.status === EvaluationStatus.ERROR
  const details = get(metadata, 'details') as EvaluationDetails
  const timestamp = Number(get(metadata, 'timestamp') || 0)

  useEffect(() => {
    // Always expand if there's only one item
    if (details?.length === 1) {
      setExpandedSets(new Set([details[0].identifier as string]))
    }
  }, [details])

  return (
    <Container padding="xlarge">
      {/* Alert on top */}
      {!noHeadingMessage && (
        <Text
          background={failure ? Color.RED_100 : Color.GREEN_100}
          icon={failure ? 'warning-sign' : 'tick-circle'}
          iconProps={{ style: { color: failure ? 'var(--red-500)' : 'var(--green-500)' } }}
          font={{ variation: FontVariation.BODY1 }}
          padding="small"
        >
          {headingErrorMessage || getString(failure ? 'governance.failureHeading' : 'governance.successHeading')}
        </Text>
      )}

      {/* Evaluation time */}
      {(timestamp && (
        <Text margin={{ top: 'large' }} font={{ variation: FontVariation.UPPERCASED }}>
          {getString('governance.evaluatedTime')}
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
      {details?.map(policySet => {
        const { status: policySetStatus, identifier = '' } = policySet
        const policySetName = get(policySet, 'name') || get(policySet, 'policySetName')
        const policyMetadata = get(policySet, 'details') || (get(policySet, 'policyMetadata') as EvaluatedPolicy[])
        let policySetOutcomeIntent: Intent = Intent.DANGER
        let policySetOutcomeLabel = getString('failed')

        switch (policySetStatus) {
          case EvaluationStatus.PASS:
            policySetOutcomeIntent = Intent.SUCCESS
            policySetOutcomeLabel = getString('success')
            break
          case EvaluationStatus.WARNING:
            policySetOutcomeIntent = Intent.WARNING
            policySetOutcomeLabel = getString('governance.warning')
            break
        }

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
                  {getString('governance.policySetName', { name: policySetName || identifier })}
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.status}>
                  <EvaluationStatusLabel intent={policySetOutcomeIntent} label={policySetOutcomeLabel.toUpperCase()} />
                </Text>

                <Text font={{ variation: FontVariation.TABLE_HEADERS }} className={css.details}>
                  <Button
                    variation={ButtonVariation.ICON}
                    icon="main-link"
                    onClick={() => {
                      history.push(
                        routes.toGovernanceEvaluationDetail({
                          accountId,
                          orgIdentifier: metadata.org_id,
                          projectIdentifier: metadata.project_id,
                          module,
                          evaluationId: String(metadata.id)
                        })
                      )
                    }}
                  />
                </Text>
              </Layout.Horizontal>

              {expandedSets.has(identifier) && (
                <>
                  {!policyMetadata?.length && (
                    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500} padding={{ top: 'medium' }}>
                      {getString('governance.emptyPolicySet')}
                    </Text>
                  )}
                  {policyMetadata?.map(evaluatedPolicy => {
                    const { status = '', deny_messages, policy } = evaluatedPolicy
                    const policyName = policy?.name || get(evaluatedPolicy, 'policyName')
                    const policyIdentifier = policy?.identifier || get(evaluatedPolicy, 'policyIdentifier')
                    const denyMessages =
                      deny_messages || (get(evaluatedPolicy, 'denyMessages') as EvaluatedPolicy['deny_messages'])

                    let policyOutcomeIntent: Intent = Intent.SUCCESS
                    let policyOutcomeLabel = getString('success')

                    switch (status) {
                      case EvaluationStatus.ERROR:
                        policyOutcomeIntent = Intent.DANGER
                        policyOutcomeLabel = getString('failed')
                        break
                      case EvaluationStatus.WARNING:
                        policyOutcomeIntent = Intent.WARNING
                        policyOutcomeLabel = getString('governance.warning')
                        break
                    }

                    return (
                      <Layout.Horizontal spacing="xsmall" padding={{ top: 'medium' }} key={policyIdentifier}>
                        <Container style={{ flexGrow: 1 }}>
                          <Text font={{ variation: FontVariation.BODY }} color={Color.PRIMARY_7}>
                            <Link
                              to={routes.toGovernanceEditPolicy({
                                accountId,
                                orgIdentifier: metadata.org_id,
                                projectIdentifier: metadata.project_id,
                                policyIdentifier: policyIdentifier,
                                module
                              })}
                            >
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
                                    color={evaluationStatusToColor(status)}
                                  >
                                    {denyMessages?.length > 1 ? '- ' : ''}
                                    {message}
                                  </Text>
                                ))}
                              </Container>
                            </Layout.Horizontal>
                          )}
                        </Container>

                        <Text className={css.status}>
                          <EvaluationStatusLabel
                            intent={policyOutcomeIntent}
                            label={policyOutcomeLabel.toLocaleUpperCase()}
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
