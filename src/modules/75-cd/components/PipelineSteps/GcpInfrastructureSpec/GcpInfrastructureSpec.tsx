import React, { useEffect, useState } from 'react'
import { Menu } from '@blueprintjs/core'
import {
  IconName,
  Text,
  Color,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  SelectOption,
  Label
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get, memoize } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { FormikErrors } from 'formik'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  useGetConnector,
  ConnectorInfoDTO,
  getConnectorListV2Promise,
  ConnectorResponse,
  K8sGcpInfrastructure,
  useGetClusterNamesForGcp,
  getClusterNamesForGcpPromise
} from 'services/cd-ng'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  getScopeFromDTO,
  getIdentifierFromValue,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import css from './GcpInfrastructureSpec.module.scss'

const logger = loggerFor(ModuleName.CD)
const namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const releaseNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/
type K8sGcpInfrastructureTemplate = { [key in keyof K8sGcpInfrastructure]: string }
interface GcpInfrastructureSpecEditableProps {
  initialValues: K8sGcpInfrastructure
  onUpdate?: (data: K8sGcpInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: K8sGcpInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sGcpInfrastructure
}

const getConnectorValue = (connector?: ConnectorResponse): string =>
  `${
    connector?.connector?.orgIdentifier && connector?.connector?.projectIdentifier
      ? connector?.connector?.identifier
      : connector?.connector?.orgIdentifier
      ? `${Scope.ORG}.${connector?.connector?.identifier}`
      : `${Scope.ACCOUNT}.${connector?.connector?.identifier}`
  }` || ''

const getConnectorName = (connector?: ConnectorResponse): string =>
  `${
    connector?.connector?.orgIdentifier && connector?.connector?.projectIdentifier
      ? `${connector?.connector?.type}: ${connector?.connector?.name}`
      : connector?.connector?.orgIdentifier
      ? `${connector?.connector?.type}[Org]: ${connector?.connector?.name}`
      : `${connector?.connector?.type}[Account]: ${connector?.connector?.name}`
  }` || ''

interface K8sGcpInfrastructureUI extends Omit<K8sGcpInfrastructure, 'cluster'> {
  cluster?: { label?: string; value?: string } | string | any
}

const GcpInfrastructureSpecEditable: React.FC<GcpInfrastructureSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [clusterOptions, setClusterOptions] = useState<SelectOption[]>([])
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const onMountRef = React.useRef<boolean>(false)

  const {
    data: clusterNamesData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames
  } = useGetClusterNamesForGcp({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options = clusterNamesData?.data?.clusterNames?.map(name => ({ label: name, value: name })) || []
    setClusterOptions(options)
  }, [clusterNamesData])

  useEffect(() => {
    if (initialValues.connectorRef && getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED) {
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef
        }
      })
    }
  }, [initialValues.connectorRef])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loadingClusterNames}
        onClick={handleClick}
      />
    </div>
  ))

  const getInitialValues = () => {
    const values: K8sGcpInfrastructureUI = {
      ...initialValues
    }

    if (getMultiTypeFromValue(initialValues.cluster) === MultiTypeInputType.FIXED) {
      values.cluster = { label: initialValues.cluster, value: initialValues.cluster }
    }

    return values
  }

  const getClusterValue = (cluster: { label?: string; value?: string } | string | any): string => {
    return typeof cluster === 'string' ? (cluster as string) : cluster?.value
  }

  const validationSchema = Yup.object().shape({
    connectorRef: Yup.string().required(getString?.('fieldRequired', { field: getString('connector') })),
    cluster: Yup.object().test({
      test(value: SelectOption): boolean | Yup.ValidationError {
        if (isEmpty(value) || isEmpty(value.value)) {
          return this.createError({ message: getString('fieldRequired', { field: getString('common.cluster') }) })
        }
        return true
      }
    }),
    namespace: Yup.string()
      .required(getString('fieldRequired', { field: getString('common.namespace') }))
      .test('namespace', getString('cd.namespaceValidation'), function (value) {
        if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
          return true
        }
        return namespaceRegex.test(value)
      }),
    releaseName: Yup.string()
      .required(getString('fieldRequired', { field: getString('common.releaseName') }))
      .test('releaseName', getString('cd.releaseNameValidation'), function (value) {
        if (getMultiTypeFromValue(value) !== MultiTypeInputType.FIXED) {
          return true
        }
        return releaseNameRegex.test(value)
      })
  })

  return (
    <Layout.Vertical spacing="medium">
      <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15 }}>
        {getString('cd.steps.kubernetesGcpStep.stepName')}
      </Text>
      <Formik<K8sGcpInfrastructureUI>
        enableReinitialize
        initialValues={getInitialValues()}
        validate={value => {
          const data: K8sGcpInfrastructure = {
            namespace: value.namespace,
            releaseName: value.releaseName,
            connectorRef: undefined,
            cluster: getClusterValue(value.cluster),
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || value.connectorRef
          }
          delayedOnUpdate(data)
        }}
        validationSchema={validationSchema}
        onSubmit={noop}
      >
        {formik => {
          if (!onMountRef.current) {
            onMountRef.current = true
            formik.setTouched({ connectorRef: true, namespace: true, releaseName: true, cluster: true })
          }
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={<Label className={css.connectorLabel}>{getString('connector')}</Label>}
                  placeholder={getString('cd.steps.common.selectConnectorPlaceholder')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  tooltipProps={{
                    dataTooltipId: 'gcpInfraConnector'
                  }}
                  multiTypeProps={{ expressions }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  enableConfigureOptions={false}
                  style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-medium)' }}
                  type={'Gcp'}
                  onChange={(value: any, _valueType, type) => {
                    if (type === MultiTypeInputType.FIXED && value.record) {
                      const { record, scope } = (value as unknown) as { record: ConnectorReferenceDTO; scope: Scope }
                      const connectorRef =
                        scope === Scope.ORG || scope === Scope.ACCOUNT
                          ? `${scope}.${record.identifier}`
                          : record.identifier
                      refetchClusterNames({
                        queryParams: {
                          accountIdentifier: accountId,
                          projectIdentifier,
                          orgIdentifier,
                          connectorRef
                        }
                      })
                    } else {
                      setClusterOptions([])
                    }

                    // NOTE: clear cluster on connector change
                    // formik.setFieldValue('cluster', '')
                  }}
                  gitScope={{ repo: repoIdentifier || '', branch }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('Gcp')}></Icon>
                        <Text>{getString('pipelineSteps.gcpConnectorLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="dockerConnector"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTypeInput
                  name="cluster"
                  tooltipProps={{
                    dataTooltipId: 'gcpInfraCluster'
                  }}
                  className={css.inputWidth}
                  selectItems={clusterOptions}
                  disabled={loadingClusterNames || readonly}
                  placeholder={
                    loadingClusterNames
                      ? getString('loading')
                      : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
                  }
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: clusterOptions,
                      itemRenderer: itemRenderer,
                      allowCreatingNewItems: true
                    }
                  }}
                  label={getString('common.cluster')}
                />
                {getMultiTypeFromValue(getClusterValue(formik.values.cluster)) === MultiTypeInputType.RUNTIME &&
                  !readonly && (
                    <ConfigureOptions
                      value={getClusterValue(formik.values.cluster)}
                      type="String"
                      variableName="cluster"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('cluster', value)
                      }}
                    />
                  )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTextInput
                  name="namespace"
                  tooltipProps={{
                    dataTooltipId: 'gcpInfraNamespace'
                  }}
                  className={css.inputWidth}
                  label={getString('common.namespace')}
                  placeholder={getString('cd.steps.common.namespacePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly } }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.namespace) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.namespace as string}
                    type="String"
                    variableName="namespace"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('namespace', value)
                    }}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTextInput
                  name="releaseName"
                  tooltipProps={{
                    dataTooltipId: 'gcpInfraReleasename'
                  }}
                  className={css.inputWidth}
                  label={getString('common.releaseName')}
                  placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly } }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.releaseName) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.releaseName as string}
                    type="String"
                    variableName="releaseName"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('releaseName', value)
                    }}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'gcpInfraAllowSimultaneousDeployments'
                  }}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

const GcpInfrastructureSpecInputForm: React.FC<GcpInfrastructureSpecEditableProps & { path: string }> = ({
  onUpdate,
  initialValues,
  template,
  readonly = false,
  path
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [clusterOptions, setClusterOptions] = useState<SelectOption[]>([])
  const connectorRef = getIdentifierFromValue(initialValues.connectorRef || '')
  const initialScope = getScopeFromValue(initialValues.connectorRef || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorRef,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(initialValues?.connectorRef) !== MultiTypeInputType.RUNTIME
    ) {
      refetch()
      refetchClusterNames({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          connectorRef: initialValues.connectorRef
        }
      })
    }
  }, [initialValues.connectorRef])

  let connectorSelected: ConnectorReferenceFieldProps['selected'] = undefined
  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED
  ) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    connectorSelected = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }
  const { getString } = useStrings()

  const {
    data: clusterNamesData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames
  } = useGetClusterNamesForGcp({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options = clusterNamesData?.data?.clusterNames?.map(name => ({ label: name, value: name })) || []
    setClusterOptions(options)
  }, [clusterNamesData])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loadingClusterNames}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <Layout.Vertical padding="medium" spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <ConnectorReferenceField
          accountIdentifier={accountId}
          selected={connectorSelected}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          name="connectorRef"
          label={getString('connector')}
          placeholder={loading ? getString('loading') : getString('cd.steps.common.selectConnectorPlaceholder')}
          disabled={readonly || loading}
          type={'Gcp'}
          onChange={(record, scope) => {
            const connectorRefValue =
              scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier

            onUpdate?.({
              ...initialValues,
              connectorRef: connectorRefValue
            })

            refetchClusterNames({
              queryParams: {
                accountIdentifier: accountId,
                projectIdentifier,
                orgIdentifier,
                connectorRef: connectorRefValue
              }
            })
          }}
          gitScope={{ repo: repoIdentifier || '', branch }}
        />
      )}
      {getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME && (
        <FormInput.Select
          name={`${path}.cluster`}
          disabled={loadingClusterNames}
          placeholder={
            loadingClusterNames ? getString('loading') : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
          }
          items={clusterOptions}
          label={getString('common.cluster')}
          selectProps={{
            itemRenderer: itemRenderer,
            allowCreatingNewItems: true
          }}
          onChange={(_, event) => {
            event?.stopPropagation()
          }}
          value={
            loadingClusterNames
              ? { label: getString('loading'), value: getString('loading') }
              : initialValues?.cluster
              ? {
                  label: initialValues?.cluster,
                  value: initialValues?.cluster
                }
              : { label: '', value: '' }
          }
        />
      )}
      {getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.namespace`}
          label={getString('common.namespace')}
          disabled={readonly}
          placeholder={getString('cd.steps.common.namespacePlaceholder')}
        />
      )}
      {getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.releaseName`}
          label={getString('common.releaseName')}
          disabled={readonly}
          placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
        />
      )}
    </Layout.Vertical>
  )
}

const GcpInfrastructureSpecVariablesForm: React.FC<GcpInfrastructureSpecEditableProps> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
    />
  ) : null
}

interface GcpInfrastructureSpecStep extends K8sGcpInfrastructure {
  name?: string
  identifier?: string
}

const KubernetesGcpConnectorRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const KubernetesGcpClusterRegex = /^.+infrastructure\.infrastructureDefinition\.spec\.cluster$/
const KubernetesGcpType = 'KubernetesGcp'
export class GcpInfrastructureSpec extends PipelineStep<GcpInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.KubernetesGcp
  protected defaultValues: K8sGcpInfrastructure = {}

  protected stepIcon: IconName = 'service-gcp'
  protected stepName = 'Specify your GCP Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(KubernetesGcpConnectorRegex, this.getConnectorsListForYaml.bind(this))
    this.invocationMap.set(KubernetesGcpClusterRegex, this.getClusterListForYaml.bind(this))

    this._hasStepVariables = true
  }

  protected getConnectorsListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj?.type === KubernetesGcpType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Gcp'], filterType: 'Connector' }
        }).then(response => {
          const data =
            response?.data?.content?.map(connector => ({
              label: getConnectorName(connector),
              insertText: getConnectorValue(connector),
              kind: CompletionItemKind.Field
            })) || []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  protected getClusterListForYaml(
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    const { accountId, projectIdentifier, orgIdentifier } = params as {
      accountId: string
      orgIdentifier: string
      projectIdentifier: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.cluster', ''))
      if (
        obj?.type === KubernetesGcpType &&
        obj?.spec?.connectorRef &&
        getMultiTypeFromValue(obj.spec?.connectorRef) === MultiTypeInputType.FIXED
      ) {
        return getClusterNamesForGcpPromise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            connectorRef: obj.spec?.connectorRef
          }
        }).then(response => {
          const data =
            response?.data?.clusterNames?.map(clusterName => ({
              label: clusterName,
              insertText: clusterName,
              kind: CompletionItemKind.Field
            })) || []
          return data
        })
      }
    }

    return new Promise(resolve => {
      resolve([])
    })
  }

  validateInputSet(
    data: K8sGcpInfrastructure,
    template?: K8sGcpInfrastructureTemplate,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<K8sGcpInfrastructure> {
    const errors: K8sGcpInfrastructureTemplate = {}
    if (isEmpty(data.cluster) && getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (isEmpty(data.cluster) && getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME) {
      errors.cluster = getString?.('fieldRequired', { field: getString('common.cluster') })
    }
    if (isEmpty(data.namespace) && getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME) {
      errors.namespace = getString?.('fieldRequired', { field: getString('common.namespace') })
    }
    if (isEmpty(data.releaseName) && getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME) {
      errors.releaseName = getString?.('fieldRequired', { field: getString('common.releaseName') })
    }
    return errors
  }

  renderStep(props: StepProps<K8sGcpInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <GcpInfrastructureSpecInputForm
          {...(customStepProps as GcpInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <GcpInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as GcpInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <GcpInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as GcpInfrastructureSpecEditableProps)}
        initialValues={initialValues}
      />
    )
  }
}
