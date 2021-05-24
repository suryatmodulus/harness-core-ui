import React from 'react'
import {
  IconName,
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import type { FormikErrors } from 'formik'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  K8SDirectInfrastructure,
  useGetConnector,
  ConnectorInfoDTO,
  getConnectorListV2Promise,
  ConnectorResponse
} from 'services/cd-ng'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
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
import css from './KubernetesInfraSpec.module.scss'

const logger = loggerFor(ModuleName.CD)
type K8SDirectInfrastructureTemplate = { [key in keyof K8SDirectInfrastructure]: string }
interface KubernetesInfraSpecEditableProps {
  initialValues: K8SDirectInfrastructure
  onUpdate?: (data: K8SDirectInfrastructure) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: K8SDirectInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8SDirectInfrastructure
}

const namespaceRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/
const releaseNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/

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

const KubernetesInfraSpecEditable: React.FC<KubernetesInfraSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  const onMountRef = React.useRef<boolean>(false)
  const validationSchema = Yup.object().shape({
    connectorRef: Yup.string().required(getString?.('fieldRequired', { field: getString('connector') })),
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
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validate={value => {
          const data: K8SDirectInfrastructure = {
            namespace: value.namespace,
            releaseName: value.releaseName,
            connectorRef: undefined,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments,
            infrastructureKey: value.infrastructureKey
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
            formik.setTouched({ connectorRef: true, namespace: true, releaseName: true })
          }
          return (
            <FormikForm>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  tooltipProps={{
                    dataTooltipId: 'k8InfraConnector'
                  }}
                  placeholder={getString('cd.steps.common.selectConnectorPlaceholder')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, disabled: readonly }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-small)' }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('K8sCluster')}></Icon>
                        <Text>{getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}</Text>
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
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormInput.MultiTextInput
                  name="namespace"
                  tooltipProps={{
                    dataTooltipId: 'k8InfraNamespace'
                  }}
                  className={css.inputWidth}
                  disabled={readonly}
                  label={getString('common.namespace')}
                  placeholder={getString('cd.steps.common.namespacePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly } }}
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
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormInput.MultiTextInput
                  name="releaseName"
                  tooltipProps={{
                    dataTooltipId: 'k8InfraReleaseName'
                  }}
                  className={css.inputWidth}
                  label={getString('common.releaseName')}
                  disabled={readonly}
                  placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly } }}
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
                <FormInput.MultiTextInput
                  name="infrastructureKey"
                  tooltipProps={{
                    dataTooltipId: 'k8InfraKey'
                  }}
                  className={css.inputWidth}
                  label={getString('pipeline.infrastructureKey')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    textProps: { disabled: readonly },
                    defaultValue:
                      '<+EnvironmentRef>_<+infrastructure.connectorRef>_<+infra.namespace>_<service.serviceId>'
                  }}
                />
                {getMultiTypeFromValue(formik.values.infrastructureKey) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.infrastructureKey as string}
                    type="String"
                    variableName="infrastructureKey"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('infrastructureKey', value)
                    }}
                  />
                )}
              </Layout.Horizontal>

              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  tooltipProps={{
                    dataTooltipId: 'k8InfraAllowSimultaneousDeployments'
                  }}
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

const KubernetesInfraSpecInputForm: React.FC<KubernetesInfraSpecEditableProps & { path: string }> = ({
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

  React.useEffect(() => {
    if (
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(initialValues?.connectorRef) !== MultiTypeInputType.RUNTIME
    ) {
      refetch()
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
          onChange={(record, scope) => {
            onUpdate?.({
              ...initialValues,
              connectorRef:
                scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
            })
          }}
        />
      )}
      {getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.namespace`}
          label={getString('common.namespace')}
          disabled={readonly}
          className={css.inputWidth}
          placeholder={getString('cd.steps.common.namespacePlaceholder')}
        />
      )}
      {getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.releaseName`}
          label={getString('common.releaseName')}
          disabled={readonly}
          className={css.inputWidth}
          placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
        />
      )}
    </Layout.Vertical>
  )
}

const KubernetesInfraSpecVariablesForm: React.FC<KubernetesInfraSpecEditableProps> = ({
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

interface K8SDirectInfrastructureStep extends K8SDirectInfrastructure {
  name?: string
  identifier?: string
}
const KubernetesDirectRegex = /^.+stage\.spec\.infrastructure\.infrastructureDefinition\.spec\.connectorRef$/
const KubernetesDirectType = 'KubernetesDirect'
export class KubernetesInfraSpec extends PipelineStep<K8SDirectInfrastructureStep> {
  lastFetched: number
  protected type = StepType.KubernetesDirect
  protected defaultValues: K8SDirectInfrastructure = {}

  protected stepIcon: IconName = 'service-kubernetes'
  protected stepName = 'Specify your Kubernetes Connector'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this.invocationMap.set(KubernetesDirectRegex, this.getConnectorsListForYaml.bind(this))

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
      if (obj.type === KubernetesDirectType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['K8sCluster', 'Gcp', 'Aws'], filterType: 'Connector' }
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

  validateInputSet(
    data: K8SDirectInfrastructure,
    template?: K8SDirectInfrastructureTemplate,
    getString?: UseStringsReturn['getString']
  ): FormikErrors<K8SDirectInfrastructure> {
    const errors: K8SDirectInfrastructureTemplate = {}
    if (isEmpty(data.cluster) && getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (isEmpty(data.namespace) && getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME) {
      errors.namespace = getString?.('fieldRequired', { field: 'Namespace' })
    }
    if (isEmpty(data.releaseName) && getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME) {
      errors.releaseName = getString?.('fieldRequired', { field: 'Release Name' })
    }
    return errors
  }

  renderStep(props: StepProps<K8SDirectInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly = false } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <KubernetesInfraSpecInputForm
          {...(customStepProps as KubernetesInfraSpecEditableProps)}
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
        <KubernetesInfraSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as KubernetesInfraSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <KubernetesInfraSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        stepViewType={stepViewType}
        {...(customStepProps as KubernetesInfraSpecEditableProps)}
        initialValues={initialValues}
      />
    )
  }
}
