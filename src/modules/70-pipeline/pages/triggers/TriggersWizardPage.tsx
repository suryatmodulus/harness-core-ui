import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Layout, SelectOption, Heading, Text, Switch } from '@wings-software/uicore'
import { parse, stringify } from 'yaml'
import { isEmpty, isUndefined, merge } from 'lodash-es'
import { Page, useToaster } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import Wizard from '@common/components/Wizard/Wizard'
import { PageError } from '@common/components/Page/PageError'
import routes from '@common/RouteDefinitions'
import { NgPipeline, useGetConnector, GetConnectorQueryParams } from 'services/cd-ng'
import {
  useGetPipeline,
  useGetTemplateFromPipeline,
  useCreateTrigger,
  useGetTrigger,
  useUpdateTrigger,
  NGTriggerConfig,
  NGTriggerSource,
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
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'

import { scheduleTabsId, getDefaultExpressionBreakdownValues } from './views/subviews/ScheduleUtils'
import type { AddConditionInterface } from './views/AddConditionsSection'
import { GitSourceProviders } from './utils/TriggersListUtils'
import { eventTypes, isPipelineWithCiCodebase, ciCodebaseBuild } from './utils/TriggersWizardPageUtils'
import {
  WebhookTriggerConfigPanel,
  WebhookConditionsPanel,
  WebhookPipelineInputPanel,
  SchedulePanel,
  TriggerOverviewPanel
} from './views'
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
  getValidationSchema
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
  const { sourceRepo: sourceRepoOnNew, triggerType: triggerTypeOnNew } = queryParamsOnNew || {}

  const { data: template } = useGetTemplateFromPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier }
  })

  const { data: triggerResponse, loading: loadingGetTrigger } = useGetTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })

  const [connectorScopeParams, setConnectorScopeParams] = useState<GetConnectorQueryParams | undefined>(undefined)

  const { mutate: createTrigger, error: createTriggerErrorResponse, loading: createTriggerLoading } = useCreateTrigger({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: updateTrigger, error: updateTriggerErrorResponse, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { loading: loadingYamlSchema, data: triggerSchema } = useGetSchemaYaml({
    queryParams: {
      entityType: 'Triggers',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const convertFormikValuesToYaml = (
    values: FlatValidWebhookFormikValuesInterface
  ): { trigger: NGTriggerConfig } | undefined => {
    const res = getWebhookTriggerYaml({ values, persistIncomplete: true })
    // remove invalid values
    if (res?.source?.spec?.spec && !res.source.spec.spec.actions) {
      delete res.source.spec.spec.actions
    }
    if (res?.source?.spec?.spec && !res.source.spec.spec.event) {
      delete res.source.spec.spec.event
    }

    if (values.triggerType === TriggerTypes.WEBHOOK) {
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
  const [currentPipeline, setCurrentPipeline] = useState<{ pipeline?: NgPipeline } | undefined>(undefined)
  const [wizardKey, setWizardKey] = useState<number>(0)

  const [onEditInitialValues, setOnEditInitialValues] = useState<
    | FlatOnEditValuesInterface
    | {
        triggerType: NGTriggerSource['type']
        pipeline?: string
        originalPipeline?: NgPipeline
        identifier?: string
        connectorRef?: { identifier?: string; scope?: string }
      }
  >({ triggerType: triggerTypeOnNew })

  const { data: connectorData, refetch: getConnectorDetails } = useGetConnector({
    identifier: getIdentifierFromValue(onEditInitialValues?.connectorRef?.identifier || '') as string,
    queryParams: connectorScopeParams,
    lazy: true
  })

  useEffect(() => {
    setCurrentPipeline(
      merge(clearRuntimeInput(parse(template?.data?.inputSetTemplateYaml || '')), currentPipeline || {}) as {
        pipeline: NgPipeline
      }
    )
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    if (onEditInitialValues?.connectorRef?.identifier && !isUndefined(connectorScopeParams)) {
      getConnectorDetails()
    }
  }, [onEditInitialValues?.connectorRef?.identifier, connectorScopeParams])

  useEffect(() => {
    if (connectorData?.data?.connector?.name && onEditInitialValues?.connectorRef?.identifier) {
      const { connector } = connectorData.data
      const connectorRef = {
        ...onEditInitialValues.connectorRef,
        label: connector.name,
        connector
      }
      setOnEditInitialValues({ ...onEditInitialValues, connectorRef })
    }
  }, [connectorData?.data?.connector?.name, onEditInitialValues?.connectorRef?.identifier])

  useEffect(() => {
    if (triggerResponse?.data?.enabled === false) {
      setEnabledStatus(false)
    }
  }, [triggerResponse?.data?.enabled])

  const { data: pipelineResponse } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const originalPipeline: NgPipeline | undefined = parse((pipelineResponse?.data?.yamlPipeline as any) || '')?.pipeline

  useEffect(() => {
    if (triggerResponse?.data?.yaml && triggerResponse.data.type === TriggerTypes.WEBHOOK) {
      const newOnEditInitialValues = getWebhookTriggerValues({ triggerResponseYaml: triggerResponse.data.yaml })

      setOnEditInitialValues({ ...onEditInitialValues, ...newOnEditInitialValues })
    } else if (triggerResponse?.data?.yaml && triggerResponse.data.type === TriggerTypes.SCHEDULE) {
      let newOnEditInitialValues: FlatOnEditValuesInterface | undefined
      try {
        const triggerResponseJson = parse(triggerResponse.data.yaml)
        const {
          trigger: {
            name,
            identifier,
            description,
            tags,
            source: {
              spec: {
                spec: { expression }
              }
            },
            target: {
              targetIdentifier,
              spec: { runtimeInputYaml: pipelineYaml }
            }
          }
        } = triggerResponseJson

        let pipelineJson = undefined
        try {
          pipelineJson = parse(pipelineYaml)?.pipeline
        } catch (e) {
          // set error
          setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseInputValues'))
        }
        const expressionBreakdownValues = getBreakdownValues(expression)
        const newExpressionBreakdown = { ...resetScheduleObject, ...expressionBreakdownValues }
        newOnEditInitialValues = {
          name,
          identifier,
          description,
          tags,
          pipeline: pipelineJson,
          triggerType: triggerResponse.data.type,
          targetIdentifier,
          expression,
          ...newExpressionBreakdown,
          selectedScheduleTab: scheduleTabsId.CUSTOM // only show CUSTOM on edit
        }
      } catch (e) {
        // set error
        setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseTriggersData'))
      }
      setOnEditInitialValues({ ...onEditInitialValues, ...newOnEditInitialValues })
    }
  }, [triggerIdentifier, triggerResponse])

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
  }): NGTriggerConfig => {
    const {
      name,
      identifier,
      description,
      tags,
      pipeline: pipelineRuntimeInput,
      sourceRepo: formikValueSourceRepo,
      triggerType: formikValueTriggerType,
      repoName,
      connectorRef,
      event,
      actions,
      targetIdentifier,
      sourceBranchOperator,
      sourceBranchValue,
      targetBranchOperator,
      targetBranchValue,
      tagConditionOperator,
      tagConditionValue,
      headerConditions = [],
      payloadConditions = [],
      jexlCondition,
      secureToken
    } = val

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
    }

    // actions will be required thru validation
    const actionsValues = ((actions as unknown) as SelectOption[])?.map(action => action.value)
    const stringifyPipelineRuntimeInput = stringify({ pipeline: clearNullUndefined(pipelineRuntimeInput) })
    const triggerYaml: NGTriggerConfig = {
      name,
      identifier,
      enabled: enabledStatus,
      description,
      tags,
      target: {
        targetIdentifier: targetIdentifier || pipelineIdentifier,
        type: 'Pipeline',
        spec: {
          runtimeInputYaml: stringifyPipelineRuntimeInput
        }
      },
      source: {
        type: (formikValueTriggerType as unknown) as NGTriggerSource['type'],
        spec: {
          type: formikValueSourceRepo,
          spec: {
            gitRepoSpec: { identifier: connectorRef?.value, repoName },
            event,
            actions: actionsValues
          }
        }
      }
    }

    if (formikValueSourceRepo === GitSourceProviders.CUSTOM.value && secureToken && triggerYaml.source?.spec) {
      triggerYaml.source.spec.spec = { authToken: { type: 'inline', spec: { value: secureToken } } }
    }

    if (!isEmpty(payloadConditions) && triggerYaml.source?.spec) {
      triggerYaml.source.spec.spec.payloadConditions = payloadConditions
    }

    if (!isEmpty(headerConditions) && triggerYaml.source?.spec) {
      triggerYaml.source.spec.spec.headerConditions = headerConditions
    }

    if (jexlCondition && triggerYaml.source?.spec) {
      triggerYaml.source.spec.spec.jexlCondition = jexlCondition
    }

    return triggerYaml
  }

  const getWebhookTriggerValues = ({
    triggerResponseYaml,
    triggerYaml
  }: {
    triggerResponseYaml?: string
    triggerYaml?: { trigger: NGTriggerConfig }
  }): FlatOnEditValuesInterface | undefined => {
    // triggerResponseYaml comes from onEdit render, triggerYaml comes from visualYaml toggle
    let triggerValues: FlatOnEditValuesInterface | undefined
    let gitRepoSpecCopy
    try {
      const triggerResponseJson = triggerYaml ? triggerYaml : triggerResponseYaml ? parse(triggerResponseYaml) : {}
      const {
        trigger: {
          name,
          identifier,
          description,
          tags,
          source: {
            spec: {
              spec: { actions, event, gitRepoSpec, payloadConditions, headerConditions, authToken, jexlCondition },
              type: sourceRepo
            }
          },
          target: {
            targetIdentifier,
            spec: { runtimeInputYaml: pipelineYaml }
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
      const { value: tagConditionValue, operator: tagConditionOperator } =
        payloadConditions?.find(
          (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.TAG
        ) || {}

      let pipelineJson = undefined
      try {
        pipelineJson = parse(pipelineYaml)?.pipeline
      } catch (e) {
        // set error
        setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseInputValues'))
      }

      triggerValues = {
        name,
        identifier,
        description,
        tags,
        pipeline: pipelineJson,
        sourceRepo,
        triggerType: (TriggerTypes.WEBHOOK as unknown) as NGTriggerSource['type'],
        event,
        targetIdentifier,
        secureToken: authToken?.spec?.value,
        actions: actions?.map((action: string) => ({ label: action, value: action })),
        anyAction: actions?.length === 0,
        sourceBranchOperator,
        sourceBranchValue,
        targetBranchOperator,
        targetBranchValue,
        tagConditionOperator,
        tagConditionValue,
        headerConditions,
        payloadConditions: payloadConditions?.filter(
          (payloadCondition: AddConditionInterface) =>
            payloadCondition.key !== PayloadConditionTypes.SOURCE_BRANCH &&
            payloadCondition.key !== PayloadConditionTypes.TARGET_BRANCH &&
            payloadCondition.key !== PayloadConditionTypes.TAG
        ),
        jexlCondition
      }
      gitRepoSpecCopy = gitRepoSpec
    } catch (e) {
      // set error
      setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseTriggersData'))
    }

    if (triggerValues && triggerValues.sourceRepo !== GitSourceProviders.CUSTOM.value && gitRepoSpecCopy?.identifier) {
      const connectorRef: ConnectorRefInterface = {
        identifier: gitRepoSpecCopy.identifier,
        value: gitRepoSpecCopy.identifier
      }

      if (triggerYaml && connectorData?.data?.connector?.name) {
        // add back in label from connectorData
        const { connector } = connectorData.data

        connectorRef.connector = connector
        connectorRef.label = connector.name
      }

      const connectorParams: GetConnectorQueryParams = {
        accountIdentifier: accountId
      }

      if (getScopeFromValue(gitRepoSpecCopy.identifier) === Scope.ORG) {
        connectorParams.orgIdentifier = orgIdentifier
      } else if (getScopeFromValue(gitRepoSpecCopy.identifier) === Scope.PROJECT) {
        connectorParams.orgIdentifier = orgIdentifier
        connectorParams.projectIdentifier = projectIdentifier
      }

      setConnectorScopeParams(connectorParams)

      triggerValues.connectorRef = connectorRef

      triggerValues.repoName = gitRepoSpecCopy?.repoName ?? ''
    }

    if (triggerYaml && triggerYaml?.trigger?.enabled === false) {
      setEnabledStatus(false)
    } else if (triggerYaml && triggerYaml?.trigger?.enabled === true) {
      setEnabledStatus(true)
    }

    return triggerValues
  }

  const submitTrigger = async (triggerYaml: NGTriggerConfig) => {
    if (onEditInitialValues?.identifier) {
      const { status, data } = await updateTrigger(stringify({ trigger: clearNullUndefined(triggerYaml) }) as any)
      if (status === ResponseStatus.SUCCESS) {
        showSuccess(getString('pipeline-triggers.toast.successfulUpdate', { name: data?.name }))
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
      // error flow sent to Wizard
    } else {
      const { status, data } = await createTrigger(stringify({ trigger: clearNullUndefined(triggerYaml) }) as any)
      if (status === ResponseStatus.SUCCESS) {
        showSuccess(getString('pipeline-triggers.toast.successfulCreate', { name: data?.name }))
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
    }
  }

  const handleWebhookSubmit = async (val: FlatValidWebhookFormikValuesInterface): Promise<void> => {
    const triggerYaml = getWebhookTriggerYaml({ values: val })

    submitTrigger(triggerYaml)
  }

  const handleScheduleSubmit = async (val: FlatValidScheduleFormikValuesInterface): Promise<void> => {
    const {
      name,
      identifier,
      description,
      tags,
      pipeline: pipelineRuntimeInput,
      triggerType: formikValueTriggerType,
      targetIdentifier,
      expression
    } = val

    // actions will be required thru validation
    const stringifyPipelineRuntimeInput = stringify({ pipeline: clearNullUndefined(pipelineRuntimeInput) })
    const triggerYaml: NGTriggerConfig = {
      name,
      identifier,
      enabled: enabledStatus,
      description,
      tags,
      target: {
        targetIdentifier: targetIdentifier || pipelineIdentifier,
        type: 'Pipeline',
        spec: {
          runtimeInputYaml: stringifyPipelineRuntimeInput
        }
      },
      source: {
        type: (formikValueTriggerType as unknown) as NGTriggerSource['type'],
        spec: {
          type: scheduledTypes.CRON,
          spec: {
            expression
          }
        }
      }
    }

    submitTrigger(triggerYaml)
  }

  const getInitialValues = (triggerType: NGTriggerSource['type']): FlatInitialValuesInterface | undefined => {
    if (triggerType === TriggerTypes.WEBHOOK && !isEmpty(currentPipeline)) {
      const newPipeline: any = { ...(currentPipeline?.pipeline || {}) }

      if (isPipelineWithCiCodebase(newPipeline)) {
        newPipeline.properties.ci.codebase.build = ciCodebaseBuild
      }

      return {
        triggerType: triggerTypeOnNew,
        sourceRepo: sourceRepoOnNew,
        identifier: '',
        tags: {},
        pipeline: newPipeline,
        originalPipeline
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
    }
  }

  const [initialValues, setInitialValues] = useState<FlatInitialValuesInterface>(
    Object.assign((triggerTypeOnNew && getInitialValues(triggerTypeOnNew)) || {}, onEditInitialValues)
  )

  useEffect(() => {
    setInitialValues(Object.assign((triggerTypeOnNew && getInitialValues(triggerTypeOnNew)) || {}, onEditInitialValues))
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
        if (onEditInitialValues?.identifier) {
          setOnEditInitialValues({ ...onEditInitialValues, originalPipeline: newOriginalPipeline })
        } else {
          setInitialValues({ ...initialValues, originalPipeline: newOriginalPipeline })
        }
      } catch (e) {
        // set error
        setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseInputValues'))
      }
    }
  }, [pipelineResponse?.data?.yamlPipeline, onEditInitialValues?.identifier, initialValues])

  const handleModeSwitch = (view: SelectedView, yamlHandler?: YamlBuilderHandlerBinding): void => {
    if (view === SelectedView.VISUAL) {
      const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
      try {
        const triggerYaml = parse(yaml)
        setInitialValues({ ...initialValues, ...getWebhookTriggerValues({ triggerYaml }) })
        setWizardKey(wizardKey + 1)
      } catch (e) {
        setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseInputValues'))
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

  const errorToasterMessage =
    ((createTriggerErrorResponse?.data as unknown) as { message?: string })?.message ||
    ((updateTriggerErrorResponse?.data as unknown) as { message?: string })?.message
  // ((getTriggerErrorResponse?.data as unknown) as { message?: string })?.message
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
            (TriggerTypes.WEBHOOK as unknown) as NGTriggerSource['type'],
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
          isEdit ? getString('pipeline-triggers.updateTrigger') : getString('pipeline-triggers.createTrigger')
        }
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading || isTriggerRbacDisabled}
        isEdit={isEdit}
        errorToasterMessage={errorToasterMessage}
        visualYamlProps={{
          handleModeSwitch,
          yamlBuilderReadOnlyModeProps,
          yamlObjectKey: 'trigger',
          showVisualYaml: true,
          convertFormikValuesToYaml,
          schema: triggerSchema?.data,
          onYamlSubmit: submitTrigger,
          loading: loadingYamlSchema
        }}
        leftNav={titleWithSwitch}
      >
        <WebhookTriggerConfigPanel />
        <WebhookConditionsPanel />
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
            (TriggerTypes.SCHEDULE as unknown) as NGTriggerSource['type'],
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
          isEdit ? getString('pipeline-triggers.updateTrigger') : getString('pipeline-triggers.createTrigger')
        }
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading}
        isEdit={isEdit}
        errorToasterMessage={errorToasterMessage}
        leftNav={titleWithSwitch}
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
          <h2>{getString('pipeline-triggers.pageNotFound')}</h2>
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
        {initialValues.triggerType === TriggerTypes.WEBHOOK && renderWebhookWizard()}
        {initialValues.triggerType === TriggerTypes.SCHEDULE && renderScheduleWizard()}
      </Page.Body>
    </>
  )
}
export default TriggersWizardPage
