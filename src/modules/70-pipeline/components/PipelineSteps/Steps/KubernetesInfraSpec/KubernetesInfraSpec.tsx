import React from 'react'
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
  Icon
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty, get } from 'lodash-es'
import { parse } from 'yaml'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { StepViewType, StepProps } from '@pipeline/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
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
import { getIconByType } from '@connectors/exports'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { CopyText } from '@common/components/CopyText/CopyText'
import { toVariableStr } from '@common/utils/StringUtils'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor, ModuleName, UseStringsReturn } from 'framework/exports'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import i18n from './KubernetesInfraSpec.18n'
import css from './KubernetesInfraSpec.module.scss'
import variableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

const logger = loggerFor(ModuleName.CD)
type K8SDirectInfrastructureTemplate = { [key in keyof K8SDirectInfrastructure]: string }
interface KubernetesInfraSpecEditableProps {
  initialValues: K8SDirectInfrastructure
  onUpdate?: (data: K8SDirectInfrastructure) => void
  stepViewType?: StepViewType
  template?: K8SDirectInfrastructureTemplate
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8SDirectInfrastructure
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
      ? connector?.connector?.name
      : connector?.connector?.orgIdentifier
      ? `Org -> ${connector?.connector?.name}`
      : `Account -> ${connector?.connector?.name}`
  }` || ''

const KubernetesInfraSpecEditable: React.FC<KubernetesInfraSpecEditableProps> = ({
  initialValues,
  onUpdate
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current

  return (
    <Layout.Vertical spacing="medium">
      <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15 }}>{i18n.stepName}</Text>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validate={value => {
          const data: K8SDirectInfrastructure = {
            namespace: value.namespace,
            releaseName: value.releaseName,
            connectorRef: undefined
          }
          if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || value.connectorRef
          }
          delayedOnUpdate(data)
        }}
        onSubmit={noop}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={i18n.k8ConnectorDropDownLabel}
                  placeholder={i18n.k8ConnectorDropDownPlaceholder}
                  // disabled={loading}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-small)' }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('K8sCluster')}></Icon>
                        <Text>{i18n.kubernetesConnector}</Text>
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
                  className={css.inputWidth}
                  label={i18n.nameSpaceLabel}
                  placeholder={i18n.nameSpacePlaceholder}
                />
                {getMultiTypeFromValue(formik.values.namespace) === MultiTypeInputType.RUNTIME && (
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
                  className={css.inputWidth}
                  label={i18n.releaseName}
                  placeholder={i18n.releaseNamePlaceholder}
                />
                {getMultiTypeFromValue(formik.values.releaseName) === MultiTypeInputType.RUNTIME && (
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
          label={i18n.k8ConnectorDropDownLabel}
          placeholder={loading ? i18n.loading : i18n.k8ConnectorDropDownPlaceholder}
          disabled={loading}
          onChange={(record, scope) => {
            onUpdate?.({
              ...initialValues,
              connectorRef:
                scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
            })
          }}
        />
      )}
      {getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.releaseName`}
          label={i18n.releaseName}
          placeholder={i18n.releaseNamePlaceholder}
        />
      )}
      {getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.namespace`}
          label={i18n.nameSpaceLabel}
          placeholder={i18n.nameSpacePlaceholder}
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
    <>
      <div className={variableCss.variableListTable} key="connectorRef">
        <div>
          <CopyText textToCopy={metadataMap?.[infraVariables?.connectorRef]?.yamlProperties?.fqn || ''}>
            {toVariableStr(metadataMap?.[infraVariables?.connectorRef]?.yamlProperties?.localName || '')}
          </CopyText>
          <Text>String</Text>
          <Text lineClamp={2} width={280}>
            {initialValues.connectorRef}
          </Text>
        </div>
      </div>
      <div className={variableCss.variableListTable} key="namespace">
        <>
          <CopyText textToCopy={metadataMap?.[infraVariables?.namespace]?.yamlProperties?.fqn || ''}>
            {toVariableStr(metadataMap?.[infraVariables?.namespace]?.yamlProperties?.localName || '')}
          </CopyText>
          <Text>String</Text>
          <Text lineClamp={2} width={280}>
            {initialValues.namespace}
          </Text>
        </>
      </div>
      <div className={variableCss.variableListTable} key="releaseName">
        <>
          <CopyText textToCopy={metadataMap?.[infraVariables?.releaseName]?.yamlProperties?.fqn || ''}>
            {toVariableStr(metadataMap?.[infraVariables?.releaseName]?.yamlProperties?.localName || '')}
          </CopyText>
          <Text>String</Text>
          <Text lineClamp={2} width={280}>
            {initialValues.releaseName}
          </Text>
        </>
      </div>
    </>
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
  protected stepName: string = i18n.stepName
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
    const { accountId } = params as {
      accountId: string
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj.type === KubernetesDirectType) {
        return getConnectorListV2Promise({
          queryParams: { accountIdentifier: accountId },
          body: { types: ['K8sCluster'] }
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
  ): object {
    const errors: K8SDirectInfrastructureTemplate = {}
    if (isEmpty(data.namespace) && getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME) {
      errors.namespace = getString?.('fieldRequired', { field: 'Namespace' })
    }
    if (isEmpty(data.releaseName) && getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME) {
      errors.releaseName = getString?.('fieldRequired', { field: 'Release Name' })
    }
    return errors
  }

  renderStep(props: StepProps<K8SDirectInfrastructure>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <KubernetesInfraSpecInputForm
          {...(customStepProps as KubernetesInfraSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
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
        stepViewType={stepViewType}
        {...(customStepProps as KubernetesInfraSpecEditableProps)}
        initialValues={initialValues}
      />
    )
  }
}
