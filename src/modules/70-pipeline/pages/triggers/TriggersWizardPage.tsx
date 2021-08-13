import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Layout, SelectOption, Heading, Text, Switch } from '@wings-software/uicore'
import { parse } from 'yaml'
import { isEmpty, isUndefined, merge, cloneDeep } from 'lodash-es'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { Page, useToaster } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import Wizard from '@common/components/Wizard/Wizard'
import { PageError } from '@common/components/Page/PageError'
import { connectorUrlType } from '@connectors/constants'
import routes from '@common/RouteDefinitions'
import {
  PipelineInfoConfig,
  useGetConnector,
  GetConnectorQueryParams,
  getConnectorListV2Promise,
  Failure
} from 'services/cd-ng'
import {
  useGetPipeline,
  useGetTemplateFromPipeline,
  useCreateTrigger,
  useGetTrigger,
  useUpdateTrigger,
  NGTriggerConfigV2,
  NGTriggerSourceV2,
  useGetSchemaYaml
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { clearRuntimeInput } from '@pipeline/components/PipelineStudio/StepUtil'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type {
  YamlBuilderHandlerBinding,
  YamlBuilderProps,
  InvocationMapFunction,
  CompletionItemInterface
} from '@common/interfaces/YAMLBuilderProps'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { scheduleTabsId, getDefaultExpressionBreakdownValues } from './views/subviews/ScheduleUtils'
import type { AddConditionInterface } from './views/AddConditionsSection'
import { GitSourceProviders } from './utils/TriggersListUtils'
import {
  eventTypes,
  isPipelineWithCiCodebase,
  ciCodebaseBuild,
  getConnectorName,
  getConnectorValue,
  isRowFilled,
  CUSTOM,
  isArtifactOrManifestTrigger,
  FlatValidArtifactFormikValuesInterface,
  clearRuntimeInputValue,
  replaceTriggerDefaultBuild,
  TriggerDefaultFieldList
} from './utils/TriggersWizardPageUtils'
import {
  ArtifactTriggerConfigPanel,
  WebhookTriggerConfigPanel,
  WebhookConditionsPanel,
  WebhookPipelineInputPanel,
  SchedulePanel,
  TriggerOverviewPanel
} from './views'
import ArtifactConditionsPanel from './views/ArtifactConditionsPanel'

import {
  clearNullUndefined,
  ConnectorRefInterface,
  FlatInitialValuesInterface,
  FlatOnEditValuesInterface,
  FlatValidWebhookFormikValuesInterface,
  FlatValidScheduleFormikValuesInterface,
  getQueryParamsOnNew,
  getWizardMap,
  PayloadConditionTypes,
  ResponseStatus,
  TriggerTypes,
  scheduledTypes,
  getValidationSchema,
  TriggerConfigDTO
} from './utils/TriggersWizardPageUtils'
import { resetScheduleObject, getBreakdownValues } from './views/subviews/ScheduleUtils'
import css from './TriggersWizardPage.module.scss'
const TriggersWizardPage: React.FC = (): JSX.Element => {
  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier, triggerIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      targetIdentifier: string
      triggerIdentifier: string
    }>
  >()
  const history = useHistory()
  const { location } = useHistory()
  const { getString } = useStrings()
  // use passed params on new trigger
  const queryParamsOnNew = location?.search ? getQueryParamsOnNew(location.search) : undefined
  const {
    sourceRepo: sourceRepoOnNew,
    triggerType: triggerTypeOnNew,
    manifestType,
    artifactType
  } = queryParamsOnNew || {}

  const { data: template } = useGetTemplateFromPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier }
  })

  const { data: triggerResponse, loading: loadingGetTrigger } = useGetTrigger({
    // const { data: triggerResponse, refetch: getTriggerDetails, loading: loadingGetTrigger } = useGetTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
    // lazy: true
  })

  const [connectorScopeParams, setConnectorScopeParams] = useState<GetConnectorQueryParams | undefined>(undefined)

  const { mutate: createTrigger, loading: createTriggerLoading } = useCreateTrigger({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: updateTrigger, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const [errorToasterMessage, setErrorToasterMessage] = useState<string>('')

  const { loading: loadingYamlSchema, data: triggerSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Triggers',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const convertFormikValuesToYaml = (values: any): { trigger: TriggerConfigDTO } | undefined => {
    if (values.triggerType === TriggerTypes.WEBHOOK) {
      const res = getWebhookTriggerYaml({ values, persistIncomplete: true })
      // remove invalid values
      if (res?.source?.spec?.spec && !res.source.spec.spec.actions) {
        delete res.source.spec.spec.actions
      }
      if (res?.source?.spec?.spec && !res.source.spec.spec.event) {
        delete res.source.spec.spec.event
      }

      return { trigger: res }
    } else if (values.triggerType === TriggerTypes.SCHEDULE) {
      const res = getScheduleTriggerYaml({ values })

      return { trigger: res }
    } else if (values.triggerType === TriggerTypes.MANIFEST) {
      const res = getArtifactTriggerYaml({ values, persistIncomplete: true })

      return { trigger: res }
    }
  }

  const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
    fileName: `${triggerResponse?.data?.identifier ?? 'Trigger'}.yaml`,
    entityType: 'Triggers',
    width: 'calc(100vw - 350px)',
    height: 'calc(100vh - 280px)',
    showSnippetSection: false,
    yamlSanityConfig: {
      removeEmptyString: false,
      removeEmptyObject: false,
      removeEmptyArray: false
    }
  }

  const [enabledStatus, setEnabledStatus] = useState<boolean>(true)
  const [getTriggerErrorMessage, setGetTriggerErrorMessage] = useState<string>('')
  const [currentPipeline, setCurrentPipeline] = useState<{ pipeline?: PipelineInfoConfig } | undefined>(undefined)
  const [wizardKey, setWizardKey] = useState<number>(0)
  const [artifactManifestType, setArtifactManifestType] = useState<string | undefined>(undefined)
  const [mergedPipelineKey, setMergedPipelineKey] = useState<number>(0)

  const [onEditInitialValues, setOnEditInitialValues] = useState<
    | FlatOnEditValuesInterface
    | {
        triggerType: NGTriggerSourceV2['type']
        pipeline?: PipelineInfoConfig | Record<string, never>
        originalPipeline?: PipelineInfoConfig
        identifier?: string
        connectorRef?: { identifier?: string; scope?: string }
        inputSetTemplateYamlObj?: {
          pipeline: PipelineInfoConfig | Record<string, never>
        }
      }
  >({ triggerType: triggerTypeOnNew })

  // useEffect(() => {
  //   // fetch initial onEdit
  //   if (!onEditInitialValues?.identifier && triggerIdentifier && !triggerResponse && !loadingGetTrigger) {
  //     getTriggerDetails()
  //   }
  // }, [onEditInitialValues?.triggerType])
  // // }, [onEditInitialValues?.triggerType])

  useEffect(() => {
    if (onEditInitialValues?.pipeline && template?.data?.inputSetTemplateYaml && mergedPipelineKey < 1) {
      const newOnEditPipeline = merge(
        parse(template?.data?.inputSetTemplateYaml || '')?.pipeline,
        onEditInitialValues.pipeline || {}
      )
      const newPipeline = clearRuntimeInput(newOnEditPipeline)
      setOnEditInitialValues({ ...onEditInitialValues, pipeline: newPipeline as unknown as PipelineInfoConfig })
      setCurrentPipeline({ pipeline: newPipeline }) // will reset initialValues
      setMergedPipelineKey(1)
    } else if (template?.data?.inputSetTemplateYaml) {
      setCurrentPipeline(
        merge(clearRuntimeInput(parse(template?.data?.inputSetTemplateYaml || '')), currentPipeline || {}) as {
          pipeline: PipelineInfoConfig
        }
      )
    }
  }, [template?.data?.inputSetTemplateYaml, onEditInitialValues?.pipeline])

  useEffect(() => {
    if (triggerResponse?.data?.enabled === false) {
      setEnabledStatus(false)
    }
  }, [triggerResponse?.data?.enabled])

  const { data: pipelineResponse } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const originalPipeline: PipelineInfoConfig | undefined = parse(
    (pipelineResponse?.data?.yamlPipeline as any) || ''
  )?.pipeline

  useEffect(() => {
    if (triggerResponse?.data?.yaml && triggerResponse.data.type === TriggerTypes.WEBHOOK) {
      const newOnEditInitialValues = getWebhookTriggerValues({
        triggerResponseYaml: triggerResponse.data.yaml
      })
      setOnEditInitialValues({ ...onEditInitialValues, ...newOnEditInitialValues })
    } else if (triggerResponse?.data?.yaml && triggerResponse.data.type === TriggerTypes.SCHEDULE) {
      const newOnEditInitialValues = getScheduleTriggerValues({
        triggerResponseYaml: triggerResponse.data.yaml
      })
      setOnEditInitialValues({ ...onEditInitialValues, ...newOnEditInitialValues })
    } else if (triggerResponse?.data?.yaml && triggerResponse.data.type === TriggerTypes.MANIFEST) {
      const newOnEditInitialValues = getArtifactTriggerValues({
        triggerResponseYaml: triggerResponse?.data?.yaml
      })
      setOnEditInitialValues({ ...onEditInitialValues, ...newOnEditInitialValues })
    }
  }, [triggerIdentifier, triggerResponse, template])

  const returnToTriggersPage = (): void => {
    history.push(
      routes.toTriggersPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module
      })
    )
  }
  const { showSuccess } = useToaster()

  const getWebhookTriggerYaml = ({
    values: val,
    persistIncomplete = false
  }: {
    values: FlatValidWebhookFormikValuesInterface
    persistIncomplete?: boolean
  }): TriggerConfigDTO => {
    const {
      name = '',
      identifier,
      description = '',
      tags,
      pipeline: pipelineRuntimeInput,
      sourceRepo: formikValueSourceRepo,
      triggerType: formikValueTriggerType,
      repoName,
      connectorRef,
      event = '',
      actions,
      sourceBranchOperator,
      sourceBranchValue,
      targetBranchOperator,
      targetBranchValue,
      changedFilesOperator,
      changedFilesValue,
      tagConditionOperator,
      tagConditionValue,
      headerConditions = [],
      payloadConditions = [],
      jexlCondition,
      secureToken,
      autoAbortPreviousExecutions = false
    } = val

    const stringifyPipelineRuntimeInput = yamlStringify({ pipeline: clearNullUndefined(pipelineRuntimeInput) })

    if (formikValueSourceRepo !== GitSourceProviders.CUSTOM.value) {
      if (
        ((targetBranchOperator && targetBranchValue?.trim()) ||
          (persistIncomplete && (targetBranchOperator || targetBranchValue?.trim()))) &&
        !payloadConditions.some(pc => pc.key === PayloadConditionTypes.TARGET_BRANCH) &&
        event !== eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.TARGET_BRANCH,
          operator: targetBranchOperator || '',
          value: targetBranchValue || ''
        })
      }
      if (
        ((sourceBranchOperator && sourceBranchValue?.trim()) ||
          (persistIncomplete && (sourceBranchOperator || sourceBranchValue?.trim()))) &&
        !payloadConditions.some(pc => pc.key === PayloadConditionTypes.SOURCE_BRANCH) &&
        event !== eventTypes.PUSH &&
        event !== eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.SOURCE_BRANCH,
          operator: sourceBranchOperator || '',
          value: sourceBranchValue || ''
        })
      }
      if (
        ((changedFilesOperator && changedFilesValue?.trim()) ||
          (persistIncomplete && (changedFilesOperator || changedFilesValue?.trim()))) &&
        !payloadConditions.some(pc => pc.key === PayloadConditionTypes.CHANGED_FILES) &&
        event !== eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.CHANGED_FILES,
          operator: changedFilesOperator || '',
          value: changedFilesValue || ''
        })
      }
      if (
        ((tagConditionOperator && tagConditionValue?.trim()) ||
          (persistIncomplete && (tagConditionOperator || tagConditionValue?.trim()))) &&
        !payloadConditions.some(pc => pc.key === PayloadConditionTypes.TAG) &&
        event === eventTypes.TAG
      ) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.TAG,
          operator: tagConditionOperator || '',
          value: tagConditionValue || ''
        })
      }

      // actions will be required thru validation
      const actionsValues = (actions as unknown as SelectOption[])?.map(action => action.value)
      const triggerYaml: NGTriggerConfigV2 = {
        name,
        identifier,
        enabled: enabledStatus,
        description,
        tags,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        source: {
          type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
          spec: {
            type: formikValueSourceRepo, // Github
            spec: {
              type: event,
              spec: {
                connectorRef: connectorRef?.value || '',
                autoAbortPreviousExecutions
              }
            }
          }
        },
        inputYaml: stringifyPipelineRuntimeInput
      }
      if (triggerYaml.source?.spec?.spec) {
        triggerYaml.source.spec.spec.spec.payloadConditions = persistIncomplete
          ? payloadConditions
          : payloadConditions.filter(payloadCondition => isRowFilled(payloadCondition))

        triggerYaml.source.spec.spec.spec.headerConditions = persistIncomplete
          ? headerConditions
          : headerConditions.filter(headerCondition => isRowFilled(headerCondition))

        if (jexlCondition) {
          triggerYaml.source.spec.spec.spec.jexlCondition = jexlCondition
        }

        if (repoName) {
          triggerYaml.source.spec.spec.spec.repoName = repoName
        } else if (connectorRef?.connector?.spec?.type === connectorUrlType.ACCOUNT) {
          triggerYaml.source.spec.spec.spec.repoName = ''
        }
        if (actionsValues) {
          triggerYaml.source.spec.spec.spec.actions = actionsValues
        }
      }
      return clearNullUndefined(triggerYaml)
    } else {
      const triggerYaml: NGTriggerConfigV2 = {
        name,
        identifier,
        enabled: enabledStatus,
        description,
        tags,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        source: {
          type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
          spec: {
            type: formikValueSourceRepo, // Custom
            spec: {
              payloadConditions: []
            }
          }
        },
        inputYaml: stringifyPipelineRuntimeInput
      }

      if (secureToken && triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec = { authToken: { type: 'inline', spec: { value: secureToken } } }
      }

      if (triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec.payloadConditions = persistIncomplete
          ? payloadConditions
          : payloadConditions.filter(payloadCondition => isRowFilled(payloadCondition))
      }

      if (triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec.headerConditions = persistIncomplete
          ? headerConditions
          : headerConditions.filter(headerCondition => isRowFilled(headerCondition))
      }

      if (jexlCondition && triggerYaml.source?.spec) {
        triggerYaml.source.spec.spec.jexlCondition = jexlCondition
      }

      if (triggerYaml?.source?.spec && isEmpty(triggerYaml.source.spec.spec)) {
        delete triggerYaml.source.spec.spec
      }

      return clearNullUndefined(triggerYaml)
    }
  }

  const getWebhookTriggerValues = ({
    triggerResponseYaml,
    triggerYaml
  }: {
    triggerResponseYaml?: string
    triggerYaml?: { trigger: NGTriggerConfigV2 }
  }): FlatOnEditValuesInterface | undefined => {
    // triggerResponseYaml comes from onEdit render, triggerYaml comes from visualYaml toggle
    let triggerValues: FlatOnEditValuesInterface | undefined

    if (triggerYaml && triggerYaml?.trigger?.enabled === false) {
      setEnabledStatus(false)
    } else if (triggerYaml && triggerYaml?.trigger?.enabled === true) {
      setEnabledStatus(true)
    }
    try {
      const triggerResponseJson = triggerResponseYaml ? parse(triggerResponseYaml) : triggerYaml

      if (triggerResponseJson?.trigger?.source?.spec?.type !== GitSourceProviders.CUSTOM.value) {
        // non-custom flow #github | gitlab | bitbucket
        const {
          trigger: {
            name,
            identifier,
            description,
            tags,
            inputYaml,
            source: {
              spec: {
                type: sourceRepo,
                spec: {
                  type: event,
                  spec: {
                    actions,
                    connectorRef,
                    repoName,
                    payloadConditions,
                    headerConditions,
                    authToken,
                    jexlCondition,
                    autoAbortPreviousExecutions = false
                  }
                }
              }
            }
          }
        } = triggerResponseJson

        const { value: sourceBranchValue, operator: sourceBranchOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.SOURCE_BRANCH
          ) || {}
        const { value: targetBranchValue, operator: targetBranchOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.TARGET_BRANCH
          ) || {}
        const { value: changedFilesValue, operator: changedFilesOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.CHANGED_FILES
          ) || {}
        const { value: tagConditionValue, operator: tagConditionOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.TAG
          ) || {}

        let pipelineJson = undefined
        try {
          pipelineJson = parse(inputYaml)?.pipeline
        } catch (e) {
          // set error
          setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
        }

        triggerValues = {
          name,
          identifier,
          description,
          tags,
          pipeline: pipelineJson,
          sourceRepo,
          triggerType: TriggerTypes.WEBHOOK as unknown as NGTriggerSourceV2['type'],
          event,
          autoAbortPreviousExecutions,
          connectorRef,
          repoName,
          secureToken: authToken?.spec?.value,
          actions: (actions || []).map((action: string) => ({ label: action, value: action })),
          anyAction: (actions || []).length === 0,
          sourceBranchOperator,
          sourceBranchValue,
          targetBranchOperator,
          targetBranchValue,
          changedFilesOperator,
          changedFilesValue,
          tagConditionOperator,
          tagConditionValue,
          headerConditions,
          payloadConditions: payloadConditions?.filter(
            (payloadCondition: AddConditionInterface) =>
              payloadCondition.key !== PayloadConditionTypes.SOURCE_BRANCH &&
              payloadCondition.key !== PayloadConditionTypes.TARGET_BRANCH &&
              payloadCondition.key !== PayloadConditionTypes.CHANGED_FILES &&
              payloadCondition.key !== PayloadConditionTypes.TAG
          ),
          jexlCondition
        }

        // connectorRef in Visual UI is an object (with the label), but in YAML is a string
        if (triggerValues?.connectorRef && typeof triggerValues.connectorRef === 'string') {
          const connectorRefWithBlankLabel: ConnectorRefInterface = {
            value: triggerValues.connectorRef,
            identifier: triggerValues.connectorRef
          }

          if (triggerYaml && connectorData?.data?.connector?.name) {
            const { connector } = connectorData.data

            connectorRefWithBlankLabel.connector = connector
            connectorRefWithBlankLabel.connector.identifier = triggerValues.connectorRef

            connectorRefWithBlankLabel.label = '' // will fetch details on useEffect
          }

          triggerValues.connectorRef = connectorRefWithBlankLabel

          const connectorParams: GetConnectorQueryParams = {
            accountIdentifier: accountId
          }
          if (triggerValues?.connectorRef?.value) {
            if (getScopeFromValue(triggerValues.connectorRef?.value) === Scope.ORG) {
              connectorParams.orgIdentifier = orgIdentifier
            } else if (getScopeFromValue(triggerValues.connectorRef?.value) === Scope.PROJECT) {
              connectorParams.orgIdentifier = orgIdentifier
              connectorParams.projectIdentifier = projectIdentifier
            }

            setConnectorScopeParams(connectorParams)
          }
        }

        return triggerValues
      } else {
        // custom webhook flow
        const {
          trigger: {
            name,
            identifier,
            description,
            tags,
            inputYaml,
            source: {
              spec: {
                type: sourceRepo,
                spec: { payloadConditions, headerConditions, authToken, jexlCondition }
              }
            }
          }
        } = triggerResponseJson

        let pipelineJson = undefined
        try {
          pipelineJson = parse(inputYaml)?.pipeline
        } catch (e) {
          // set error
          setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
        }

        triggerValues = {
          name,
          identifier,
          description,
          tags,
          pipeline: pipelineJson,
          sourceRepo,
          triggerType: TriggerTypes.WEBHOOK as unknown as NGTriggerSourceV2['type'],
          secureToken: authToken?.spec?.value,
          headerConditions,
          payloadConditions,
          jexlCondition
        }

        return triggerValues
      }
    } catch (e) {
      // set error
      setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseTriggersData'))
    }

    return triggerValues
  }

  const getScheduleTriggerValues = ({
    triggerResponseYaml,
    triggerYaml
  }: {
    triggerResponseYaml?: string
    triggerYaml?: { trigger: NGTriggerConfigV2 }
  }): FlatOnEditValuesInterface | undefined => {
    let newOnEditInitialValues: FlatOnEditValuesInterface | undefined
    try {
      const triggerResponseJson = triggerYaml ? triggerYaml : triggerResponseYaml ? parse(triggerResponseYaml) : {}
      const {
        trigger: {
          name,
          identifier,
          description,
          tags,
          inputYaml,
          source: {
            spec: {
              spec: { expression }
            }
          }
        }
      } = triggerResponseJson

      let pipelineJson = undefined
      try {
        pipelineJson = parse(inputYaml)?.pipeline
      } catch (e) {
        // set error
        setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
      const expressionBreakdownValues = getBreakdownValues(expression)
      const newExpressionBreakdown = { ...resetScheduleObject, ...expressionBreakdownValues }
      newOnEditInitialValues = {
        name,
        identifier,
        description,
        tags,
        pipeline: pipelineJson,
        triggerType: TriggerTypes.SCHEDULE as unknown as NGTriggerSourceV2['type'],
        expression,
        ...newExpressionBreakdown,
        selectedScheduleTab: scheduleTabsId.CUSTOM // only show CUSTOM on edit
      }
      return newOnEditInitialValues
    } catch (e) {
      // set error
      setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseTriggersData'))
    }
  }

  const getArtifactTriggerValues = ({
    triggerResponseYaml,
    triggerYaml
  }: {
    triggerResponseYaml?: string
    triggerYaml?: { trigger: NGTriggerConfigV2 }
  }): FlatOnEditValuesInterface | undefined => {
    let newOnEditInitialValues: FlatOnEditValuesInterface | undefined
    try {
      const triggerResponseJson = triggerYaml ? triggerYaml : triggerResponseYaml ? parse(triggerResponseYaml) : {}
      const {
        trigger: {
          name,
          identifier,
          description,
          tags,
          inputYaml,
          source: { type },
          source
        }
      } = triggerResponseJson
      let selectedArtifact

      if (type === TriggerTypes.MANIFEST) {
        const { manifestRef, type: _manifestType, spec } = source?.spec || {}
        if (_manifestType) {
          setArtifactManifestType(_manifestType)
        }
        selectedArtifact = {
          identifier: manifestRef,
          type: artifactManifestType || _manifestType,
          spec
        }
      }

      let pipelineJson = undefined
      try {
        pipelineJson = parse(inputYaml)?.pipeline
      } catch (e) {
        // set error
        setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }

      newOnEditInitialValues = {
        name,
        identifier,
        description,
        tags,
        pipeline: pipelineJson,
        triggerType: TriggerTypes.MANIFEST as unknown as NGTriggerSourceV2['type'],
        manifestType: selectedArtifact?.type,
        stageId: source?.spec?.stageIdentifier,
        inputSetTemplateYamlObj: parse(template?.data?.inputSetTemplateYaml || ''),
        selectedArtifact,
        eventConditions: source?.spec?.spec?.eventConditions || []
      }
      return newOnEditInitialValues
    } catch (e) {
      // set error
      setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseTriggersData'))
    }
  }
  const getScheduleTriggerYaml = ({
    values: val
  }: {
    values: FlatValidScheduleFormikValuesInterface
  }): TriggerConfigDTO => {
    const {
      name,
      identifier,
      description,
      tags,
      pipeline: pipelineRuntimeInput,
      triggerType: formikValueTriggerType,
      expression
    } = val

    // actions will be required thru validation
    const stringifyPipelineRuntimeInput = yamlStringify({ pipeline: clearNullUndefined(pipelineRuntimeInput) })
    return clearNullUndefined({
      name,
      identifier,
      enabled: enabledStatus,
      description,
      tags,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      source: {
        type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
        spec: {
          type: scheduledTypes.CRON,
          spec: {
            expression
          }
        }
      },
      inputYaml: stringifyPipelineRuntimeInput
    })
  }

  const getArtifactTriggerYaml = ({
    values: val,
    persistIncomplete = false
  }: {
    values: any
    persistIncomplete?: boolean
  }): TriggerConfigDTO => {
    const {
      name,
      identifier,
      description,
      tags,
      pipeline: pipelineRuntimeInput,
      triggerType: formikValueTriggerType,
      selectedArtifact,
      stageId,
      eventConditions = [],
      manifestType: onEditManifestType
    } = val

    // actions will be required thru validation
    const stringifyPipelineRuntimeInput = yamlStringify({ pipeline: clearNullUndefined(pipelineRuntimeInput) })

    if (selectedArtifact?.spec?.chartVersion) {
      // hardcode manifest chart version to default
      selectedArtifact.spec.chartVersion = replaceTriggerDefaultBuild({
        chartVersion: selectedArtifact?.spec?.chartVersion
      })
    } else if (!isEmpty(selectedArtifact) && selectedArtifact?.spec?.chartVersion === '') {
      selectedArtifact.spec.chartVersion = TriggerDefaultFieldList.chartVersion
    }

    // clears any runtime inputs
    const artifactSourceSpec = clearRuntimeInputValue(
      cloneDeep(
        parse(
          JSON.stringify({
            spec: selectedArtifact?.spec
          }) || ''
        )
      )
    )

    const triggerYaml: NGTriggerConfigV2 = {
      name,
      identifier,
      enabled: enabledStatus,
      description,
      tags,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      source: {
        type: formikValueTriggerType as unknown as NGTriggerSourceV2['type'],
        spec: {
          stageIdentifier: stageId,
          manifestRef: selectedArtifact?.identifier,
          type: onEditManifestType || manifestType,
          ...artifactSourceSpec
        }
      },
      inputYaml: stringifyPipelineRuntimeInput
    }

    if (triggerYaml.source?.spec?.spec) {
      triggerYaml.source.spec.spec.eventConditions = persistIncomplete
        ? eventConditions
        : eventConditions.filter((eventCondition: AddConditionInterface) => isRowFilled(eventCondition))
    }

    return clearNullUndefined(triggerYaml)
  }

  // TriggerConfigDTO is NGTriggerConfigV2 with optional identifier
  const submitTrigger = async (triggerYaml: NGTriggerConfigV2 | TriggerConfigDTO): Promise<void> => {
    if (onEditInitialValues?.identifier) {
      try {
        const { status, data } = await updateTrigger(yamlStringify({ trigger: clearNullUndefined(triggerYaml) }) as any)
        if (status === ResponseStatus.SUCCESS) {
          showSuccess(getString('pipeline.triggers.toast.successfulUpdate', { name: data?.name }))
          history.push(
            routes.toTriggersPage({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              module
            })
          )
        }
      } catch (err) {
        setErrorToasterMessage(err?.data?.message)
      }
      // error flow sent to Wizard
    } else {
      try {
        const { status, data } = await createTrigger(yamlStringify({ trigger: clearNullUndefined(triggerYaml) }) as any)
        if (status === ResponseStatus.SUCCESS) {
          showSuccess(getString('pipeline.triggers.toast.successfulCreate', { name: data?.name }))
          history.push(
            routes.toTriggersPage({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              module
            })
          )
        }
      } catch (err) {
        setErrorToasterMessage(err?.data?.message)
      }
    }
  }

  const handleWebhookSubmit = async (val: FlatValidWebhookFormikValuesInterface): Promise<void> => {
    const triggerYaml = getWebhookTriggerYaml({ values: val })

    submitTrigger(triggerYaml)
  }

  const handleScheduleSubmit = async (val: FlatValidScheduleFormikValuesInterface): Promise<void> => {
    const triggerYaml = getScheduleTriggerYaml({ values: val })
    submitTrigger(triggerYaml)
  }

  const handleArtifactSubmit = async (val: FlatValidArtifactFormikValuesInterface): Promise<void> => {
    const triggerYaml = getArtifactTriggerYaml({ values: val })
    submitTrigger(triggerYaml)
  }

  const getInitialValues = (triggerType: NGTriggerSourceV2['type']): FlatInitialValuesInterface | any => {
    if (triggerType === TriggerTypes.WEBHOOK) {
      const newPipeline: any = { ...(currentPipeline?.pipeline || {}) }

      if (isPipelineWithCiCodebase(newPipeline)) {
        newPipeline.properties.ci.codebase.build = ciCodebaseBuild
        if (sourceRepoOnNew === CUSTOM) {
          newPipeline.properties.ci.codebase.build.spec.branch = ''
        }
      }

      return {
        triggerType: triggerTypeOnNew,
        sourceRepo: sourceRepoOnNew,
        identifier: '',
        tags: {},
        pipeline: newPipeline,
        originalPipeline,
        anyAction: false,
        autoAbortPreviousExecutions: false
      }
    } else if (triggerType === TriggerTypes.SCHEDULE) {
      return {
        triggerType: triggerTypeOnNew,
        identifier: '',
        tags: {},
        selectedScheduleTab: scheduleTabsId.MINUTES,
        pipeline: currentPipeline?.pipeline,
        originalPipeline,
        ...getDefaultExpressionBreakdownValues(scheduleTabsId.MINUTES)
      }
    } else if (isArtifactOrManifestTrigger(triggerType)) {
      const inputSetTemplateYamlObj = parse(template?.data?.inputSetTemplateYaml || '')

      return {
        triggerType: triggerTypeOnNew,
        identifier: '',
        tags: {},
        artifactType,
        manifestType,
        pipeline: currentPipeline?.pipeline,
        originalPipeline,
        inputSetTemplateYamlObj,
        selectedArtifact: {}
      }
    }
    return {}
  }

  const [initialValues, setInitialValues] = useState<FlatInitialValuesInterface>(
    Object.assign(getInitialValues(triggerTypeOnNew), onEditInitialValues)
  )

  useEffect(() => {
    setInitialValues(Object.assign(getInitialValues(triggerTypeOnNew), onEditInitialValues))
  }, [onEditInitialValues, currentPipeline])

  useEffect(() => {
    const yamlPipeline = pipelineResponse?.data?.yamlPipeline

    if (
      yamlPipeline &&
      ((initialValues && !initialValues.originalPipeline) ||
        (onEditInitialValues?.identifier && !onEditInitialValues.originalPipeline))
    ) {
      try {
        const newOriginalPipeline = parse(yamlPipeline)?.pipeline
        const additionalValues: {
          inputSetTemplateYamlObj?: {
            pipeline: PipelineInfoConfig | Record<string, never>
          }
        } = {}

        if (isArtifactOrManifestTrigger(initialValues?.triggerType)) {
          const inputSetTemplateYamlObj = parse(template?.data?.inputSetTemplateYaml || '')
          additionalValues.inputSetTemplateYamlObj = inputSetTemplateYamlObj
        }

        if (onEditInitialValues?.identifier) {
          const newPipeline = currentPipeline?.pipeline ? currentPipeline.pipeline : onEditInitialValues.pipeline || {}
          setOnEditInitialValues({
            ...onEditInitialValues,
            originalPipeline: newOriginalPipeline,
            pipeline: newPipeline,
            ...{ additionalValues }
          })
        } else {
          setInitialValues({
            ...initialValues,
            originalPipeline: newOriginalPipeline,
            ...{ additionalValues }
          })
        }
      } catch (e) {
        // set error
        setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }, [pipelineResponse?.data?.yamlPipeline, onEditInitialValues?.identifier, initialValues, currentPipeline])

  const { data: connectorData, refetch: getConnectorDetails } = useGetConnector({
    identifier: getIdentifierFromValue(
      wizardKey < 1 // wizardKey >1 means we've reset initialValues cause of Yaml Switching (onEdit or new) and should use those formik values instead
        ? onEditInitialValues?.connectorRef?.identifier || ''
        : initialValues?.connectorRef?.identifier || ''
    ),
    queryParams: connectorScopeParams,
    lazy: true
  })

  useEffect(() => {
    if (onEditInitialValues?.connectorRef?.identifier && !isUndefined(connectorScopeParams) && !connectorData) {
      getConnectorDetails()
    } else if (
      initialValues?.connectorRef?.value &&
      (!initialValues.connectorRef.label ||
        (connectorData?.data?.connector?.identifier &&
          !initialValues?.connectorRef?.identifier?.includes(connectorData?.data?.connector?.identifier)))
    ) {
      // need to get label due to switching from yaml to visual
      getConnectorDetails()
    }
  }, [onEditInitialValues?.connectorRef?.identifier, connectorScopeParams, initialValues?.connectorRef])

  useEffect(() => {
    if (connectorData?.data?.connector?.name && onEditInitialValues?.connectorRef?.identifier && wizardKey < 1) {
      // Assigns label on Visual mode for onEdit
      const { connector, status } = connectorData.data
      const connectorRef: ConnectorRefInterface = {
        ...(onEditInitialValues || initialValues).connectorRef,
        label: connector.name,
        connector,
        live: status?.status === 'SUCCESS'
      }
      if (onEditInitialValues?.connectorRef?.identifier) {
        setOnEditInitialValues({ ...onEditInitialValues, connectorRef })
      }
    } else if (connectorData?.data?.connector?.name && initialValues?.connectorRef?.identifier) {
      // means we switched from yaml to visual and need to get the label
      const { connector, status } = connectorData.data
      const connectorRef: ConnectorRefInterface = {
        ...initialValues.connectorRef,
        label: connector.name,
        connector,
        live: status?.status === 'SUCCESS'
      }
      setInitialValues({ ...initialValues, connectorRef })
    }
  }, [
    connectorData?.data?.connector,
    onEditInitialValues?.connectorRef?.identifier,
    initialValues?.connectorRef?.identifier
  ])

  const handleWebhookModeSwitch = (view: SelectedView, yamlHandler?: YamlBuilderHandlerBinding): void => {
    if (view === SelectedView.VISUAL) {
      const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
      setErrorToasterMessage('')
      try {
        const triggerYaml = parse(yaml)
        setInitialValues({ ...initialValues, ...getWebhookTriggerValues({ triggerYaml }) })
        setWizardKey(wizardKey + 1)
      } catch (e) {
        setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }

  const handleScheduleModeSwitch = (view: SelectedView, yamlHandler?: YamlBuilderHandlerBinding): void => {
    if (view === SelectedView.VISUAL) {
      const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
      setErrorToasterMessage('')
      try {
        const triggerYaml = parse(yaml)
        setInitialValues({ ...initialValues, ...getScheduleTriggerValues({ triggerYaml }) })
        setWizardKey(wizardKey + 1)
      } catch (e) {
        setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }

  const handleArtifactModeSwitch = (view: SelectedView, yamlHandler?: YamlBuilderHandlerBinding): void => {
    if (view === SelectedView.VISUAL) {
      const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
      setErrorToasterMessage('')
      try {
        const triggerYaml = parse(yaml)
        setInitialValues({ ...initialValues, ...getArtifactTriggerValues({ triggerYaml }) })
        setWizardKey(wizardKey + 1)
      } catch (e) {
        setGetTriggerErrorMessage(getString('pipeline.triggers.cannotParseInputValues'))
      }
    }
  }

  const [isExecutable] = usePermission(
    {
      resourceScope: {
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EXECUTE_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const isTriggerRbacDisabled = !isExecutable

  const wizardMap = initialValues.triggerType
    ? getWizardMap({ triggerType: initialValues.triggerType, getString, triggerName: initialValues?.name })
    : undefined

  const titleWithSwitch = ({ selectedView }: { selectedView: SelectedView }): JSX.Element => (
    <Layout.Horizontal
      spacing="medium"
      style={{ paddingLeft: 'var(--spacing-large)', paddingTop: 'var(--spacing-xsmall)', alignItems: 'baseline' }}
    >
      <Heading level={2}>{wizardMap?.wizardLabel}</Heading>
      {selectedView !== SelectedView.YAML ? (
        <>
          <Text>{getString('enabledLabel')}</Text>
          <Switch
            label=""
            disabled={isTriggerRbacDisabled}
            data-name="enabled-switch"
            key={Date.now()}
            checked={enabledStatus}
            onChange={() => setEnabledStatus(!enabledStatus)}
          />
        </>
      ) : null}
    </Layout.Horizontal>
  )
  const ConnectorRefRegex = /^.+source\.spec\.spec\.spec\.connectorRef$/
  const invocationMapWebhook: YamlBuilderProps['invocationMap'] = new Map<RegExp, InvocationMapFunction>()

  invocationMapWebhook.set(
    ConnectorRefRegex,

    (_matchingPath: string, _currentYaml: string): Promise<CompletionItemInterface[]> => {
      return new Promise(resolve => {
        const request = getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { filterType: 'Connector', categories: ['CODE_REPO'] }
        })
          .then(response => {
            const data =
              response?.data?.content?.map(connector => ({
                label: getConnectorName(connector),
                insertText: getConnectorValue(connector),
                kind: CompletionItemKind.Field
              })) || []
            return data
          })
          .catch((err: Failure) => {
            throw err.message
          })

        resolve(request)
      })
    }
  )

  const renderWebhookWizard = (): JSX.Element | undefined => {
    const isEdit = !!onEditInitialValues?.identifier
    if (!wizardMap) return undefined
    return (
      <Wizard
        key={wizardKey} // re-renders with yaml to visual initialValues
        formikInitialProps={{
          initialValues,
          onSubmit: (val: FlatValidWebhookFormikValuesInterface) => handleWebhookSubmit(val),
          validationSchema: getValidationSchema(
            TriggerTypes.WEBHOOK as unknown as NGTriggerSourceV2['type'],
            getString
          ),
          enableReinitialize: true
        }}
        className={css.tabs}
        wizardMap={wizardMap}
        tabWidth="218px"
        onHide={returnToTriggersPage}
        wizardType="webhook"
        // defaultTabId="Schedule"
        submitLabel={
          isEdit ? getString('pipeline.triggers.updateTrigger') : getString('pipeline.triggers.createTrigger')
        }
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading || isTriggerRbacDisabled}
        isEdit={isEdit}
        errorToasterMessage={errorToasterMessage}
        visualYamlProps={{
          handleModeSwitch: handleWebhookModeSwitch,
          yamlBuilderReadOnlyModeProps,
          yamlObjectKey: 'trigger',
          showVisualYaml: true,
          convertFormikValuesToYaml,
          schema: triggerSchema?.data,
          onYamlSubmit: submitTrigger,
          loading: loadingYamlSchema,
          invocationMap: invocationMapWebhook
        }}
        leftNav={titleWithSwitch}
      >
        <WebhookTriggerConfigPanel />
        <WebhookConditionsPanel />
        <WebhookPipelineInputPanel />
      </Wizard>
    )
  }

  const renderArtifactWizard = (): JSX.Element | undefined => {
    const isEdit = !!onEditInitialValues?.identifier
    if (!wizardMap) return undefined
    return (
      <Wizard
        key={wizardKey} // re-renders with yaml to visual initialValues
        formikInitialProps={{
          initialValues,
          onSubmit: (val: FlatValidArtifactFormikValuesInterface) => handleArtifactSubmit(val),
          validationSchema: getValidationSchema(
            initialValues.triggerType as unknown as NGTriggerSourceV2['type'],
            getString
          ),
          enableReinitialize: true
        }}
        className={css.tabs}
        wizardMap={wizardMap}
        tabWidth="218px"
        onHide={returnToTriggersPage}
        // defaultTabId="Schedule"
        submitLabel={
          isEdit ? getString('pipeline.triggers.updateTrigger') : getString('pipeline.triggers.createTrigger')
        }
        wizardType="artifacts"
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading || isTriggerRbacDisabled}
        isEdit={isEdit}
        errorToasterMessage={errorToasterMessage}
        visualYamlProps={{
          handleModeSwitch: handleArtifactModeSwitch,
          yamlBuilderReadOnlyModeProps,
          yamlObjectKey: 'trigger',
          showVisualYaml: true,
          convertFormikValuesToYaml,
          schema: triggerSchema?.data,
          onYamlSubmit: submitTrigger,
          loading: loadingYamlSchema,
          invocationMap: invocationMapWebhook
        }}
        leftNav={titleWithSwitch}
      >
        <ArtifactTriggerConfigPanel />
        <ArtifactConditionsPanel />
        <WebhookPipelineInputPanel />
      </Wizard>
    )
  }

  const renderScheduleWizard = (): JSX.Element | undefined => {
    const isEdit = !!onEditInitialValues?.identifier
    if (!wizardMap) return undefined
    return (
      <Wizard
        formikInitialProps={{
          initialValues,
          onSubmit: (val: FlatValidScheduleFormikValuesInterface) => handleScheduleSubmit(val),
          validationSchema: getValidationSchema(
            TriggerTypes.SCHEDULE as unknown as NGTriggerSourceV2['type'],
            getString
          ),
          enableReinitialize: true
        }}
        className={css.tabs}
        wizardMap={wizardMap}
        tabWidth="218px"
        onHide={returnToTriggersPage}
        // defaultTabId="Conditions"
        submitLabel={
          isEdit ? getString('pipeline.triggers.updateTrigger') : getString('pipeline.triggers.createTrigger')
        }
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading}
        isEdit={isEdit}
        wizardType="scheduled"
        errorToasterMessage={errorToasterMessage}
        leftNav={titleWithSwitch}
        visualYamlProps={{
          handleModeSwitch: handleScheduleModeSwitch,
          yamlBuilderReadOnlyModeProps,
          yamlObjectKey: 'trigger',
          showVisualYaml: true,
          convertFormikValuesToYaml,
          schema: triggerSchema?.data,
          onYamlSubmit: submitTrigger,
          loading: loadingYamlSchema
        }}
      >
        <TriggerOverviewPanel />
        <SchedulePanel />
        <WebhookPipelineInputPanel />
      </Wizard>
    )
  }

  if (initialValues?.triggerType && !Object.values(TriggerTypes).includes(initialValues.triggerType)) {
    return (
      <Layout.Vertical spacing="medium" padding="medium">
        <Page.Body>
          <h2>{getString('pipeline.triggers.pageNotFound')}</h2>
        </Page.Body>
      </Layout.Vertical>
    )
  }

  return triggerIdentifier && !getTriggerErrorMessage && !wizardMap ? (
    <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
      <PageSpinner />
    </div>
  ) : (
    <>
      <Page.Body>
        {!loadingGetTrigger && getTriggerErrorMessage && <PageError message={getTriggerErrorMessage} />}
        {!loadingGetTrigger &&
          !getTriggerErrorMessage &&
          initialValues.triggerType === TriggerTypes.WEBHOOK &&
          renderWebhookWizard()}
        {!loadingGetTrigger &&
          !getTriggerErrorMessage &&
          initialValues.triggerType === TriggerTypes.SCHEDULE &&
          renderScheduleWizard()}

        {!loadingGetTrigger &&
          !getTriggerErrorMessage &&
          isArtifactOrManifestTrigger(initialValues.triggerType) &&
          renderArtifactWizard()}
      </Page.Body>
    </>
  )
}
export default TriggersWizardPage
