import React, { useEffect, useState } from 'react'
import { Menu } from '@blueprintjs/core'
import {
  IconName,
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  SelectOption
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get, memoize } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { FormikErrors, yupToFormErrors } from 'formik'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
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

import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

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
import { getNameSpaceSchema, getReleaseNameSchema } from '../PipelineStepsUtil'
import css from './GcpInfrastructureSpec.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const logger = loggerFor(ModuleName.CD)
type K8sGcpInfrastructureTemplate = { [key in keyof K8sGcpInfrastructure]: string }

function getValidationSchema(getString: UseStringsReturn['getString']): Yup.ObjectSchema {
  return Yup.object().shape({
    connectorRef: Yup.string().required(getString?.('fieldRequired', { field: getString('connector') })),
    cluster: Yup.lazy(
      (value): Yup.Schema<unknown> => {
        /* istanbul ignore else */ if (typeof value === 'string') {
          return Yup.string().required(getString('common.cluster'))
        }
        return Yup.object().test({
          test(valueObj: SelectOption): boolean | Yup.ValidationError {
            if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
              return this.createError({ message: getString('fieldRequired', { field: getString('common.cluster') }) })
            }
            return true
          }
        })
      }
    ),

    namespace: getNameSpaceSchema(getString),
    releaseName: getReleaseNameSchema(getString)
  })
}
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
      : /* istanbul ignore next */ connector?.connector?.orgIdentifier
      ? `${Scope.ORG}.${connector?.connector?.identifier}`
      : `${Scope.ACCOUNT}.${connector?.connector?.identifier}`
  }` || /* istanbul ignore next */ ''

const getConnectorName = (connector?: ConnectorResponse): string =>
  `${
    connector?.connector?.orgIdentifier && connector?.connector?.projectIdentifier
      ? `${connector?.connector?.type}: ${connector?.connector?.name}`
      : /* istanbul ignore next */ connector?.connector?.orgIdentifier
      ? `${connector?.connector?.type}[Org]: ${connector?.connector?.name}`
      : `${connector?.connector?.type}[Account]: ${connector?.connector?.name}`
  }` || /* istanbul ignore next */ ''

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

  const {
    data: clusterNamesData,
    refetch: refetchClusterNames,
    loading: loadingClusterNames
  } = useGetClusterNamesForGcp({
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    const options =
      clusterNamesData?.data?.clusterNames?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
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
      <Menu.Item text={item.label} disabled={loadingClusterNames} onClick={handleClick} />
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

  return (
    <Layout.Vertical spacing="medium">
      <Formik<K8sGcpInfrastructureUI>
        enableReinitialize
        formName="gcpInfra"
        initialValues={getInitialValues()}
        validate={value => {
          const data: Partial<K8sGcpInfrastructure> = {
            namespace: value.namespace,
            releaseName: value.releaseName,
            connectorRef: undefined,
            cluster: getClusterValue(value.cluster),
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          /* istanbul ignore else */ if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || /* istanbul ignore next */ value.connectorRef
          }
          delayedOnUpdate(data)
        }}
        validationSchema={getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
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
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
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
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                    isReadonly={readonly}
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
                      ? /* istanbul ignore next */ getString('loading')
                      : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
                  }
                  multiTypeInputProps={{
                    expressions,
                    disabled: readonly,
                    selectProps: {
                      items: clusterOptions,
                      itemRenderer: itemRenderer,
                      allowCreatingNewItems: true,
                      addClearBtn: !(loadingClusterNames || readonly)
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
                      isReadonly={readonly}
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
                    isReadonly={readonly}
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
                    isReadonly={readonly}
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
  template,
  initialValues,
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
  const { expressions } = useVariablesExpression()

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
    const options =
      clusterNamesData?.data?.clusterNames?.map(name => ({ label: name, value: name })) || /* istanbul ignore next */ []
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
    } else {
      setClusterOptions([])
    }
  }, [initialValues.connectorRef])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item text={item.label} disabled={loadingClusterNames} onClick={handleClick} />
    </div>
  ))

  return (
    <Layout.Vertical padding="medium" spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'gcpInfraConnector'
            }}
            name={`${path}.connectorRef`}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('cd.steps.common.selectConnectorPlaceholder')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED], expressions }}
            type={'Gcp'}
            setRefValue
            onChange={(selected, _typeValue, type) => {
              const item = (selected as unknown) as { record?: ConnectorReferenceDTO; scope: Scope }
              if (type === MultiTypeInputType.FIXED) {
                const connectorRefValue =
                  item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                    ? `${item.scope}.${item?.record?.identifier}`
                    : item.record?.identifier
                refetchClusterNames({
                  queryParams: {
                    accountIdentifier: accountId,
                    projectIdentifier,
                    orgIdentifier,
                    connectorRef: connectorRefValue
                  }
                })
              } else {
                setClusterOptions([])
              }
            }}
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={`${path}.cluster`}
            disabled={loadingClusterNames || readonly}
            placeholder={
              loadingClusterNames
                ? /* istanbul ignore next */ getString('loading')
                : getString('cd.steps.common.selectOrEnterClusterPlaceholder')
            }
            useValue
            selectItems={clusterOptions}
            label={getString('common.cluster')}
            multiTypeInputProps={{
              selectProps: {
                items: clusterOptions,
                itemRenderer: itemRenderer,
                allowCreatingNewItems: true,
                addClearBtn: !(loadingClusterNames || readonly)
              },
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.namespace`}
            label={getString('common.namespace')}
            disabled={readonly}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
              expressions
            }}
            placeholder={getString('cd.steps.common.namespacePlaceholder')}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.releaseName`}
            multiTextInputProps={{
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
              expressions
            }}
            label={getString('common.releaseName')}
            disabled={readonly}
            placeholder={getString('cd.steps.common.releaseNamePlaceholder')}
          />
        </div>
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
    /* istanbul ignore next */ <VariablesListTable
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
  protected defaultValues: K8sGcpInfrastructure = { cluster: '', connectorRef: '', namespace: '', releaseName: '' }

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
      /* istanbul ignore next */ logger.error('Error while parsing the yaml', err)
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
            })) || /* istanbul ignore next */ []
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
      /* istanbul ignore next */ logger.error('Error while parsing the yaml', err)
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
            })) || /* istanbul ignore next */ []
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
    const errors: Partial<K8sGcpInfrastructureTemplate> = {}
    if (isEmpty(data.connectorRef) && getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME) {
      errors.connectorRef = getString?.('fieldRequired', { field: getString('connector') })
    }
    if (isEmpty(data.cluster) && getMultiTypeFromValue(template?.cluster) === MultiTypeInputType.RUNTIME) {
      errors.cluster = getString?.('fieldRequired', { field: getString('common.cluster') })
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME
    ) {
      const namespace = Yup.object().shape({
        namespace: getNameSpaceSchema(getString)
      })

      try {
        namespace.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */ if (
      getString &&
      getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME
    ) {
      const releaseName = Yup.object().shape({
        releaseName: getReleaseNameSchema(getString)
      })

      try {
        releaseName.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
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
