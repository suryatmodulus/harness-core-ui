import React, { useEffect, useMemo } from 'react'
import { get } from 'lodash-es'
import { useParams, useHistory, useLocation } from 'react-router-dom'
import { Page } from '@common/exports'
import { useGetEvaluation } from 'services/pm'
import { getErrorMessage, PipleLineEvaluationEvent } from '@governance/utils/GovernanceUtils'
import { EvaluationView } from '@governance/views/EvaluationView/EvaluationView'
import type { StringsContextValue } from 'framework/strings/StringsContext'
import { useStrings } from 'framework/strings'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'

const evaluationNameFromAction = (getString: StringsContextValue['getString'], action?: string): string => {
  return getString?.(action === PipleLineEvaluationEvent.ON_RUN ? 'governance.onRun' : 'governance.onSave') || ''
}

export const EvaluationDetail: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, evaluationId } = useParams<GovernancePathProps>()
  const queryParams = useMemo(
    () => ({
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }),
    [accountId, orgIdentifier, projectIdentifier]
  )
  const history = useHistory()
  const location = useLocation()
  const { data, refetch, loading, error } = useGetEvaluation({ queryParams, evaluation: evaluationId as string })

  useEffect(() => {
    if (data) {
      const entityMetadata = JSON.parse(decodeURIComponent(data.entity_metadata as string))
      const pageTitle = `${get(entityMetadata, 'pipelineName')} - ${evaluationNameFromAction(
        getString,
        data.action as string
      )} (${new Date(data.created as number).toLocaleString()})`
      history.replace({ pathname: location.pathname, search: `pageTitle=${pageTitle}` })
    }
  }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Page.Body loading={loading} error={getErrorMessage(error)} retryOnError={() => refetch()} filled>
      {data && <EvaluationView metadata={data} accountId={accountId} module={module} noHeadingMessage />}
    </Page.Body>
  )
}
