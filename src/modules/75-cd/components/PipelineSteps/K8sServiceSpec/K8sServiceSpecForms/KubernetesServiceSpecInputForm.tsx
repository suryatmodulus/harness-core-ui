import React, { useCallback } from 'react'
import get from 'lodash-es/get'
import isEmpty from 'lodash-es/isEmpty'
import set from 'lodash-es/set'
import produce from 'immer'
import {
  Layout,
  Text,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  Icon,
  SelectOption
} from '@wings-software/uicore'

import { parse } from 'yaml'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Tooltip, Menu } from '@blueprintjs/core'
import memoize from 'lodash-es/memoize'
import { connect } from 'formik'
import { cloneDeep } from 'lodash-es'
import type { PipelineType, InputSetPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  ConnectorInfoDTO,
  useGetBuildDetailsForDockerWithYaml,
  useGetBuildDetailsForGcrWithYaml,
  useGetBuildDetailsForEcrWithYaml
} from 'services/cd-ng'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'

import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { useDeepCompareEffect, useMutateAsGet, useQueryParams } from '@common/hooks'
import { useToaster } from '@common/exports'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import { useListAwsRegions } from 'services/portal'

import type { AllNGVariables } from '@pipeline/utils/types'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { gcrUrlList } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/GCRImagePath/GCRImagePath'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { ManifestInputForm } from '@cd/components/ManifestInputForm/ManifestInputForm'

import type { KubernetesServiceInputFormProps, LastQueryData } from '../K8sServiceSpecInterface'

import { clearRuntimeInputValue, getNonRuntimeFields } from '../K8sServiceSpecHelper'
import ExperimentalInput from './ExperimentalInput'

import css from '../K8sServiceSpec.module.scss'

const KubernetesServiceSpecInputFormikForm: React.FC<KubernetesServiceInputFormProps> = ({
  template,
  path,
  factory,
  allValues,
  initialValues,
  onUpdate,
  readonly = false,
  stageIdentifier,
  formik
}) => {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch: branchParam } = useQueryParams<GitQueryParams>()

  const [tagListMap, setTagListMap] = React.useState<{ [key: string]: Record<string, any>[] | Record<string, any> }>({
    sidecars: [],
    primary: {}
  })
  const [lastQueryData, setLastQueryData] = React.useState<LastQueryData>({})
  const { expressions } = useVariablesExpression()
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const artifacts = allValues?.artifacts || {}

  const getFqnPath = useCallback((): string => {
    let lastQueryDataPath
    if (lastQueryData.path && lastQueryData.path !== 'primary') {
      lastQueryDataPath = `sidecars.${get(template, `artifacts[${lastQueryData.path}].sidecar.identifier`)}`
    } else {
      lastQueryDataPath = lastQueryData.path
    }
    if (isPropagatedStage) {
      return `pipeline.stages.${stageIdentifier}.spec.serviceConfig.stageOverrides.artifacts.${lastQueryDataPath}.spec.tag`
    }
    return `pipeline.stages.${stageIdentifier}.spec.serviceConfig.serviceDefinition.spec.artifacts.${lastQueryDataPath}.spec.tag`
  }, [lastQueryData])

  const yamlData = clearRuntimeInputValue(
    cloneDeep(
      parse(
        JSON.stringify({
          pipeline: formik?.values
        }) || ''
      )
    )
  )

  const {
    data: dockerdata,
    loading: dockerLoading,
    refetch: refetchDockerBuildData,
    error: dockerError
  } = useMutateAsGet(useGetBuildDetailsForDockerWithYaml, {
    body: yamlStringify({ ...yamlData }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      imagePath: lastQueryData.imagePath,
      connectorRef: lastQueryData.connectorRef,
      pipelineIdentifier,
      fqnPath: getFqnPath(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch: branchParam
    },
    lazy: true
  })

  const {
    data: gcrdata,
    loading: gcrLoading,
    refetch: refetchGcrBuildData,
    error: gcrError
  } = useMutateAsGet(useGetBuildDetailsForGcrWithYaml, {
    body: yamlStringify({ ...yamlData }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      imagePath: lastQueryData.imagePath || '',
      connectorRef: lastQueryData.connectorRef || '',
      pipelineIdentifier,
      fqnPath: getFqnPath(),
      registryHostname: lastQueryData.registryHostname || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch: branchParam
    },
    lazy: true
  })

  const {
    data: ecrdata,
    loading: ecrLoading,
    refetch: refetchEcrBuildData,
    error: ecrError
  } = useMutateAsGet(useGetBuildDetailsForEcrWithYaml, {
    body: yamlStringify({ ...yamlData }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      imagePath: lastQueryData.imagePath || '',
      connectorRef: lastQueryData.connectorRef || '',
      pipelineIdentifier,
      fqnPath: getFqnPath(),
      region: lastQueryData.region || '',
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch: branchParam
    },
    lazy: true
  })

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  useDeepCompareEffect(() => {
    if (gcrError || dockerError || ecrError) {
      showError(
        `Stage ${stageIdentifier}: ${get(ecrError || gcrError || dockerError, 'data.message', null)}`,
        undefined,
        'cd.tag.fetch.error'
      )
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
    ecrError,
    getString,
    lastQueryData.path,
    showError,
    tagListMap,
    clear
  ])
  React.useEffect(() => {
    if (lastQueryData.connectorRef) {
      switch (lastQueryData.connectorType) {
        case ENABLED_ARTIFACT_TYPES.DockerRegistry:
          refetchDockerBuildData()
          break
        case ENABLED_ARTIFACT_TYPES.Gcr:
          refetchGcrBuildData()
          break
        case ENABLED_ARTIFACT_TYPES.Ecr:
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
    if (connectorType === ENABLED_ARTIFACT_TYPES.DockerRegistry) {
      if (imagePath?.length && connectorRef?.length) {
        setLastQueryData({
          path: tagsPath,
          imagePath,
          connectorRef,
          connectorType,
          registryHostname: registryHostname as string
        })
      }
    } else if (connectorType === ENABLED_ARTIFACT_TYPES.Gcr) {
      if (imagePath?.length && connectorRef?.length && registryHostname?.length) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, registryHostname })
      }
    } else {
      if (imagePath?.length && connectorRef?.length && region?.length) {
        setLastQueryData({ path: tagsPath, imagePath, connectorRef, connectorType, region })
      }
    }
  }

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
      registryHostname =
        getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname) !==
        MultiTypeInputType.RUNTIME
          ? artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
          : initialValues.artifacts?.sidecars?.[index]?.sidecar?.spec?.registryHostname
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
      registryHostname =
        getMultiTypeFromValue(artifacts?.primary?.spec?.registryHostname) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.registryHostname
          : initialValues.artifacts?.primary?.spec?.registryHostname
      region =
        getMultiTypeFromValue(artifacts?.primary?.spec?.region) !== MultiTypeInputType.RUNTIME
          ? artifacts?.primary?.spec?.region
          : initialValues.artifacts?.primary?.spec?.region
    }
    if (connectorType === ENABLED_ARTIFACT_TYPES.DockerRegistry) {
      return !imagePath?.length || !connectorRef?.length
    } else if (connectorType === ENABLED_ARTIFACT_TYPES.Ecr) {
      return !imagePath?.length || !connectorRef?.length || !region?.length
    } else {
      return !imagePath?.length || !connectorRef?.length || !registryHostname?.length
    }
  }
  const regions = (regionData?.resource || []).map((region: any) => ({
    value: region.value,
    label: region.name
  }))

  const resetTags = (tagPath: string): void => {
    const tagValue = get(formik.values, tagPath, '')
    getMultiTypeFromValue(tagValue) === MultiTypeInputType.FIXED &&
      tagValue?.length &&
      formik.setFieldValue(tagPath, '')
  }
  return (
    <Layout.Vertical spacing="medium">
      {get(template, 'artifacts', false) && (
        <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${stageIdentifier}.Service.Artifacts`}>
          <div className={css.subheading}>
            {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}{' '}
          </div>

          <div className={cx(css.nestedAccordions, css.artifactsAccordion)}>
            {template?.artifacts?.primary && (
              <Text className={css.inputheader}>
                {getString('primaryArtifactText')}
                {!isEmpty(
                  JSON.parse(
                    getNonRuntimeFields(get(artifacts, `primary.spec`), get(template, 'artifacts.primary.spec'))
                  )
                ) && (
                  <Tooltip
                    position="top"
                    className={css.artifactInfoTooltip}
                    content={getNonRuntimeFields(
                      get(artifacts, `primary.spec`),
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
                  <FormMultiTypeConnectorField
                    name={`${path}.artifacts.primary.spec.connectorRef`}
                    label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                    selected={get(initialValues, 'artifacts.primary.spec.connectorRef', '')}
                    placeholder={''}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    width={445}
                    setRefValue
                    disabled={readonly}
                    multiTypeProps={{
                      allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                      expressions
                    }}
                    onChange={() => resetTags(`${path}.artifacts.primary.spec.tag`)}
                    className={css.connectorMargin}
                    type={ArtifactToConnectorMap[artifacts?.primary?.type || ''] as ConnectorInfoDTO['type']}
                    gitScope={{ repo: repoIdentifier || '', branch: branchParam, getDefaultFromOtherRepo: true }}
                  />
                )}
                {getMultiTypeFromValue(artifacts?.primary?.spec?.region) === MultiTypeInputType.RUNTIME && (
                  <ExperimentalInput
                    formik={formik}
                    multiTypeInputProps={{
                      onChange: () => resetTags(`${path}.artifacts.primary.spec.tag`),
                      selectProps: {
                        usePortal: true,
                        addClearBtn: true && !readonly,
                        items: regions
                      },
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                    useValue
                    disabled={readonly}
                    selectItems={regions}
                    label={getString('regionLabel')}
                    name={`${path}.artifacts.primary.spec.region`}
                  />
                )}
                {getMultiTypeFromValue(get(template, `artifacts.primary.spec.imagePath`, '')) ===
                  MultiTypeInputType.RUNTIME && (
                  <FormInput.MultiTextInput
                    label={getString('pipeline.imagePathLabel')}
                    disabled={readonly}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                    name={`${path}.artifacts.primary.spec.imagePath`}
                    onChange={() => resetTags(`${path}.artifacts.primary.spec.tag`)}
                  />
                )}

                {getMultiTypeFromValue(get(template, `artifacts.primary.spec.registryHostname`, '')) ===
                  MultiTypeInputType.RUNTIME && (
                  <ExperimentalInput
                    formik={formik}
                    disabled={readonly}
                    selectItems={gcrUrlList}
                    useValue
                    multiTypeInputProps={{
                      onChange: () => resetTags(`${path}.artifacts.primary.spec.tag`),
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                      selectProps: { allowCreatingNewItems: true, addClearBtn: true, items: gcrUrlList }
                    }}
                    label={getString('connectors.GCR.registryHostname')}
                    name={`${path}.artifacts.primary.spec.registryHostname`}
                  />
                )}

                {getMultiTypeFromValue(template?.artifacts?.primary?.spec?.tag) === MultiTypeInputType.RUNTIME && (
                  <ExperimentalInput
                    formik={formik}
                    disabled={readonly || isTagSelectionDisabled(artifacts?.primary?.type || '')}
                    selectItems={
                      dockerLoading || gcrLoading || ecrLoading
                        ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                        : getSelectItems('primary')
                    }
                    useValue
                    multiTypeInputProps={{
                      onFocus: (e: any) => {
                        if (
                          e?.target?.type !== 'text' ||
                          (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                        ) {
                          return
                        }
                        const imagePath =
                          getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
                            ? artifacts?.primary?.spec?.imagePath
                            : initialValues.artifacts?.primary?.spec?.imagePath
                        const connectorRef =
                          getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
                            ? artifacts?.primary?.spec?.connectorRef
                            : initialValues.artifacts?.primary?.spec?.connectorRef
                        const regionCurrent =
                          getMultiTypeFromValue(artifacts?.primary?.spec?.region) !== MultiTypeInputType.RUNTIME
                            ? artifacts?.primary?.spec?.region
                            : initialValues.artifacts?.primary?.spec?.region
                        const registryHostnameCurrent =
                          getMultiTypeFromValue(artifacts?.primary?.spec?.registryHostname) !==
                          MultiTypeInputType.RUNTIME
                            ? artifacts?.primary?.spec?.registryHostname
                            : initialValues.artifacts?.primary?.spec?.registryHostname
                        const tagsPath = `primary`
                        !isTagSelectionDisabled(artifacts?.primary?.type || '') &&
                          fetchTags({
                            path: tagsPath,
                            imagePath,
                            connectorRef,
                            connectorType: artifacts?.primary?.type,
                            registryHostname: registryHostnameCurrent,
                            region: regionCurrent
                          })
                      },
                      selectProps: {
                        items:
                          dockerLoading || gcrLoading || ecrLoading
                            ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                            : getSelectItems('primary'),
                        usePortal: true,
                        addClearBtn: !(readonly || isTagSelectionDisabled(artifacts?.primary?.type || '')),
                        noResults: (
                          <Text lineClamp={1}>
                            {get(ecrError || gcrError || dockerError, 'data.message', null) ||
                              getString('pipelineSteps.deploy.errors.notags')}
                          </Text>
                        ),
                        itemRenderer: itemRenderer,
                        allowCreatingNewItems: true,
                        popoverClassName: css.selectPopover
                      },
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
                    label={getString('tagLabel')}
                    name={`${path}.artifacts.primary.spec.tag`}
                  />
                )}
                {getMultiTypeFromValue(artifacts?.primary?.spec?.tagRegex) === MultiTypeInputType.RUNTIME && (
                  <FormInput.MultiTextInput
                    disabled={readonly}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                    }}
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
                            get(artifacts, `sidecars[${index}].sidecar.spec`),
                            get(template, 'artifacts.primary.spec')
                          )
                        )
                      ) && (
                        <Tooltip
                          position="top"
                          className={css.artifactInfoTooltip}
                          content={getNonRuntimeFields(
                            get(artifacts, `sidecars[${index}].sidecar.spec`),
                            get(template, `artifacts.sidecars[${index}].sidecar.spec`)
                          )}
                        >
                          <Icon name="info" />
                        </Tooltip>
                      )}
                    </Text>
                    {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                      <FormMultiTypeConnectorField
                        name={`${path}.artifacts.sidecars[${index}].sidecar.spec.connectorRef`}
                        selected={get(initialValues, `artifacts.sidecars[${index}].sidecar.spec.connectorRef`, '')}
                        label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                        placeholder={''}
                        setRefValue
                        disabled={readonly}
                        multiTypeProps={{
                          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                          expressions
                        }}
                        accountIdentifier={accountId}
                        projectIdentifier={projectIdentifier}
                        orgIdentifier={orgIdentifier}
                        onChange={() => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`)}
                        type={
                          ArtifactToConnectorMap[
                            artifacts?.sidecars?.[index]?.sidecar?.type || ''
                          ] as ConnectorInfoDTO['type']
                        }
                        gitScope={{ repo: repoIdentifier || '', branch: branchParam, getDefaultFromOtherRepo: true }}
                      />
                    )}
                    {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.region) ===
                      MultiTypeInputType.RUNTIME && (
                      <ExperimentalInput
                        formik={formik}
                        useValue
                        multiTypeInputProps={{
                          onChange: () => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`),
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                          selectProps: {
                            items: regions,
                            usePortal: true,
                            addClearBtn: true && !readonly,
                            allowCreatingNewItems: true
                          }
                        }}
                        disabled={readonly}
                        selectItems={regions}
                        label={getString('regionLabel')}
                        name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.region`}
                      />
                    )}
                    {getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME && (
                      <FormInput.MultiTextInput
                        label={getString('pipeline.imagePathLabel')}
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                        disabled={readonly}
                        name={`${path}.artifacts.sidecars[${index}].sidecar.spec.imagePath`}
                        onChange={() => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`)}
                      />
                    )}
                    {getMultiTypeFromValue(registryHostname) === MultiTypeInputType.RUNTIME && (
                      <ExperimentalInput
                        formik={formik}
                        disabled={readonly}
                        selectItems={gcrUrlList}
                        useValue
                        multiTypeInputProps={{
                          onChange: () => resetTags(`${path}.artifacts.sidecars.[${index}].sidecar.spec.tag`),
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                          selectProps: { allowCreatingNewItems: true, addClearBtn: true, items: gcrUrlList }
                        }}
                        label={getString('connectors.GCR.registryHostname')}
                        name={`${path}.artifacts.sidecars[${index}].sidecar.spec.registryHostname`}
                      />
                    )}

                    {getMultiTypeFromValue(template?.artifacts?.sidecars?.[index]?.sidecar?.spec?.tag) ===
                      MultiTypeInputType.RUNTIME && (
                      <ExperimentalInput
                        formik={formik}
                        useValue
                        disabled={
                          readonly || isTagSelectionDisabled(artifacts?.sidecars?.[index]?.sidecar?.type || '', index)
                        }
                        selectItems={
                          dockerLoading || gcrLoading || ecrLoading
                            ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                            : getSelectItems(`sidecars[${index}]`)
                        }
                        multiTypeInputProps={{
                          onFocus: (e: any) => {
                            if (
                              e?.target?.type !== 'text' ||
                              (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                            ) {
                              return
                            }
                            const sidecarIndex =
                              initialValues?.artifacts?.sidecars?.findIndex(
                                sidecar => sidecar.sidecar?.identifier === identifier
                              ) ?? -1
                            const imagePathCurrent =
                              getMultiTypeFromValue(artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.imagePath) !==
                              MultiTypeInputType.RUNTIME
                                ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.imagePath
                                : currentSidecarSpec?.imagePath
                            const connectorRefCurrent =
                              getMultiTypeFromValue(
                                artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.connectorRef
                              ) !== MultiTypeInputType.RUNTIME
                                ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.connectorRef
                                : currentSidecarSpec?.connectorRef
                            const regionCurrent =
                              getMultiTypeFromValue(artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.region) !==
                              MultiTypeInputType.RUNTIME
                                ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.region
                                : currentSidecarSpec?.region
                            const registryHostnameCurrent =
                              getMultiTypeFromValue(
                                artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.registryHostname
                              ) !== MultiTypeInputType.RUNTIME
                                ? artifacts?.sidecars?.[sidecarIndex]?.sidecar?.spec?.registryHostname
                                : currentSidecarSpec?.registryHostname
                            const tagsPath = `sidecars[${sidecarIndex}]`
                            !isTagSelectionDisabled(
                              artifacts?.sidecars?.[sidecarIndex]?.sidecar?.type || '',
                              sidecarIndex
                            ) &&
                              fetchTags({
                                path: tagsPath,
                                imagePath: imagePathCurrent,
                                connectorRef: connectorRefCurrent,
                                connectorType: artifacts?.sidecars?.[index]?.sidecar?.type,
                                registryHostname: registryHostnameCurrent,
                                region: regionCurrent
                              })
                          },
                          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                          expressions,
                          selectProps: {
                            items:
                              dockerLoading || gcrLoading || ecrLoading
                                ? [{ label: 'Loading Tags...', value: 'Loading Tags...' }]
                                : getSelectItems(`sidecars[${index}]`),
                            usePortal: true,
                            addClearBtn: true && !readonly,
                            noResults: (
                              <Text lineClamp={1}>
                                {get(ecrError || gcrError || dockerError, 'data.message', null) ||
                                  getString('pipelineSteps.deploy.errors.notags')}
                              </Text>
                            ),
                            itemRenderer: itemRenderer,
                            allowCreatingNewItems: true,
                            popoverClassName: css.selectPopover
                          }
                        }}
                        label={getString('tagLabel')}
                        name={`${path}.artifacts.sidecars[${index}].sidecar.spec.tag`}
                      />
                    )}
                    {getMultiTypeFromValue(artifacts?.sidecars?.[index]?.sidecar?.spec?.tagRegex) ===
                      MultiTypeInputType.RUNTIME && (
                      <FormInput.MultiTextInput
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                        disabled={readonly}
                        label={getString('tagRegex')}
                        name={`${path}.artifacts.sidecars.[${index}].sidecar.spec.tagRegex`}
                      />
                    )}
                  </Layout.Vertical>
                )
              }
            )}
          </div>
        </div>
      )}
      {!!template?.manifests?.length && (
        <ManifestInputForm
          template={template}
          path={path}
          allValues={allValues}
          initialValues={initialValues}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
          formik={formik}
        />
      )}
      {!!template?.variables?.length && (
        <div id={`Stage.${stageIdentifier}.Service.Variables`} className={cx(css.nopadLeft, css.accordionSummary)}>
          <div className={css.subheading}>{getString('variablesText')}</div>

          <div className={css.nestedAccordions}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (initialValues.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              type={StepType.CustomVariable}
              stepViewType={StepViewType.InputSet}
              onUpdate={({ variables }: CustomVariablesData) => {
                onUpdate?.({
                  variables: variables as any
                })
              }}
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path,
                allValues: { variables: (allValues?.variables || []) as AllNGVariables[] }
              }}
              readonly={readonly}
            />
          </div>
        </div>
      )}
    </Layout.Vertical>
  )
}
export const KubernetesServiceSpecInputForm = connect(KubernetesServiceSpecInputFormikForm)
