import { isNull, isUndefined, omitBy, isEmpty, get, set } from 'lodash-es'
import { string, array, object, ObjectSchema } from 'yup'
import type { SelectOption } from '@wings-software/uicore'
import type { PipelineInfoConfig, ConnectorInfoDTO, ConnectorResponse, ManifestConfigWrapper } from 'services/cd-ng'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { GetActionsListQueryParams, NGTriggerConfigV2, NGTriggerSourceV2 } from 'services/pipeline-ng'
import { connectorUrlType } from '@connectors/constants'
import type { PanelInterface } from '@common/components/Wizard/Wizard'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import { isCronValid } from '../views/subviews/ScheduleUtils'
import type { AddConditionInterface } from '../views/AddConditionsSection'

export const CUSTOM = 'Custom'
export const AWS_CODECOMMIT = 'AWS_CODECOMMIT'
export const AwsCodeCommit = 'AwsCodeCommit'

export interface ConnectorRefInterface {
  identifier?: string
  repoName?: string
  value?: string
  connector?: ConnectorInfoDTO
  label?: string
  live?: boolean
}

export interface FlatInitialValuesInterface {
  triggerType: NGTriggerSourceV2['type']
  identifier?: string
  tags?: {
    [key: string]: string
  }
  pipeline?: string | PipelineInfoConfig
  originalPipeline?: PipelineInfoConfig
  inputSetTemplateYamlObj?: {
    pipeline: PipelineInfoConfig | Record<string, never>
  }
  name?: string
  // WEBHOOK-SPECIFIC
  sourceRepo?: string
  connectorRef?: ConnectorRefInterface
  // SCHEDULE-SPECIFIC
  selectedScheduleTab?: string
}

export interface FlatOnEditValuesInterface {
  name: string
  identifier: string
  // targetIdentifier: string
  description?: string
  tags?: {
    [key: string]: string
  }
  pipeline: PipelineInfoConfig
  triggerType: NGTriggerSourceV2['type']
  manifestType?: string
  originalPipeline?: PipelineInfoConfig
  // WEBHOOK-SPECIFIC
  sourceRepo?: GetActionsListQueryParams['sourceRepo']
  connectorRef?: ConnectorRefInterface
  connectorIdentifier?: string
  repoName?: string
  repoUrl?: string
  autoAbortPreviousExecutions?: boolean
  event?: string
  actions?: string[]
  anyAction?: boolean // required for onEdit to show checked
  secureToken?: string
  sourceBranchOperator?: string
  sourceBranchValue?: string
  targetBranchOperator?: string
  targetBranchValue?: string
  changedFilesOperator?: string
  changedFilesValue?: string
  tagConditionOperator?: string
  tagConditionValue?: string
  headerConditions?: AddConditionInterface[]
  payloadConditions?: AddConditionInterface[]
  jexlCondition?: string
  // SCHEDULE-SPECIFIC
  selectedScheduleTab?: string
  minutes?: string
  expression?: string
  // ARTIFACT/MANIFEST-SPECIFIC
  selectedArtifact?: any
  stageId?: string
  inputSetTemplateYamlObj?: {
    pipeline: PipelineInfoConfig | Record<string, never>
  }
  eventConditions?: AddConditionInterface[]
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
  pipeline: PipelineInfoConfig
  sourceRepo: string
  triggerType: NGTriggerSourceV2['type']
  repoName?: string
  connectorRef?: { connector: { spec: { type: string } }; value: string } // get from dto interface when available
  autoAbortPreviousExecutions: boolean
  event?: string
  actions?: string[]
  secureToken?: string
  sourceBranchOperator?: string
  sourceBranchValue?: string
  targetBranchOperator?: string
  targetBranchValue?: string
  changedFilesOperator?: string
  changedFilesValue?: string
  tagConditionOperator?: string
  tagConditionValue?: string
  headerConditions?: AddConditionInterface[]
  payloadConditions?: AddConditionInterface[]
  jexlCondition?: string
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
  pipeline: PipelineInfoConfig
  sourceRepo: string
  triggerType: NGTriggerSourceV2['type']
  expression: string
}

export interface FlatValidArtifactFormikValuesInterface {
  name: string
  identifier: string
  description?: string
  tags?: {
    [key: string]: string
  }
  triggerType: NGTriggerSourceV2['type']
  selectedArtifact: any
  stageId: string
}

export const TriggerTypes = {
  WEBHOOK: 'Webhook',
  NEW_ARTIFACT: 'NewArtifact',
  SCHEDULE: 'Scheduled',
  MANIFEST: 'Manifest',
  ARTIFACT: 'Artifact'
}

export const isArtifactOrManifestTrigger = (triggerType?: string): boolean =>
  triggerType === TriggerTypes.MANIFEST || triggerType === TriggerTypes.ARTIFACT

interface TriggerTypeSourceInterface {
  triggerType: NGTriggerSourceV2['type']
  sourceRepo?: string
  manifestType?: string
  artifactType?: string
}

export const PayloadConditionTypes = {
  TARGET_BRANCH: 'targetBranch',
  SOURCE_BRANCH: 'sourceBranch',
  CHANGED_FILES: 'changedFiles',
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
  triggerType: NGTriggerSourceV2['type']
  triggerName?: string
  getString: UseStringsReturn['getString']
}): string => {
  if (triggerName) {
    return `Trigger: ${triggerName}`
  } else if (triggerType === TriggerTypes.WEBHOOK) {
    return getString('pipeline.triggers.onNewWebhookTitle')
  } else if (triggerType === TriggerTypes.ARTIFACT) {
    return getString('pipeline.triggers.onNewArtifactTitle', {
      artifact: getString('pipeline.triggers.artifactTriggerConfigPanel.artifact')
    })
  } else if (triggerType === TriggerTypes.MANIFEST) {
    return getString('pipeline.triggers.onNewArtifactTitle', {
      artifact: getString('manifestsText')
    })
  } else if (triggerType === TriggerTypes.SCHEDULE) {
    return getString('pipeline.triggers.onNewScheduleTitle')
  }
  return ''
}

export interface TriggerConfigDTO extends Omit<NGTriggerConfigV2, 'identifier'> {
  identifier?: string
}

// todo: revisit to see how to require identifier w/o type issue
export const clearNullUndefined = /* istanbul ignore next */ (data: TriggerConfigDTO): TriggerConfigDTO =>
  omitBy(omitBy(data, isUndefined), isNull)

export const clearRuntimeInputValue = (template: PipelineInfoConfig): PipelineInfoConfig => {
  return JSON.parse(
    JSON.stringify(template || {}).replace(/"<\+input>.?(?:allowedValues\((.*?)\)|regex\((.*?)\))?"/g, '""')
  )
}

export const getQueryParamsOnNew = (searchStr: string): TriggerTypeSourceInterface => {
  const triggerTypeParam = 'triggerType='
  const triggerType = searchStr.replace(`?${triggerTypeParam}`, '')

  if (triggerType.includes(TriggerTypes.WEBHOOK)) {
    const sourceRepoParam = '&sourceRepo='
    const sourceRepo = searchStr.substring(
      searchStr.lastIndexOf(sourceRepoParam) + sourceRepoParam.length
    ) as unknown as string
    return {
      triggerType: searchStr.substring(
        searchStr.lastIndexOf(triggerTypeParam) + triggerTypeParam.length,
        searchStr.lastIndexOf(sourceRepoParam)
      ) as unknown as NGTriggerSourceV2['type'],
      sourceRepo
    }
  } else if (triggerType.includes(TriggerTypes.ARTIFACT)) {
    const artifactTypeParam = '&artifactType='
    const artifactType = searchStr.substring(
      searchStr.lastIndexOf(artifactTypeParam) + artifactTypeParam.length
    ) as unknown as string
    return {
      triggerType: searchStr.substring(
        searchStr.lastIndexOf(triggerTypeParam) + triggerTypeParam.length,
        searchStr.lastIndexOf(artifactTypeParam)
      ) as unknown as NGTriggerSourceV2['type'],
      artifactType
    }
  } else if (triggerType.includes(TriggerTypes.MANIFEST)) {
    const manifestTypeParam = '&manifestType='
    const manifestType = searchStr.substring(
      searchStr.lastIndexOf(manifestTypeParam) + manifestTypeParam.length
    ) as unknown as string
    return {
      triggerType: searchStr.substring(
        searchStr.lastIndexOf(triggerTypeParam) + triggerTypeParam.length,
        searchStr.lastIndexOf(manifestTypeParam)
      ) as unknown as NGTriggerSourceV2['type'],
      manifestType
    }
  } else {
    // SCHEDULED | unfound page
    return {
      triggerType: triggerType as unknown as NGTriggerSourceV2['type']
    }
  }
}

export const isUndefinedOrEmptyString = (str: string | undefined): boolean => isUndefined(str) || str?.trim() === ''

const isRowUnfilled = (payloadCondition: AddConditionInterface): boolean => {
  const truthyValuesLength = Object.values(payloadCondition).filter(val =>
    isUndefinedOrEmptyString(val?.trim?.())
  )?.length
  return truthyValuesLength > 0 && truthyValuesLength < 3
}

export const isRowFilled = (payloadCondition: AddConditionInterface): boolean => {
  const truthyValuesLength = Object.values(payloadCondition).filter(val => val?.trim?.())?.length
  return truthyValuesLength === 3
}

const isIdentifierIllegal = (identifier: string): boolean =>
  regexIdentifier.test(identifier) && illegalIdentifiers.includes(identifier)

const checkValidTriggerConfiguration = (formikValues: FlatValidWebhookFormikValuesInterface): boolean => {
  const sourceRepo = formikValues['sourceRepo']
  const identifier = formikValues['identifier']
  const connectorURLType = formikValues.connectorRef?.connector?.spec?.type

  if (isIdentifierIllegal(identifier)) {
    return false
  }

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
    (formikValues['changedFilesOperator'] && !formikValues['changedFilesValue']) ||
    (!formikValues['changedFilesOperator'] && formikValues['changedFilesValue']?.trim()) ||
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

const checkValidPayloadConditionsForNewArtifact = (formikValues: FlatValidWebhookFormikValuesInterface): boolean => {
  const headerConditions = formikValues['headerConditions']
  if (
    headerConditions?.length &&
    headerConditions.some((headerCondition: AddConditionInterface) => isRowUnfilled(headerCondition))
  ) {
    return false
  }
  return true
}

const checkValidOverview = (formikValues: FlatValidScheduleFormikValuesInterface): boolean =>
  isIdentifierIllegal(formikValues?.identifier) ? false : true

const checkValidCronExpression = (formikValues: FlatValidScheduleFormikValuesInterface): boolean =>
  isCronValid(formikValues?.expression || '')

const getPanels = ({
  triggerType,
  getString
}: {
  triggerType: NGTriggerSourceV2['type']
  getString: (key: StringKeys) => string
}): PanelInterface[] | [] => {
  if (triggerType === TriggerTypes.WEBHOOK) {
    return [
      {
        id: 'Trigger Configuration',
        tabTitle: getString('pipeline.triggers.triggerConfigurationLabel'),
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
        tabTitle: getString('pipeline.triggers.pipelineInputLabel')
        // require all fields for input set and have preflight check handled on backend
      }
    ]
  } else if (triggerType === TriggerTypes.SCHEDULE) {
    return [
      {
        id: 'Trigger Overview',
        tabTitle: getString('pipeline.triggers.triggerOverviewPanel.title'),
        checkValidPanel: checkValidOverview,
        requiredFields: ['name', 'identifier'] // conditional required validations checkValidTriggerConfiguration
      },
      {
        id: 'Schedule',
        tabTitle: getString('pipeline.triggers.schedulePanel.title'),
        checkValidPanel: checkValidCronExpression,
        requiredFields: ['expression']
      },
      {
        id: 'Pipeline Input',
        tabTitle: getString('pipeline.triggers.pipelineInputLabel')
        // require all fields for input set and have preflight check handled on backend
      }
    ]
  } else if (isArtifactOrManifestTrigger(triggerType)) {
    return [
      {
        id: 'Trigger Overview',
        tabTitle: getString('pipeline.triggers.triggerConfigurationLabel'),
        checkValidPanel: checkValidOverview,
        requiredFields: ['name', 'identifier'] // conditional required validations checkValidTriggerConfiguration
      },
      {
        id: 'Conditions',
        tabTitle: getString('conditions'),
        checkValidPanel: checkValidPayloadConditionsForNewArtifact
      },
      {
        id: 'Pipeline Input',
        tabTitle: getString('pipeline.triggers.pipelineInputLabel')
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
  triggerType: NGTriggerSourceV2['type']
  triggerName?: string
  getString: UseStringsReturn['getString']
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
  triggerType: NGTriggerSourceV2['type'],
  getString: (key: StringKeys) => string
): ObjectSchema<Record<string, any> | undefined> => {
  if (triggerType === TriggerTypes.WEBHOOK) {
    return object().shape({
      name: NameSchema({ requiredErrorMsg: getString('pipeline.triggers.validation.triggerName') }),
      identifier: IdentifierSchema(),
      event: string().test(
        getString('pipeline.triggers.validation.event'),
        getString('pipeline.triggers.validation.event'),
        function (event) {
          return this.parent.sourceRepo === CUSTOM || event
        }
      ),
      connectorRef: object().test(
        getString('pipeline.triggers.validation.connector'),
        getString('pipeline.triggers.validation.connector'),
        function (connectorRef) {
          return this.parent.sourceRepo === CUSTOM || connectorRef?.value
        }
      ),
      repoName: string()
        .nullable()
        .test(
          getString('pipeline.triggers.validation.repoName'),
          getString('pipeline.triggers.validation.repoName'),
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
        getString('pipeline.triggers.validation.actions'),
        getString('pipeline.triggers.validation.actions'),
        function (actions) {
          return this.parent.sourceRepo === CUSTOM || !isUndefined(actions) || this.parent.event === eventTypes.PUSH
        }
      ),
      sourceBranchOperator: string().test(
        getString('pipeline.triggers.validation.operator'),
        getString('pipeline.triggers.validation.operator'),
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
        getString('pipeline.triggers.validation.matchesValue'),
        getString('pipeline.triggers.validation.matchesValue'),
        function (matchesValue) {
          return (
            (matchesValue && !this.parent.sourceBranchOperator) ||
            (matchesValue && this.parent.sourceBranchOperator) ||
            (!matchesValue?.trim() && !this.parent.sourceBranchOperator)
          )
        }
      ),
      targetBranchOperator: string().test(
        getString('pipeline.triggers.validation.operator'),
        getString('pipeline.triggers.validation.operator'),
        function (operator) {
          return (
            (operator && !this.parent.targetBranchValue) ||
            (operator && this.parent.targetBranchValue) ||
            (!this.parent.targetBranchValue?.trim() && !operator)
          )
        }
      ),
      targetBranchValue: string().test(
        getString('pipeline.triggers.validation.matchesValue'),
        getString('pipeline.triggers.validation.matchesValue'),
        function (matchesValue) {
          return (
            (matchesValue && !this.parent.targetBranchOperator) ||
            (matchesValue && this.parent.targetBranchOperator) ||
            (!matchesValue?.trim() && !this.parent.targetBranchOperator)
          )
        }
      ),
      changedFilesOperator: string().test(
        getString('pipeline.triggers.validation.operator'),
        getString('pipeline.triggers.validation.operator'),
        function (operator) {
          return (
            (operator && !this.parent.changedFilesValue) ||
            (operator && this.parent.changedFilesValue) ||
            (!this.parent.changedFilesValue?.trim() && !operator)
          )
        }
      ),
      changedFilesValue: string().test(
        getString('pipeline.triggers.validation.matchesValue'),
        getString('pipeline.triggers.validation.matchesValue'),
        function (matchesValue) {
          return (
            (matchesValue && !this.parent.changedFilesOperator) ||
            (matchesValue && this.parent.changedFilesOperator) ||
            (!matchesValue?.trim() && !this.parent.changedFilesOperator)
          )
        }
      ),
      tagConditionOperator: string().test(
        getString('pipeline.triggers.validation.operator'),
        getString('pipeline.triggers.validation.operator'),
        function (operator) {
          return (
            (operator && !this.parent.tagConditionValue) ||
            (operator && this.parent.tagConditionValue) ||
            (!this.parent.tagConditionValue?.trim() && !operator)
          )
        }
      ),
      tagConditionValue: string().test(
        getString('pipeline.triggers.validation.matchesValue'),
        getString('pipeline.triggers.validation.matchesValue'),
        function (matchesValue) {
          return (
            (matchesValue && !this.parent.tagConditionOperator) ||
            (matchesValue && this.parent.tagConditionOperator) ||
            (!matchesValue?.trim() && !this.parent.tagConditionOperator)
          )
        }
      ),
      payloadConditions: array().test(
        getString('pipeline.triggers.validation.payloadConditions'),
        getString('pipeline.triggers.validation.payloadConditions'),
        function (payloadConditions = []) {
          if (payloadConditions.some((payloadCondition: AddConditionInterface) => isRowUnfilled(payloadCondition))) {
            return false
          }
          return true
        }
      ),
      headerConditions: array().test(
        getString('pipeline.triggers.validation.headerConditions'),
        getString('pipeline.triggers.validation.headerConditions'),
        function (headerConditions = []) {
          if (headerConditions.some((headerCondition: AddConditionInterface) => isRowUnfilled(headerCondition))) {
            return false
          }
          return true
        }
      )
    })
  } else if (isArtifactOrManifestTrigger(triggerType)) {
    return object().shape({
      name: string().trim().required(getString('pipeline.triggers.validation.triggerName')),
      identifier: string().when('name', {
        is: val => val?.length,
        then: string()
          .required(getString('validation.identifierRequired'))
          .matches(regexIdentifier, getString('validation.validIdRegex'))
          .notOneOf(illegalIdentifiers)
      }),
      headerConditions: array().test(
        getString('pipeline.triggers.validation.headerConditions'),
        getString('pipeline.triggers.validation.headerConditions'),
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
      name: string().trim().required(getString('pipeline.triggers.validation.triggerName')),
      identifier: string().when('name', {
        is: val => val?.length,
        then: string()
          .required(getString('validation.identifierRequired'))
          .matches(regexIdentifier, getString('validation.validIdRegex'))
          .notOneOf(illegalIdentifiers)
      }),
      expression: string().test(
        getString('pipeline.triggers.validation.cronExpression'),
        getString('pipeline.triggers.validation.cronExpression'),
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
  TAG: 'Tag',
  PULL_REQUEST: 'PullRequest',
  MERGE_REQUEST: 'MergeRequest',
  ISSUE_COMMENT: 'IssueComment'
}

export const getEventLabelMap = (event: string) => {
  // add space between camelcase-separated words
  if (event === eventTypes.PULL_REQUEST) {
    return 'Pull Request'
  } else if (event === eventTypes.MERGE_REQUEST) {
    return 'Merge Request'
  } else if (event === eventTypes.ISSUE_COMMENT) {
    return 'Issue Comment'
  }
  return event
}

export const autoAbortPreviousExecutionsTypes = [
  eventTypes.PUSH,
  eventTypes.PULL_REQUEST,
  eventTypes.ISSUE_COMMENT,
  eventTypes.MERGE_REQUEST
]

export const getAutoAbortDescription = ({
  event,
  getString
}: {
  event: string
  getString: (key: StringKeys) => string
}): string => {
  if (event === eventTypes.PUSH) {
    return getString('pipeline.triggers.triggerConfigurationPanel.autoAbortPush')
  } else if (event === eventTypes.PULL_REQUEST || event === eventTypes.MERGE_REQUEST) {
    return getString('pipeline.triggers.triggerConfigurationPanel.autoAbortPR')
  } else if (event === eventTypes.ISSUE_COMMENT) {
    return getString('pipeline.triggers.triggerConfigurationPanel.autoAbortIssueComment')
  }
  return ''
}

export const scheduledTypes = {
  CRON: 'Cron'
}

export const isPipelineWithCiCodebase = (pipeline: any): boolean =>
  Object.keys(pipeline?.properties?.ci?.codebase || {}).includes('build')

export const ciCodebaseBuild = {
  type: 'branch',
  spec: {
    branch: '<+trigger.branch>'
  }
}

export const getConnectorName = (connector?: ConnectorResponse): string =>
  `${
    connector?.connector?.orgIdentifier && connector?.connector?.projectIdentifier
      ? `${connector?.connector?.type}: ${connector?.connector?.name}`
      : connector?.connector?.orgIdentifier
      ? `${connector?.connector?.type}[Org]: ${connector?.connector?.name}`
      : `${connector?.connector?.type}[Account]: ${connector?.connector?.name}`
  }` || ''

export const getConnectorValue = (connector?: ConnectorResponse): string =>
  `${
    connector?.connector?.orgIdentifier && connector?.connector?.projectIdentifier
      ? connector?.connector?.identifier
      : connector?.connector?.orgIdentifier
      ? `${Scope.ORG}.${connector?.connector?.identifier}`
      : `${Scope.ACCOUNT}.${connector?.connector?.identifier}`
  }` || ''

export const getEventAndActions = ({
  data,
  sourceRepo
}: {
  data: {
    [key: string]: {
      [key: string]: string[]
    }
  }
  sourceRepo: string
}): { eventOptions: SelectOption[]; actionsOptionsMap: { [key: string]: string[] } } => {
  const filteredData = data?.[sourceRepo] || {}
  const eventOptions = Object.keys(filteredData).map(event => ({
    label: getEventLabelMap(event),
    value: event
  }))
  return { eventOptions, actionsOptionsMap: filteredData }
}

export const mockOperators = [
  { label: '', value: '' },
  { label: 'Equals', value: 'Equals' },
  { label: 'Not Equals', value: 'NotEquals' },
  { label: 'In', value: 'In' },
  { label: 'Not In', value: 'NotIn' },
  { label: 'Starts With', value: 'StartsWith' },
  { label: 'Ends With', value: 'EndsWith' },
  { label: 'Regex', value: 'Regex' }
]

export const inNotInArr = ['In', 'NotIn']
export const inNotInPlaceholder = 'value1, regex1'

export interface artifactManifestData {
  artifactRef: string
  name: string
  stageId: string
  artifactRepository: string
  location: string
  buildTag?: string
  version?: string
  spec?: any
  [key: string]: any
}
export const parseArtifactsManifests = ({
  inputSetTemplateYamlObj,
  manifestType,
  artifactType,
  artifactRef,
  stageId,
  isManifest
}: {
  inputSetTemplateYamlObj?: {
    pipeline: PipelineInfoConfig | Record<string, never>
  }
  artifactRef?: string
  stageId?: string
  isManifest: boolean
  artifactType?: string
  manifestType?: string
}): { appliedArtifact?: artifactManifestData; data?: artifactManifestData[] } => {
  if (inputSetTemplateYamlObj?.pipeline && isManifest) {
    let appliedArtifact
    const stagesManifests = inputSetTemplateYamlObj.pipeline.stages?.map((stageObj: any) => {
      const filteredManifests = stageObj?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests?.filter(
        (manifestObj: any) => manifestObj?.manifest?.type === manifestType
      )
      if (stageId && artifactRef) {
        const newAppliedArtifact = filteredManifests?.find(
          (manifestObj: any) => manifestObj?.manifest?.identifier === artifactRef
        )?.manifest
        if (newAppliedArtifact) {
          appliedArtifact = newAppliedArtifact
        }
      }

      if (filteredManifests?.length) {
        const filteredStageObj = { ...stageObj }
        filteredStageObj.stage.spec.serviceConfig.serviceDefinition.spec.manifests = filteredManifests
        return filteredStageObj
      }
    })

    return { appliedArtifact, data: stagesManifests?.filter((stage: Record<string, unknown>) => !isUndefined(stage)) }
  } else if (inputSetTemplateYamlObj?.pipeline && artifactType) {
    // todo
    return {}
  }
  return {}
}

export const filterArtifact = ({
  runtimeData,
  stageId,
  artifactId,
  isManifest
}: {
  runtimeData: any
  stageId: any
  artifactId: any
  isManifest: boolean
}): any => {
  const filteredStage = (runtimeData || []).find((item: any) => item?.stage?.identifier === stageId)
  if (isManifest) {
    return filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests.find(
      (manifestObj: any) => manifestObj?.manifest?.identifier === artifactId
    )
  } else {
    return filteredStage?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.artifacts.find(
      (artifactObj: any) => artifactObj?.artifact?.identifier === artifactId
    )
  }
}

export const getStageIdx = (runtimeData: any, stageId: any) => {
  return runtimeData.findIndex((item: any) => item.stage.identifier === stageId)
}

export const getTemplateObject = (manifest: any, artifacts: any) => {
  return {
    artifacts: artifacts,
    manifests: [manifest]
  }
}

export const getPathString = (runtimeData: any, stageId: any) => {
  const filteredStageIdx = getStageIdx(runtimeData, stageId)
  return `stages[${filteredStageIdx}].stage.spec.serviceConfig.serviceDefinition.spec`
}

const isRuntimeInput = (str: any): boolean => typeof str === 'string' && str?.includes('<+input>')
const getRuntimeInputLabel = ({ str, getString }: { str: any; getString?: (key: StringKeys) => string }): string =>
  isRuntimeInput(str) ? getString?.('pipeline.triggers.artifactTriggerConfigPanel.runtimeInput') : str
const getLocationAttribute = (type: string): string | undefined => {
  if (type === 'HelmChart') {
    return 'folderPath'
  }
}

export const getLocationFromPipeline = ({
  manifests,
  manifestIdentifier,
  manifestType
}: {
  manifests: ManifestConfigWrapper[]
  manifestIdentifier: string
  manifestType: string
}): string | undefined => {
  if (manifestType) {
    const locationAttribute = getLocationAttribute(manifestType)
    return manifests?.find((manifestObj: any) => manifestObj?.manifest.identifier === manifestIdentifier)?.manifest
      ?.spec?.store?.spec?.[`${locationAttribute}`]
  }
}

export const getConnectorNameFromPipeline = ({
  manifests,
  manifestIdentifier,
  manifestType
}: {
  manifests: ManifestConfigWrapper[]
  manifestIdentifier: string
  manifestType: string
}): string | undefined => {
  if (manifestType) {
    return manifests?.find((manifestObj: any) => manifestObj?.manifest.identifier === manifestIdentifier)?.manifest
      ?.spec?.store?.spec?.connectorRef
  }
}

export interface artifactTableItem {
  artifactId: string
  artifactLabel: string
  stageId: string
  artifactRepository: string
  location: string
  version?: string // for manifest
  buildTag?: string // for artifact
  disabled: boolean
  hasRuntimeInputs: boolean
}

export const TriggerDefaultFieldList = {
  chartVersion: '<+trigger.manifest.version>',
  build: '<+trigger.artifact.build'
}

export const replaceTriggerDefaultBuild = ({
  build,
  chartVersion
}: {
  build?: string
  chartVersion?: string
}): string => {
  if (chartVersion === '<+input>') {
    return TriggerDefaultFieldList.chartVersion
  } else if (build === '<+input>') {
    return TriggerDefaultFieldList.build
  }
  return build || chartVersion || ''
}
const getManifestTableItem = ({
  stageId,
  manifest,
  artifactRepository,
  location,
  getString
}: {
  stageId: string
  manifest: any
  artifactRepository?: string
  location?: string
  getString?: (key: StringKeys) => string
}): artifactTableItem => {
  const { identifier: artifactId } = manifest
  const manifestSpecObjectValues = Object.values(manifest?.spec || {})
  const storeSpecObjectValues = Object.values(manifest?.spec?.store?.spec || {})
  const hasRuntimeInputs =
    manifestSpecObjectValues.some(val => isRuntimeInput(val)) || storeSpecObjectValues.some(val => isRuntimeInput(val))

  return {
    artifactLabel: `${stageId}: ${artifactId}`, // required for sorting
    artifactId,
    stageId,
    location: getRuntimeInputLabel({ str: location, getString }),
    artifactRepository: getRuntimeInputLabel({
      str: artifactRepository || manifest?.spec?.store?.spec?.connectorRef,
      getString
    }),
    version: getRuntimeInputLabel({ str: manifest?.spec?.chartVersion, getString }),
    disabled:
      !manifest?.spec?.chartVersion ||
      getRuntimeInputLabel({ str: manifest?.spec?.chartVersion, getString }) !==
        getString?.('pipeline.triggers.artifactTriggerConfigPanel.runtimeInput'),
    hasRuntimeInputs
  }
}
// data is already filtered w/ correct manifest
export const getArtifactTableDataFromData = ({
  data,
  appliedArtifact,
  stageId,
  isManifest,
  getString,
  pipeline
}: {
  data?: any
  appliedArtifact?: any // get from BE
  stageId?: string
  isManifest: boolean
  getString?: (key: StringKeys) => string
  pipeline: PipelineInfoConfig | Record<string, never> | any
}): { appliedTableArtifact?: artifactTableItem[]; artifactTableData?: artifactTableItem[] } => {
  const artifactTableData: artifactTableItem[] = []

  if (appliedArtifact && stageId && isManifest) {
    const pipelineManifests = pipeline?.stages?.find((stageObj: any) => stageObj?.stage?.identifier === stageId)?.stage
      ?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests

    const location = getLocationFromPipeline({
      manifests: pipelineManifests,
      manifestIdentifier: appliedArtifact.identifier,
      manifestType: appliedArtifact.type
    })

    const artifactRepository = getConnectorNameFromPipeline({
      manifests: pipelineManifests,
      manifestIdentifier: appliedArtifact.identifier,
      manifestType: appliedArtifact.type
    })

    artifactTableData.push(
      getManifestTableItem({ stageId, manifest: appliedArtifact, artifactRepository, location, getString })
    )
    return { appliedTableArtifact: artifactTableData }
  } else if (isManifest) {
    data?.forEach((stageObject: any) => {
      const dataStageId = stageObject?.stage?.identifier
      // pipelineManifests used to find location from pipeline
      const pipelineManifests = pipeline?.stages?.find((stageObj: any) => stageObj?.stage?.identifier === dataStageId)
        ?.stage?.spec?.serviceConfig?.serviceDefinition?.spec?.manifests

      const { manifests = [] } = stageObject?.stage?.spec?.serviceConfig?.serviceDefinition?.spec || {}
      manifests.forEach((manifestObj: any) => {
        const location = getLocationFromPipeline({
          manifests: pipelineManifests,
          manifestIdentifier: manifestObj.manifest.identifier,
          manifestType: manifestObj.manifest.type
        })

        const artifactRepository = getConnectorNameFromPipeline({
          manifests: pipelineManifests,
          manifestIdentifier: manifestObj.manifest.identifier,
          manifestType: manifestObj.manifest.type
        })

        if (manifestObj?.manifest) {
          artifactTableData.push(
            getManifestTableItem({
              stageId: dataStageId,
              manifest: manifestObj.manifest,
              artifactRepository,
              location,
              getString
            })
          )
        }
      })
    })
    return { artifactTableData }
  }
  return {}
}

// purpose of the function is to get applied artifact
// and replace <+input> with values from selectedArtifact
export function getArtifactSpecObj({
  appliedArtifact,
  selectedArtifact,
  path = ''
}: {
  appliedArtifact: artifactManifestData
  selectedArtifact: artifactManifestData
  path: string
}): any {
  let newAppliedArtifactSpecObj: any = {}
  const appliedArtifactSpecEntries = path
    ? Object.entries({ ...appliedArtifact })
    : Object.entries({ ...appliedArtifact?.spec })
  appliedArtifactSpecEntries.forEach((entry: [key: string, val: any]) => {
    const [key, val] = entry
    const pathArr = `.spec${path}`.split('.').filter(p => !!p)
    const pathResult = get(selectedArtifact, pathArr)

    if (val && key && pathResult?.[key]) {
      newAppliedArtifactSpecObj[key] = pathResult[key]
    } else if (val && key && selectedArtifact?.spec?.[key]) {
      newAppliedArtifactSpecObj[key] = selectedArtifact.spec[key]
    } else if (typeof val === 'object') {
      const obj = getArtifactSpecObj({
        appliedArtifact: path ? appliedArtifact[key] : appliedArtifact.spec[key],
        selectedArtifact,
        path: `${path}.${key}`
      })

      if (!isEmpty(obj)) {
        if (!path) {
          newAppliedArtifactSpecObj = { ...newAppliedArtifactSpecObj, ...obj }
        } else {
          set(newAppliedArtifactSpecObj, `${path.substring(1)}.${key}`, obj)
        }
      }
    }
  })
  return newAppliedArtifactSpecObj
}
