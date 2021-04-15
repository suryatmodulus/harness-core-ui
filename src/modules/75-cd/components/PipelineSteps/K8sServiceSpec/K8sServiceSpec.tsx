import React from 'react'
import get from 'lodash-es/get'
import isEmpty from 'lodash-es/isEmpty'
import set from 'lodash-es/set'
import produce from 'immer'
import {
  IconName,
  Layout,
  Text,
  Color,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  Icon,
  NestedAccordionPanel,
  SelectOption,
  Accordion
} from '@wings-software/uicore'

import { parse } from 'yaml'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { FormGroup, Tooltip, Menu } from '@blueprintjs/core'
import memoize from 'lodash-es/memoize'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { useGetPipeline } from 'services/pipeline-ng'
import type { PipelineType, InputSetPathProps } from '@common/interfaces/RouteInterfaces'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { StepViewType } from '@pipeline/exports'
import {
  ServiceSpec,
  NgPipeline,
  useGetBuildDetailsForDocker,
  useGetBuildDetailsForGcr,
  getConnectorListV2Promise,
  ConnectorInfoDTO,
  ConnectorResponse,
  useGetBuildDetailsForEcr
} from 'services/cd-ng'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { getStageIndexByIdentifier } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { useStrings, String, loggerFor, ModuleName, UseStringsReturn } from 'framework/exports'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { useToaster } from '@common/exports'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import { useListAwsRegions } from 'services/portal'
import type { ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { AllNGVariables } from '@pipeline/utils/types'
import { K8sServiceSpecVariablesForm, K8sServiceSpecVariablesFormProps } from './K8sServiceSpecVariablesForm'
import css from './K8sServiceSpec.module.scss'

const logger = loggerFor(ModuleName.CD)

export const ARTIFACT_TYPE_TO_CONNECTOR_MAP: { [key: string]: ConnectorInfoDTO['type'] } = {
  Dockerhub: 'DockerRegistry',
  Gcr: 'Gcp',
  Ecr: 'Aws'
}

export const getStagePathByIdentifier = memoize((stageIdentifier = '', pipeline: NgPipeline) => {
  let finalPath = ''
  if (pipeline) {
    const { stageIndex, parallelStageIndex } = getStageIndexByIdentifier(pipeline, stageIdentifier)
    finalPath =
      parallelStageIndex > -1 ? `stages[${stageIndex}].parallel[${parallelStageIndex}]` : `stages[${stageIndex}]`
  }

  return finalPath
})

export const getNonRuntimeFields = (spec: { [key: string]: any } = {}, template: { [key: string]: any }): string => {
  const fields: { [key: string]: any } = {}

  Object.entries(spec).forEach(([key]): void => {
    if (getMultiTypeFromValue(template?.[key]) !== MultiTypeInputType.RUNTIME) {
      fields[key] = spec[key]
    }
  })
  return JSON.stringify(fields, null, 2)
}
const tagExists = (value: unknown): boolean => typeof value === 'number' || !isEmpty(value)
export interface LastQueryData {
  path?: string
  imagePath?: string
  connectorRef?: string
  connectorType?: string
  registryHostname?: string
  region?: string
}
interface KubernetesServiceInputFormProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
}

const setupMode = {
  PROPAGATE: 'PROPAGATE',
  DIFFERENT: 'DIFFERENT'
}
const KubernetesServiceSpecEditable: React.FC<KubernetesServiceInputFormProps> = ({
  initialValues: { stageIndex = 0, setupModeType },
  factory,
  readonly
}) => {
  const { getString } = useStrings()
  const isPropagating = stageIndex > 0 && setupModeType === setupMode.PROPAGATE
  return (
    <div className={css.serviceDefinition}>
      <Accordion
        className={css.cardSection}
        activeId={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
      >
        <Accordion.Panel
          id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
          addDomId={true}
          summary={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
          details={<ManifestSelection isPropagating={isPropagating} />}
        />
      </Accordion>

      <Accordion
        className={css.cardSection}
        activeId={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
      >
        <Accordion.Panel
          id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
          addDomId={true}
          summary={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
          details={<ArtifactsSelection isPropagating={isPropagating} />}
        />
      </Accordion>

      <Accordion className={css.cardSection} activeId={getString('variablesText')}>
        <Accordion.Panel
          id={getString('variablesText')}
          addDomId={true}
          summary={getString('variablesText')}
          details={<WorkflowVariables factory={factory as any} isPropagating={isPropagating} readonly={readonly} />}
        />
      </Accordion>
    </div>
  )
}

const KubernetesServiceSpecInputForm: React.FC<KubernetesServiceInputFormProps> = ({
  template,
  path,
  factory,
  initialValues,
  onUpdate,
  readonly = false,
  stageIdentifier
}) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const [pipeline, setPipeline] = React.useState<{ pipeline: NgPipeline } | undefined>()
  const [tagListMap, setTagListMap] = React.useState<{ [key: string]: {}[] | {} }>({ sidecars: [], primary: {} })
  const [lastQueryData, setLastQueryData] = React.useState<LastQueryData>({})
  const { data: pipelineResponse } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })
  const {
    data: dockerdata,
    loading: dockerLoading,
    refetch: refetchDockerBuildData,
    error: dockerError
  } = useGetBuildDetailsForDocker({
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: lastQueryData.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const {
    data: gcrdata,
    loading: gcrLoading,
    refetch: refetchGcrBuildData,
    error: gcrError
  } = useGetBuildDetailsForGcr({
    queryParams: {
      imagePath: lastQueryData.imagePath || '',
      connectorRef: lastQueryData.connectorRef || '',
      registryHostname: lastQueryData.registryHostname || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  const {
    data: ecrdata,
    loading: ecrLoading,
    refetch: refetchEcrBuildData,
    error: ecrError
  } = useGetBuildDetailsForEcr({
    queryParams: {
      imagePath: lastQueryData.imagePath || '',
      connectorRef: lastQueryData.connectorRef || '',
      region: lastQueryData.region || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  React.useEffect(() => {
    if (pipelineResponse?.data?.yamlPipeline) {
      setPipeline(parse(pipelineResponse?.data?.yamlPipeline))
    }
  }, [pipelineResponse?.data?.yamlPipeline])

  React.useEffect(() => {
    if (gcrError || dockerError) {
      showError(getString('errorTag'))
      return
    }
    if (Array.isArray(dockerdata?.data?.buildDetailsList)) {
      let tagList: any[] = dockerdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    } else if (Array.isArray(gcrdata?.data?.buildDetailsList)) {
      let tagList: any[] = gcrdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    } else if (Array.isArray(ecrdata?.data?.buildDetailsList)) {
      let tagList: any[] = ecrdata?.data?.buildDetailsList as []
      tagList = tagList?.map(({ tag }: { tag: string }) => ({ label: tag, value: tag }))
      setTagListMap(
        produce(tagListMap, draft => {
          set(draft, `${lastQueryData.path}.tags`, tagList)
        })
      )
    }
  }, [
    dockerdata?.data?.buildDetailsList,
    dockerError,
    gcrdata?.data?.buildDetailsList,
    gcrError,
    ecrdata?.data?.buildDetailsList,
    ecrError
  ])
  React.useEffect(() => {
    if (lastQueryData.connectorRef) {
      switch (lastQueryData.connectorType) {
        case 'Dockerhub':
          refetchDockerBuildData()
          break
        case 'Gcr':
          refetchGcrBuildData()
          break
        case 'Ecr':
          refetchEcrBuildData()
          break
      }
    }
  }, [lastQueryData])
  const getSelectItems = (tagsPath: string): SelectOption[] => {
    return get(tagListMap, `${tagsPath}.tags`, []) as SelectOption[]
  }

  const fetchTags = ({
    path: tagsPath = '',
    imagePath = '',
    connectorRef = '',
    connectorType = '',
    registryHostname,
    region
  }: LastQueryData): void => {
    if (connectorType === 'Dockerhub') {
      if (
        imagePath?.length &&
        connectorRef?.length &&
        (lastQueryData?.imagePath !== imagePath ||
          lastQueryData?.connectorRef !== connectorRef ||
          lastQueryData.path !== tagsPath)
      ) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, registryHostname })
      }
    } else if (connectorType === 'Gcr') {
      if (
        imagePath?.length &&
        connectorRef?.length &&
        registryHostname?.length &&
        (lastQueryData?.imagePath !== imagePath ||
          lastQueryData?.connectorRef !== connectorRef ||
          lastQueryData?.registryHostname !== registryHostname ||
          lastQueryData.path !== tagsPath)
      ) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, registryHostname })
      }
    } else {
      if (
        imagePath?.length &&
        connectorRef?.length &&
        region?.length &&
        (lastQueryData?.imagePath !== imagePath ||
          lastQueryData?.connectorRef !== connectorRef ||
          lastQueryData?.region !== region ||
          lastQueryData.path !== tagsPath)
      ) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, region })
      }
    }
  }

  const stagePath = pipeline ? getStagePathByIdentifier(stageIdentifier, pipeline?.pipeline) : ''

  const artifacts = get(pipeline, `pipeline.${stagePath}.stage.spec.serviceConfig.serviceDefinition.spec.artifacts`, {})

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={dockerLoading || gcrLoading || ecrLoading}
        onClick={handleClick}
      />
    </div>
  ))
  const isTagSelectionDisabled = (connectorType: string, index = -1): boolean => {
    let imagePath, connectorRef, registryHostname, region
    if (index > -1) {
      imagePath =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
      connectorRef =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
      registryHostname = artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
      region =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.region) !== MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.region
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.region
    } else {
      imagePath =
        getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.imagePath
          : initialValues.artifacts?.primary?.spec?.imagePath
      connectorRef =
        getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.connectorRef
          : initialValues.artifacts?.primary?.spec?.connectorRef
      registryHostname = artifacts?.primary?.spec?.registryHostname
      region =
        getMultiTypeFromValue(artifacts?.primary?.spec?.region) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.region
          : initialValues.artifacts?.primary?.spec?.region
    }
    if (connectorType === 'Dockerhub') {
      return !imagePath?.length || !connectorRef?.length
    } else if (connectorType === 'Ecr') {
      return !imagePath?.length || !connectorRef?.length || !region?.length
    } else {
      return !imagePath?.length || !connectorRef?.length || !registryHostname?.length
    }
  }
  const regions = (regionData?.resource || []).map((region: any) => ({
    value: region.value,
    label: region.name
  }))
  return (
    <Layout.Vertical spacing="medium">
      {get(template, 'artifacts', false) && (
        <NestedAccordionPanel
          panelClassName={css.nestedAccordions}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Service.Artifacts`}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts" />
            </div>
          }
          details={
            <>
              {template?.artifacts?.primary && (
                <Text className={css.sectionHeader}>
                  {getString('primaryArtifactText')}
                  {!isEmpty(
                    JSON.parse(
                      getNonRuntimeFields(
                        get(pipeline, `${path}.artifacts.primary.spec`),
                        get(template, 'artifacts.primary.spec')
                      )
                    )
                  ) && (
                    <Tooltip
                      position="top"
                      content={getNonRuntimeFields(
                        get(pipeline, `${path}.artifacts.primary.spec`),
                        get(template, 'artifacts.primary.spec')
                      )}
                    >
                      <Icon name="info" />
                    </Tooltip>
                  )}
                </Text>
              )}
              {template?.artifacts?.primary && (
                <Layout.Vertical key="primary" className={css.inputWidth}>
                  {getMultiTypeFromValue(get(template, `artifacts.primary.spec.connectorRef`, '')) ===
                    MultiTypeInputType.RUNTIME && (
                    <FormGroup
                      labelFor={'connectorRef'}
                      label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                    >
                      <ConnectorReferenceField
                        name={`connectorRef`}
                        label={''}
                        selected={get(initialValues, 'artifacts.primary.spec.connectorRef', '')}
                        placeholder={''}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        width={400}
                        disabled={readonly}
                        type={ARTIFACT_TYPE_TO_CONNECTOR_MAP[artifacts?.primary?.type] as ConnectorInfoDTO['type']}
                        onChange={(record, scope) => {
                          const connectorRef =
                            scope === Scope.ORG || scope === Scope.ACCOUNT
                              ? `${scope}.${record?.identifier}`
                              : record?.identifier
                          set(initialValues, 'artifacts.primary.spec.connectorRef', connectorRef)
                          onUpdate?.({
                            ...initialValues
                          })
                        }}
                      />
                    </FormGroup>
                  )}
                  {getMultiTypeFromValue(get(template, `artifacts.primary.spec.imagePath`, '')) ===
                    MultiTypeInputType.RUNTIME && (
                    <FormGroup labelFor="imagePath" label={getString('pipelineSteps.deploy.inputSet.imagePath')}>
                      <FormInput.Text
                        disabled={readonly}
                        style={{ width: 400 }}
                        name={`${path}.artifacts.primary.spec.imagePath`}
                      />
                    </FormGroup>
                  )}

                  {getMultiTypeFromValue(get(template, `artifacts.primary.spec.registryHostname`, '')) ===
                    MultiTypeInputType.RUNTIME && (
                    <FormGroup labelFor="registryHostname" label={getString('connectors.GCR.registryHostname')}>
                      <FormInput.Text
                        disabled={readonly}
                        style={{ width: 400 }}
                        name={`${path}.artifacts.primary.spec.registryHostname`}
                      />
                    </FormGroup>
                  )}
                  {getMultiTypeFromValue(artifacts?.primary?.spec?.region) === MultiTypeInputType.RUNTIME && (
                    <FormInput.Select
                      selectProps={{
                        usePortal: true,
                        addClearBtn: true && !readonly
                      }}
                      disabled={readonly}
                      value={
                        initialValues?.artifacts?.primary?.spec?.region
                          ? {
                              label: initialValues?.artifacts?.primary?.spec?.region,
                              value: initialValues?.artifacts?.primary?.spec?.region
                            }
                          : { label: '', value: '' }
                      }
                      items={regions}
                      label={getString('pipelineSteps.regionLabel')}
                      name={`${path}.artifacts.primary.spec.region`}
                    />
                  )}
                  {getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME && (
                    <div
                      onClick={() => {
                        const imagePath =
                          getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
                            ? artifacts?.primary?.spec?.imagePath
                            : initialValues.artifacts?.primary?.spec?.imagePath
                        const connectorRef =
                          getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
                            ? artifacts?.primary?.spec?.connectorRef
                            : initialValues.artifacts?.primary?.spec?.connectorRef
                        const tagsPath = `primary`
                        !isTagSelectionDisabled(artifacts?.primary?.type) &&
                          fetchTags({
                            path: tagsPath,
                            imagePath,
                            connectorRef,
                            connectorType: artifacts?.primary?.type,
                            registryHostname: artifacts?.primary?.spec?.registryHostname,
                            region: artifacts?.primary?.spec?.region
                          })
                      }}
                    >
                      <FormInput.Select
                        disabled={readonly || isTagSelectionDisabled(artifacts?.primary?.type)}
                        items={
                          dockerLoading || gcrLoading || ecrLoading
                            ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                            : getSelectItems('primary')
                        }
                        selectProps={{
                          usePortal: true,
                          addClearBtn: !(readonly || isTagSelectionDisabled(artifacts?.primary?.type)),
                          noResults: (
                            <span className={css.padSmall}>{getString('pipelineSteps.deploy.errors.notags')}</span>
                          ),
                          itemRenderer: itemRenderer,
                          allowCreatingNewItems: true,
                          popoverClassName: css.selectPopover
                        }}
                        value={
                          initialValues?.artifacts?.primary?.spec?.tag
                            ? {
                                label: initialValues?.artifacts?.primary?.spec?.tag,
                                value: initialValues?.artifacts?.primary?.spec?.tag
                              }
                            : { label: '', value: '' }
                        }
                        label={getString('tagLabel')}
                        name={`${path}.artifacts.primary.spec.tag`}
                      />
                    </div>
                  )}
                  {getMultiTypeFromValue(artifacts?.primary?.spec?.tagRegex) === MultiTypeInputType.RUNTIME && (
                    <FormInput.Text
                      disabled={readonly}
                      label={getString('tagRegex')}
                      name={`${path}.artifacts.primary.spec.tagRegex`}
                    />
                  )}
                </Layout.Vertical>
              )}

              {template?.artifacts?.sidecars?.length && (
                <Text className={css.sectionHeader}>{getString('sidecarArtifactText')}</Text>
              )}
              {template?.artifacts?.sidecars?.map(
                (
                  {
                    sidecar: {
                      identifier = '',
                      spec: { connectorRef = '', imagePath = '', registryHostname = '' } = {}
                    } = {}
                  }: any,
                  index: number
                ) => {
                  const currentSidecarSpec = initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec
                  return (
                    <Layout.Vertical key={identifier} className={css.inputWidth}>
                      <Text className={css.subSectonHeader}>
                        {identifier}
                        {!isEmpty(
                          JSON.parse(
                            getNonRuntimeFields(
                              get(pipeline, `${path}.artifacts.sidecars[${index}].sidecar.spec`),
                              get(template, 'artifacts.primary.spec')
                            )
                          )
                        ) && (
                          <Tooltip
                            position="top"
                            content={getNonRuntimeFields(
                              get(pipeline, `${path}.artifacts.sidecars[${index}].sidecar.spec`),
                              get(template, `artifacts.sidecars[${index}].sidecar.spec`)
                            )}
                          >
                            <Icon name="info" />
                          </Tooltip>
                        )}
                      </Text>
                      {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                        <FormGroup
                          labelFor={'connectorRef'}
                          label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                        >
                          <ConnectorReferenceField
                            name={`${path}.artifacts.sidecars[${index}].sidecar.spec.connectorRef`}
                            selected={get(initialValues, `artifacts.sidecars[${index}].sidecar.spec.connectorRef`, '')}
                            label={''}
                            placeholder={''}
                            disabled={readonly}
                            accountIdentifier={accountId}
                            projectIdentifier={projectIdentifier}
                            orgIdentifier={orgIdentifier}
                            type={
                              ARTIFACT_TYPE_TO_CONNECTOR_MAP[
                                artifacts?.sidecars?.[index]?.sidecar?.type
                              ] as ConnectorInfoDTO['type']
                            }
                            onChange={(record, scope) => {
                              const connectorRefSelected =
                                scope === Scope.ORG || scope === Scope.ACCOUNT
                                  ? `${scope}.${record?.identifier}`
                                  : record?.identifier
                              set(
                                initialValues,
                                `artifacts.sidecars[${index}].sidecar.spec.connectorRef`,
                                connectorRefSelected
                              )
                              onUpdate?.({
                                ...initialValues
                              })
                            }}
                          />
                        </FormGroup>
                      )}
                      {getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME && (
                        <FormGroup labelFor="imagePath" label={getString('pipelineSteps.deploy.inputSet.imagePath')}>
                          <FormInput.Text
                            disabled={readonly}
                            name={`${path}.artifacts.sidecars[${index}].sidecar.spec.imagePath`}
                          />
                        </FormGroup>
                      )}
                      {getMultiTypeFromValue(registryHostname) === MultiTypeInputType.RUNTIME && (
                        <FormGroup labelFor="registryHostname" label={getString('connectors.GCR.registryHostname')}>
                          <FormInput.Text
                            disabled={readonly}
                            style={{ width: 400 }}
                            name={`${path}.artifacts.sidecars[${index}].sidecar.spec.registryHostname`}
                          />
                        </FormGroup>
                      )}
                      {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.region) ===
                        MultiTypeInputType.RUNTIME && (
                        <FormInput.Select
                          selectProps={{
                            usePortal: true,
                            addClearBtn: true && !readonly
                          }}
                          disabled={readonly}
                          value={
                            initialValues?.artifacts?.sidecars?.[index]?.sidecar?.spec?.region
                              ? {
                                  label: initialValues?.artifacts?.sidecars?.[index]?.sidecar?.spec?.region,
                                  value: initialValues?.artifacts?.sidecars?.[index]?.sidecar?.spec?.region
                                }
                              : { label: '', value: '' }
                          }
                          items={regions}
                          label={getString('pipelineSteps.regionLabel')}
                          name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.region`}
                        />
                      )}
                      {getMultiTypeFromValue(template?.artifacts?.sidecars?.[index]?.sidecar?.spec?.tag) ===
                        MultiTypeInputType.RUNTIME && (
                        <div
                          onClick={() => {
                            const imagePathCurrent =
                              getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath) !==
                              MultiTypeInputType.RUNTIME
                                ? artifacts?.sidecars?.[index]?.sidecar?.spec?.imagePath
                                : currentSidecarSpec?.imagePath
                            const connectorRefCurrent =
                              getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef) !==
                              MultiTypeInputType.RUNTIME
                                ? artifacts?.sidecars?.[index]?.sidecar?.spec?.connectorRef
                                : currentSidecarSpec?.connectorRef
                            const tagsPath = `sidecars[${index}]`
                            !isTagSelectionDisabled(artifacts?.sidecars?.[index]?.sidecar?.type, index) &&
                              fetchTags({
                                path: tagsPath,
                                imagePath: imagePathCurrent,
                                connectorRef: connectorRefCurrent,
                                connectorType: artifacts?.sidecars?.[index]?.sidecar?.type,
                                registryHostname: artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
                              })
                          }}
                        >
                          <FormInput.Select
                            disabled={
                              readonly || isTagSelectionDisabled(artifacts?.sidecars?.[index]?.sidecar?.type, index)
                            }
                            items={
                              dockerLoading || gcrLoading || ecrLoading
                                ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                                : getSelectItems(`sidecars[${index}]`)
                            }
                            selectProps={{
                              usePortal: true,
                              addClearBtn: true && !readonly,
                              noResults: (
                                <span className={css.padSmall}>{getString('pipelineSteps.deploy.errors.notags')}</span>
                              ),
                              itemRenderer: itemRenderer,
                              allowCreatingNewItems: true,
                              popoverClassName: css.selectPopover
                            }}
                            value={
                              currentSidecarSpec?.tag
                                ? { label: currentSidecarSpec.tag, value: currentSidecarSpec?.tag }
                                : { label: '', value: '' }
                            }
                            label={getString('tagLabel')}
                            name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`}
                          />
                        </div>
                      )}
                      {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.tagRegex) ===
                        MultiTypeInputType.RUNTIME && (
                        <FormInput.Text
                          disabled={readonly}
                          label={getString('tagRegex')}
                          name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.tagRegex`}
                        />
                      )}
                    </Layout.Vertical>
                  )
                }
              )}
            </>
          }
        />
      )}
      {template?.manifests?.length && (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Service.Manifests`}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          panelClassName={css.nestedAccordions}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests" />
            </div>
          }
          details={
            <>
              {
                <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15, fontWeight: 'bold' }}>
                  {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
                </Text>
              }
              {template?.manifests?.map?.(
                (
                  {
                    manifest: {
                      identifier = '',
                      spec: {
                        skipResourceVersioning = '',
                        store: {
                          spec: { branch = '', connectorRef = '', folderPath = '', commitId = '' } = {},
                          type = ''
                        } = {}
                      } = {}
                    } = {}
                  }: any,
                  index: number
                ) => {
                  return (
                    <Layout.Vertical key={identifier}>
                      <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15 }}>{identifier}</Text>
                      {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                        <FormGroup
                          labelFor={'connectorRef'}
                          label={getString('pipeline.manifestType.selectManifestStore')}
                        >
                          <ConnectorReferenceField
                            disabled={readonly}
                            name={`${path}.manifests[${index}].manifest.spec.store.spec.connectorRef`}
                            selected={get(
                              initialValues,
                              `manifests[${index}].manifest.spec.store.spec.connectorRef`,
                              ''
                            )}
                            label={''}
                            placeholder={''}
                            accountIdentifier={accountId}
                            projectIdentifier={projectIdentifier}
                            orgIdentifier={orgIdentifier}
                            type={ManifestToConnectorMap[type as ManifestStores]}
                            onChange={(record, scope) => {
                              const connectorRefSelected =
                                scope === Scope.ORG || scope === Scope.ACCOUNT
                                  ? `${scope}.${record?.identifier}`
                                  : record?.identifier
                              set(
                                initialValues,
                                `manifests[${index}].manifest.spec.store.spec.connectorRef`,
                                connectorRefSelected
                              )
                              onUpdate?.({
                                ...initialValues
                              })
                            }}
                          />
                        </FormGroup>
                      )}
                      {getMultiTypeFromValue(branch) === MultiTypeInputType.RUNTIME && (
                        <FormGroup labelFor={'branch'} label={getString('pipelineSteps.deploy.inputSet.branch')}>
                          <FormInput.Text
                            disabled={readonly}
                            className={css.inputWidth}
                            name={`${path}.manifests[${index}].manifest.spec.store.spec.branch`}
                          />
                        </FormGroup>
                      )}
                      {getMultiTypeFromValue(commitId) === MultiTypeInputType.RUNTIME && (
                        <FormGroup labelFor={'commitId'} label={getString('pipelineSteps.commitIdValue')}>
                          <FormInput.Text
                            disabled={readonly}
                            className={css.inputWidth}
                            name={`${path}.manifests[${index}].manifest.spec.store.spec.commitId`}
                          />
                        </FormGroup>
                      )}
                      {getMultiTypeFromValue(folderPath) === MultiTypeInputType.RUNTIME && (
                        <FormGroup labelFor={'folderPath'} label={getString('chartPath')}>
                          <FormInput.Text
                            disabled={readonly}
                            className={css.inputWidth}
                            name={`${path}.manifests[${index}].manifest.spec.store.spec.folderPath`}
                          />
                        </FormGroup>
                      )}
                      {getMultiTypeFromValue(skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
                        <div className={css.skipVersioning}>
                          <FormInput.CheckBox
                            name={`${path}.manifests[${index}].manifest.spec.skipResourceVersioning`}
                            label={getString('skipResourceVersion')}
                          />
                        </div>
                      )}
                    </Layout.Vertical>
                  )
                }
              )}
            </>
          }
        />
      )}
      {initialValues?.variables?.length && (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          id={`Stage.${stageIdentifier}.Service.Variables`}
          summaryClassName={cx(css.nopadLeft, css.accordionSummary)}
          panelClassName={css.nestedAccordions}
          summary={
            <div className={css.stagesTreeBulletCircle}>
              <String stringID="variablesText" />
            </div>
          }
          details={
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={(factory as unknown) as AbstractStepFactory}
              initialValues={{
                variables: (initialValues.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              type={StepType.CustomVariable}
              stepViewType={StepViewType.InputSet}
              onUpdate={({ variables }: CustomVariablesData) => {
                onUpdate?.({
                  ...pipeline,
                  variables: variables as any
                })
              }}
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path
              }}
              readonly={readonly}
            />
          }
        />
      )}
    </Layout.Vertical>
  )
}

export interface K8SDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: {}
}

const ManifestConnectorRefRegex = /^.+manifest\.spec\.store\.spec\.connectorRef$/
const ManifestConnectorRefType = 'Git'
const ArtifactsSidecarRegex = /^.+.sidecar\.spec\.connectorRef$/
const ArtifactsPrimaryRegex = /^.+artifacts\.primary\.spec\.connectorRef$/
const ArtifactConnectorTypes = ['Dockerhub', 'Gcr']
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

export class KubernetesServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.K8sServiceSpec
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'service-kubernetes'
  protected stepName = 'Deplyment Service'
  protected stepPaletteVisible = false
  protected _hasStepVariables = true
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.invocationMap.set(ArtifactsPrimaryRegex, this.getArtifactsPrimaryConnectorsListForYaml.bind(this))
    this.invocationMap.set(ArtifactsSidecarRegex, this.getArtifactsSidecarConnectorsListForYaml.bind(this))
    this.invocationMap.set(ManifestConnectorRefRegex, this.getManifestConnectorsListForYaml.bind(this))
  }

  protected getManifestConnectorsListForYaml(
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
      if (obj.type === ManifestConnectorRefType) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['Git', 'Github', 'Gitlab', 'Bitbucket'], filterType: 'Connector' }
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

  protected getArtifactsPrimaryConnectorsListForYaml(
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
      if (ArtifactConnectorTypes.includes(obj.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['DockerRegistry', 'Gcp'], filterType: 'Connector' }
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

  protected getArtifactsSidecarConnectorsListForYaml(
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
      if (ArtifactConnectorTypes.includes(obj.type)) {
        return getConnectorListV2Promise({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            includeAllConnectorsAvailableAtScope: true
          },
          body: { types: ['DockerRegistry', 'Gcp'], filterType: 'Connector' }
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
    data: K8SDirectServiceStep,
    template?: ServiceSpec,
    getString?: UseStringsReturn['getString']
  ): object {
    const errors: K8SDirectServiceStep = {}
    if (
      isEmpty(data?.artifacts?.primary?.spec?.connectorRef) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.connectorRef', getString?.('fieldRequired', { field: 'ConnectorRef' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.imagePath) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.imagePath) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.imagePath', getString?.('fieldRequired', { field: 'Image Path' }))
    }

    if (
      !tagExists(data?.artifacts?.primary?.spec?.tag) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.tag', getString?.('fieldRequired', { field: 'Tag' }))
    }
    if (
      isEmpty(data?.artifacts?.primary?.spec?.tagRegex) &&
      getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tagRegex) === MultiTypeInputType.RUNTIME
    ) {
      set(errors, 'artifacts.primary.spec.tagRegex', getString?.('fieldRequired', { field: 'Tag Regex' }))
    }
    data?.artifacts?.sidecars?.forEach((sidecar, index) => {
      const currentSidecarTemplate = get(template, `artifacts.sidecars[${index}].sidecar.spec`, '')
      if (
        isEmpty(sidecar?.sidecar?.spec?.connectorRef) &&
        getMultiTypeFromValue(currentSidecarTemplate?.connectorRef) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.connectorRef`,
          getString?.('fieldRequired', { field: 'Artifact Server' })
        )
      }
      if (
        isEmpty(sidecar?.sidecar?.spec?.imagePath) &&
        getMultiTypeFromValue(currentSidecarTemplate?.imagePath) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.imagePath`,
          getString?.('fieldRequired', { field: 'Image Path' })
        )
      }

      if (
        !tagExists(sidecar?.sidecar?.spec?.tag) &&
        getMultiTypeFromValue(currentSidecarTemplate?.tag) === MultiTypeInputType.RUNTIME
      ) {
        set(errors, `artifacts.sidecars[${index}].sidecar.spec.tag`, getString?.('fieldRequired', { field: 'Tag' }))
      }
      if (
        isEmpty(sidecar?.sidecar?.spec?.tagRegex) &&
        getMultiTypeFromValue(currentSidecarTemplate?.tagRegex) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `artifacts.sidecars[${index}].sidecar.spec.tagRegex`,
          getString?.('fieldRequired', { field: 'Tag Regex' })
        )
      }
    })

    data?.manifests?.forEach((manifest, index) => {
      const currentManifestTemplate = get(template, `manifests[${index}].manifest.spec.store.spec`, '')
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.connectorRef) &&
        getMultiTypeFromValue(currentManifestTemplate?.connectorRef) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.connectorRef`,
          getString?.('fieldRequired', { field: 'Artifact Server' })
        )
      }
      if (
        isEmpty(manifest?.manifest?.spec?.store?.spec?.branch) &&
        getMultiTypeFromValue(currentManifestTemplate?.branch) === MultiTypeInputType.RUNTIME
      ) {
        set(
          errors,
          `manifests[${index}].manifest.spec.store.spec.branch`,
          getString?.('fieldRequired', { field: 'Branch' })
        )
      }
    })

    return errors
  }

  renderStep(props: StepProps<K8SDirectServiceStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, factory, customStepProps, readonly } = props

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sServiceSpecVariablesForm
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          stepsFactory={factory}
          onUpdate={onUpdate}
          readonly={readonly}
        />
      )
    }

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <KubernetesServiceSpecInputForm
          {...(customStepProps as K8sServiceSpecVariablesFormProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          path={inputSetData?.path}
          readonly={inputSetData?.readonly || readonly}
          factory={factory}
        />
      )
    }

    return (
      <KubernetesServiceSpecEditable
        {...(customStepProps as K8sServiceSpecVariablesFormProps)}
        factory={factory}
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        path={inputSetData?.path}
        readonly={readonly}
      />
    )
  }
}
