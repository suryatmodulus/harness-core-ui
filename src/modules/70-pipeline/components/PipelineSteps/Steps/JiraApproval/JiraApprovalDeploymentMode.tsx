import React from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty, set } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import { isApprovalStepFieldDisabled } from '../ApprovalCommons'
import type { JiraApprovalDeploymentModeProps } from './types'
import css from './JiraApproval.module.scss'

const FormContent = (formContentProps: JiraApprovalDeploymentModeProps) => {
  const { inputSetData, onUpdate, initialValues } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          className={css.deploymentViewMedium}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
        <ConnectorReferenceField
          name={`${prefix}spec.conectorRef`}
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          selected={(initialValues?.spec?.connectorRef as string) || ''}
          placeholder={getString('connectors.selectConnector')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={360}
          disabled={isApprovalStepFieldDisabled(readonly)}
          type={'Jira'}
          onChange={(record, scope) => {
            const connectorRef =
              scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
            set(initialValues, 'spec.connectorRef', connectorRef)
            onUpdate?.(initialValues)
          }}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.issueKey) === MultiTypeInputType.RUNTIME ? (
        <FormInput.Text
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.issueKey`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.jiraApprovalStep.issueKeyPlaceholder')}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.approvalCriteria?.spec?.expression) === MultiTypeInputType.RUNTIME ? (
        <FormInput.TextArea
          label={getString('pipeline.jiraApprovalStep.jexlExpressionLabelApproval')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.approvalCriteria.spec.expression`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.jiraApprovalStep.jexlExpressionPlaceholder')}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.rejectionCriteria?.spec?.expression) === MultiTypeInputType.RUNTIME ? (
        <FormInput.TextArea
          label={getString('pipeline.jiraApprovalStep.jexlExpressionLabelRejection')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.rejectionCriteria.spec.expression`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.jiraApprovalStep.jexlExpressionPlaceholder')}
        />
      ) : null}
    </React.Fragment>
  )
}

/*
Used for iput sets and deployment form
Provide values for all runtime fields in approval step
Open the same form in readonly view while viewing already run executions
*/
export default function JiraApprovalDeploymentMode(props: JiraApprovalDeploymentModeProps): JSX.Element {
  return <FormContent {...props} />
}
