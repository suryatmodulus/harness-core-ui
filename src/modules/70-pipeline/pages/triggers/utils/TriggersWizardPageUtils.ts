import { isNull, isUndefined, omitBy } from 'lodash-es'
import { string, array, object, ObjectSchema } from 'yup'
import type { NgPipeline } from 'services/cd-ng'
import type { GetActionsListQueryParams, NGTriggerConfig, NGTriggerSource } from 'services/pipeline-ng'
import { connectorUrlType } from '@connectors/constants'
import type { PanelInterface } from '@common/components/Wizard/Wizard'
import { isCronValid } from '../views/subviews/ScheduleUtils'
import type { AddConditionInterface } from '../views/AddConditionsSection'

const CUSTOM = 'CUSTOM'

export interface FlatInitialValuesInterface {
  triggerType: NGTriggerSource['type']
  identifier?: string
  tags?: {
    [key: string]: string
  }
  pipeline?: string | NgPipeline
  originalPipeline?: NgPipeline
  name?: string
  // WEBHOOK-SPECIFIC
  sourceRepo?: GetActionsListQueryParams['sourceRepo'] | string
  // SCHEDULE-SPECIFIC
  selectedScheduleTab?: string
}

export interface ConnectorRefInterface {
  identifier: string
  repoName?: string
  value?: string
}

export interface FlatOnEditValuesInterface {
  name: string
  identifier: string
  targetIdentifier: string
  description?: string
  tags?: {
    [key: string]: string
  }
  pipeline: string
  triggerType: NGTriggerSource['type']
  originalPipeline?: NgPipeline
  // WEBHOOK-SPECIFIC
  sourceRepo?: GetActionsListQueryParams['sourceRepo']
  connectorRef?: {
    identifier: string
    repoName?: string
  }
  repoName?: string
  repoUrl?: string
  event?: string
  actions?: string[]
  anyAction?: boolean // required for onEdit to show checked
  secureToken?: string
  sourceBranchOperator?: string
  sourceBranchValue?: string
  targetBranchOperator?: string
  targetBranchValue?: string
  tagConditionOperator?: string
  tagConditionValue?: string
  headerConditions?: AddConditionInterface[]
  payloadConditions?: AddConditionInterface[]
  // SCHEDULE-SPECIFIC
  selectedScheduleTab?: string
  minutes?: string
  expression?: string
}

export interface FlatValidWebhookFormikValuesInterface {
  name: string
  identifier: string
  description?: string
  tags?: {
    [key: string]: string
  }
  target?: string
  targetIdentifier?: string
  pipeline: NgPipeline
  sourceRepo: GetActionsListQueryParams['sourceRepo']
  triggerType: NGTriggerSource['type']
  repoName?: string
  connectorRef?: { connector: { spec: { type: string } }; value: string } // get from dto interface when available
  event?: string
  actions?: string[]
  secureToken?: string
  sourceBranchOperator?: string
  sourceBranchValue?: string
  targetBranchOperator?: string
  targetBranchValue?: string
  tagConditionOperator?: string
  tagConditionValue?: string
  headerConditions?: AddConditionInterface[]
  payloadConditions?: AddConditionInterface[]
}

export interface FlatValidScheduleFormikValuesInterface {
  name: string
  identifier: string
  description?: string
  tags?: {
    [key: string]: string
  }
  target?: string
  targetIdentifier?: string
  pipeline: NgPipeline
  sourceRepo: GetActionsListQueryParams['sourceRepo']
  triggerType: NGTriggerSource['type']
  expression: string
}

export const TriggerTypes = {
  WEBHOOK: 'Webhook',
  NEW_ARTIFACT: 'NewArtifact',
  SCHEDULE: 'Scheduled'
}

interface TriggerTypeSourceInterface {
  triggerType: NGTriggerSource['type']
  sourceRepo?: GetActionsListQueryParams['sourceRepo']
}

export const PayloadConditionTypes = {
  TARGET_BRANCH: 'targetBranch',
  SOURCE_BRANCH: 'sourceBranch',
  TAG: 'tag'
}
export const ResponseStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  ERROR: 'ERROR'
}

const getTriggerTitle = ({
  triggerType,
  triggerName,
  getString
}: {
  triggerType: NGTriggerSource['type']
  triggerName?: string
  getString: (key: string) => string
}): string => {
  if (triggerName) {
    return `Trigger: ${triggerName}`
  } else if (triggerType === TriggerTypes.WEBHOOK) {
    return getString('pipeline-triggers.onNewWebhookTitle')
  } else if (triggerType === TriggerTypes.NEW_ARTIFACT) {
    return getString('pipeline-triggers.onNewArtifactTitle')
  } else if (triggerType === TriggerTypes.SCHEDULE) {
    return getString('pipeline-triggers.onNewScheduleTitle')
  }
  return ''
}

interface TriggerConfigDTO extends Omit<NGTriggerConfig, 'identifier'> {
  identifier?: string
}

// todo: revisit to see how to require identifier w/o type issue
export const clearNullUndefined = /* istanbul ignore next */ (data: TriggerConfigDTO): TriggerConfigDTO =>
  omitBy(omitBy(data, isUndefined), isNull)

export const getQueryParamsOnNew = (searchStr: string): TriggerTypeSourceInterface => {
  const triggerTypeParam = 'triggerType='
  const sourceRepoParam = '&sourceRepo='
  const triggerType = searchStr.replace(`?${triggerTypeParam}`, '')
  if (triggerType.includes(TriggerTypes.WEBHOOK)) {
    return {
      triggerType: (searchStr.substring(
        searchStr.lastIndexOf(triggerTypeParam) + triggerTypeParam.length,
        searchStr.lastIndexOf(sourceRepoParam)
      ) as unknown) as NGTriggerSource['type'],
      sourceRepo: (searchStr.substring(
        searchStr.lastIndexOf(sourceRepoParam) + sourceRepoParam.length
      ) as unknown) as GetActionsListQueryParams['sourceRepo']
    }
  } else {
    // SCHEDULED | unfound page
    return {
      triggerType: (triggerType as unknown) as NGTriggerSource['type']
    }
  }
}

export const isUndefinedOrEmptyString = (str: string | undefined): boolean => isUndefined(str) || str?.trim() === ''

const isRowUnfilled = (payloadCondition: AddConditionInterface): boolean => {
  const truthyValuesLength = Object.values(payloadCondition).filter(val => isUndefinedOrEmptyString(val?.trim?.()))
    ?.length
  return truthyValuesLength > 0 && truthyValuesLength < 3
}

const checkValidTriggerConfiguration = (formikValues: FlatValidWebhookFormikValuesInterface): boolean => {
  const sourceRepo = formikValues['sourceRepo']
  const connectorURLType = formikValues.connectorRef?.connector?.spec?.type

  if (sourceRepo !== CUSTOM) {
    if (!formikValues['connectorRef'] || !formikValues['event'] || !formikValues['actions']) return false
    // onEdit case, waiting for api response
    else if (formikValues['connectorRef']?.value && !formikValues['connectorRef'].connector) return true
    else if (
      !connectorURLType ||
      !!(connectorURLType === connectorUrlType.ACCOUNT && !formikValues.repoName) ||
      (connectorURLType === connectorUrlType.REPO && formikValues.repoName)
    )
      return false
  }
  return true
}

const checkValidPayloadConditions = (formikValues: FlatValidWebhookFormikValuesInterface): boolean => {
  const payloadConditions = formikValues['payloadConditions']
  const headerConditions = formikValues['headerConditions']
  if (
    (formikValues['sourceBranchOperator'] && !formikValues['sourceBranchValue']) ||
    (!formikValues['sourceBranchOperator'] && formikValues['sourceBranchValue']?.trim()) ||
    (formikValues['targetBranchOperator'] && !formikValues['targetBranchValue']) ||
    (!formikValues['targetBranchOperator'] && formikValues['targetBranchValue']?.trim()) ||
    (formikValues['tagConditionOperator'] && !formikValues['tagConditionValue']) ||
    (!formikValues['tagConditionOperator'] && formikValues['tagConditionValue']?.trim()) ||
    (payloadConditions?.length &&
      payloadConditions.some((payloadCondition: AddConditionInterface) => isRowUnfilled(payloadCondition)))
  ) {
    return false
  } else if (
    headerConditions?.length &&
    headerConditions.some((headerCondition: AddConditionInterface) => isRowUnfilled(headerCondition))
  ) {
    return false
  }
  return true
}

const checkValidCronExpression = (formikValues: FlatValidScheduleFormikValuesInterface): boolean =>
  isCronValid(formikValues?.expression || '')

const getPanels = ({
  triggerType,
  getString
}: {
  triggerType: NGTriggerSource['type']
  getString: (key: string) => string
}): PanelInterface[] | [] => {
  if (triggerType === TriggerTypes.WEBHOOK) {
    return [
      {
        id: 'Trigger Configuration',
        tabTitle: getString('pipeline-triggers.triggerConfigurationLabel'),
        requiredFields: ['name', 'identifier'], // conditional required validations checkValidTriggerConfiguration
        checkValidPanel: checkValidTriggerConfiguration
      },
      {
        id: 'Conditions',
        tabTitle: getString('conditions'),
        checkValidPanel: checkValidPayloadConditions
      },
      {
        id: 'Pipeline Input',
        tabTitle: getString('pipeline-triggers.pipelineInputLabel')
        // require all fields for input set and have preflight check handled on backend
      }
    ]
  } else if (triggerType === TriggerTypes.SCHEDULE) {
    return [
      {
        id: 'Trigger Overview',
        tabTitle: getString('pipeline-triggers.triggerOverviewPanel.title'),
        requiredFields: ['name', 'identifier'] // conditional required validations checkValidTriggerConfiguration
      },
      {
        id: 'Schedule',
        tabTitle: getString('pipeline-triggers.schedulePanel.title'),
        checkValidPanel: checkValidCronExpression,
        requiredFields: ['expression']
      },
      {
        id: 'Pipeline Input',
        tabTitle: getString('pipeline-triggers.pipelineInputLabel')
        // require all fields for input set and have preflight check handled on backend
      }
    ]
  }
  return []
}
export const getWizardMap = ({
  triggerType,
  getString,
  triggerName
}: {
  triggerType: NGTriggerSource['type']
  triggerName?: string
  getString: (key: string) => string
}): { wizardLabel: string; panels: PanelInterface[] } => ({
  wizardLabel: getTriggerTitle({
    triggerType,
    getString,
    triggerName
  }),
  panels: getPanels({ triggerType, getString })
})

// requiredFields and checkValidPanel in getPanels() above to render warning icons related to this schema
export const getValidationSchema = (
  triggerType: NGTriggerSource['type'],
  getString: (key: string) => string
): ObjectSchema<object | undefined> => {
  if (triggerType === TriggerTypes.WEBHOOK) {
    return object().shape({
      name: string().trim().required(getString('pipeline-triggers.validation.triggerName')),
      identifier: string().trim().required(getString('pipeline-triggers.validation.identifier')),
      event: string().test(
        getString('pipeline-triggers.validation.event'),
        getString('pipeline-triggers.validation.event'),
        function (event) {
          return this.parent.sourceRepo === CUSTOM || event
        }
      ),
      connectorRef: object().test(
        getString('pipeline-triggers.validation.connector'),
        getString('pipeline-triggers.validation.connector'),
        function (connectorRef) {
          return this.parent.sourceRepo === CUSTOM || connectorRef?.value
        }
      ),
      repoName: string().test(
        getString('pipeline-triggers.validation.repoName'),
        getString('pipeline-triggers.validation.repoName'),
        function (repoName) {
          const connectorURLType = this.parent.connectorRef?.connector?.spec?.type
          return (
            !connectorURLType ||
            (connectorURLType === connectorUrlType.ACCOUNT && repoName?.trim()) ||
            (connectorURLType === connectorUrlType.REGION && repoName?.trim()) ||
            connectorURLType === connectorUrlType.REPO
          )
        }
      ),
      actions: array().test(
        getString('pipeline-triggers.validation.actions'),
        getString('pipeline-triggers.validation.actions'),
        function (actions) {
          return this.parent.sourceRepo === CUSTOM || !isUndefined(actions)
        }
      ),
      sourceBranchOperator: string().test(
        getString('pipeline-triggers.validation.operator'),
        getString('pipeline-triggers.validation.operator'),
        function (operator) {
          return (
            // both filled or both empty. Return false to show error
            (operator && !this.parent.sourceBranchValue) ||
            (operator && this.parent.sourceBranchValue) ||
            (!this.parent.sourceBranchValue?.trim() && !operator)
          )
        }
      ),
      sourceBranchValue: string().test(
        getString('pipeline-triggers.validation.matchesValue'),
        getString('pipeline-triggers.validation.matchesValue'),
        function (matchesValue) {
          return (
            (matchesValue && !this.parent.sourceBranchOperator) ||
            (matchesValue && this.parent.sourceBranchOperator) ||
            (!matchesValue?.trim() && !this.parent.sourceBranchOperator)
          )
        }
      ),
      targetBranchOperator: string().test(
        getString('pipeline-triggers.validation.operator'),
        getString('pipeline-triggers.validation.operator'),
        function (operator) {
          return (
            (operator && !this.parent.targetBranchValue) ||
            (operator && this.parent.targetBranchValue) ||
            (!this.parent.targetBranchValue?.trim() && !operator)
          )
        }
      ),
      targetBranchValue: string().test(
        getString('pipeline-triggers.validation.matchesValue'),
        getString('pipeline-triggers.validation.matchesValue'),
        function (matchesValue) {
          return (
            (matchesValue && !this.parent.targetBranchOperator) ||
            (matchesValue && this.parent.targetBranchOperator) ||
            (!matchesValue?.trim() && !this.parent.targetBranchOperator)
          )
        }
      ),
      tagConditionOperator: string().test(
        getString('pipeline-triggers.validation.operator'),
        getString('pipeline-triggers.validation.operator'),
        function (operator) {
          return (
            (operator && !this.parent.tagConditionValue) ||
            (operator && this.parent.tagConditionValue) ||
            (!this.parent.tagConditionValue?.trim() && !operator)
          )
        }
      ),
      tagConditionValue: string().test(
        getString('pipeline-triggers.validation.matchesValue'),
        getString('pipeline-triggers.validation.matchesValue'),
        function (matchesValue) {
          return (
            (matchesValue && !this.parent.tagConditionOperator) ||
            (matchesValue && this.parent.tagConditionOperator) ||
            (!matchesValue?.trim() && !this.parent.tagConditionOperator)
          )
        }
      ),
      payloadConditions: array().test(
        getString('pipeline-triggers.validation.payloadConditions'),
        getString('pipeline-triggers.validation.payloadConditions'),
        function (payloadConditions = []) {
          if (payloadConditions.some((payloadCondition: AddConditionInterface) => isRowUnfilled(payloadCondition))) {
            return false
          }
          return true
        }
      ),
      headerConditions: array().test(
        getString('pipeline-triggers.validation.headerConditions'),
        getString('pipeline-triggers.validation.headerConditions'),
        function (headerConditions = []) {
          if (headerConditions.some((headerCondition: AddConditionInterface) => isRowUnfilled(headerCondition))) {
            return false
          }
          return true
        }
      )
    })
  } else {
    // Scheduled
    return object().shape({
      name: string().trim().required(getString('pipeline-triggers.validation.triggerName')),
      identifier: string().trim().required(getString('pipeline-triggers.validation.identifier')),
      expression: string().test(
        getString('pipeline-triggers.validation.cronExpression'),
        getString('pipeline-triggers.validation.cronExpression'),
        function (expression) {
          return isCronValid(expression || '')
        }
      )
    })
  }
}

export const eventTypes = {
  PUSH: 'Push',
  BRANCH: 'Branch',
  TAG: 'Tag'
}

export const scheduledTypes = {
  CRON: 'Cron'
}
