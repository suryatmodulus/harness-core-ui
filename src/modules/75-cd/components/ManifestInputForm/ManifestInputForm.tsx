import React from 'react'
import cx from 'classnames'

import { connect } from 'formik'
import get from 'lodash-es/get'

import { useParams } from 'react-router-dom'

import { Text, Layout, getMultiTypeFromValue, MultiTypeInputType, FormInput } from '@wings-software/uicore'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'

import { FormMultiTypeCheckboxField } from '@common/components'
import type { PipelineType, InputSetPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'

import List from '@common/components/List/List'
import type { Scope } from '@common/interfaces/SecretsInterface'

import { GitConfigDTO, ServiceSpec, useGetBucketListForS3, useGetGCSBucketList } from 'services/cd-ng'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import {
  ManifestToConnectorMap,
  GitRepoName,
  ManifestStoreMap,
  ManifestDataType
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import ExperimentalInput from '../PipelineSteps/K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'

import css from './ManifestInputForm.module.scss'

interface K8SDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
}

interface KubernetesServiceInputFormProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  allValues?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
}

const ManifestInputSetForm: React.FC<KubernetesServiceInputFormProps> = ({
  template,
  path,
  allValues,
  initialValues,
  readonly = false,
  stageIdentifier,
  formik
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const [showRepoName, setShowRepoName] = React.useState(true)
  const [gcsBucketQueryData, setGcsBucketQueryData] = React.useState<{ connectorRef: string }>({
    connectorRef: ''
  })
  const [s3BucketData, setS3BucketQueryData] = React.useState<{ connectorRef: string; region: string }>({
    connectorRef: '',
    region: ''
  })
  const { repoIdentifier, branch: branchParam } = useQueryParams<GitQueryParams>()
  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = (regionData?.resource || []).map((region: any) => ({
    value: region.value,
    label: region.name
  }))

  const {
    data: bucketData,
    loading,
    refetch: refetchBuckets
  } = useGetGCSBucketList({
    queryParams: {
      connectorRef: gcsBucketQueryData?.connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const bucketOptions = Object.keys(bucketData?.data || {}).map(item => ({
    label: item,
    value: item
  }))

  /* s3 bucket related code */
  const {
    data: s3BucketList,
    loading: s3bucketdataLoading,
    refetch: refetchS3Buckets
  } = useGetBucketListForS3({
    queryParams: {
      connectorRef: s3BucketData?.connectorRef,
      region: s3BucketData?.region,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  React.useEffect(() => {
    if (s3BucketData?.connectorRef) {
      refetchS3Buckets()
    }
  }, [s3BucketData])

  React.useEffect(() => {
    if (gcsBucketQueryData?.connectorRef) {
      refetchBuckets()
    }
  }, [gcsBucketQueryData])

  const s3BucketOptions = Object.keys(s3BucketList || {}).map(item => ({
    label: item,
    value: item
  }))

  return (
    <>
      <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${stageIdentifier}.Service.Manifests`}>
        {
          <div className={css.subheading}>
            {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
          </div>
        }
        {template?.manifests?.map?.(
          (
            {
              manifest: {
                identifier = '',
                type: manifestType = '',
                spec: {
                  skipResourceVersioning = '',
                  chartName = '',
                  pluginPath = '',
                  chartVersion = '',
                  store: {
                    spec: {
                      branch = '',
                      region = '',
                      connectorRef = '',
                      folderPath = '',
                      bucketName = '',
                      commitId = '',
                      repoName = '',
                      paths = ''
                    } = {},
                    type = ''
                  } = {}
                } = {}
              } = {}
            }: any,
            index: number
          ) => {
            const filteredManifest = allValues?.manifests?.find(item => item.manifest?.identifier === identifier)
            return (
              <Layout.Vertical key={identifier} className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
                <Text className={css.inputheader}>{identifier}</Text>
                {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormMultiTypeConnectorField
                      disabled={readonly}
                      name={`${path}.manifests[${index}].manifest.spec.store.spec.connectorRef`}
                      selected={get(initialValues, `manifests[${index}].manifest.spec.store.spec.connectorRef`)}
                      label={getString('connector')}
                      placeholder={''}
                      setRefValue
                      multiTypeProps={{
                        allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                        expressions
                      }}
                      width={370}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      type={ManifestToConnectorMap[type as ManifestStores]}
                      onChange={(selected, _itemType, multiType) => {
                        const item = selected as unknown as { record?: GitConfigDTO; scope: Scope }
                        if (multiType === MultiTypeInputType.FIXED) {
                          if (
                            item?.record?.spec?.connectionType === GitRepoName.Repo ||
                            item?.record?.spec?.type === GitRepoName.Repo
                          ) {
                            setShowRepoName(false)
                          } else {
                            setShowRepoName(true)
                          }
                        }
                      }}
                      gitScope={{ repo: repoIdentifier || '', branch: branchParam }}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(repoName) === MultiTypeInputType.RUNTIME && showRepoName && (
                  <div className={css.verticalSpacingInput}>
                    <FormInput.MultiTextInput
                      disabled={readonly}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                      name={`${path}.manifests[${index}].manifest.spec.store.spec.repoName`}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(branch) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      disabled={readonly}
                      name={`${path}.manifests[${index}].manifest.spec.store.spec.branch`}
                    />
                  </div>
                )}

                {getMultiTypeFromValue(commitId) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormInput.MultiTextInput
                      disabled={readonly}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      label={getString('pipelineSteps.commitIdValue')}
                      name={`${path}.manifests[${index}].manifest.spec.store.spec.commitId`}
                    />
                  </div>
                )}

                {getMultiTypeFromValue(region) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <ExperimentalInput
                      formik={formik}
                      multiTypeInputProps={{
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
                      name={`${path}.manifests[${index}].manifest.spec.store.spec.region`}
                    />
                  </div>
                )}

                {getMultiTypeFromValue(bucketName) === MultiTypeInputType.RUNTIME &&
                  (type === ManifestStoreMap.Gcs ? (
                    getMultiTypeFromValue(
                      initialValues?.manifests?.[index].manifest?.spec?.store?.spec?.connectorRef
                    ) === MultiTypeInputType.FIXED ? (
                      <div className={css.verticalSpacingInput}>
                        <ExperimentalInput
                          formik={formik}
                          multiTypeInputProps={{
                            onFocus: () => {
                              if (
                                getMultiTypeFromValue(filteredManifest?.manifest?.spec?.store?.spec?.connectorRef) ===
                                MultiTypeInputType.FIXED
                              ) {
                                setGcsBucketQueryData({
                                  connectorRef: filteredManifest?.manifest?.spec?.store?.spec?.connectorRef
                                })
                              } else {
                                if (!bucketOptions.length) {
                                  setGcsBucketQueryData({
                                    connectorRef:
                                      initialValues?.manifests?.[index].manifest?.spec?.store?.spec?.connectorRef
                                  })
                                }
                              }
                            },
                            selectProps: {
                              usePortal: true,
                              addClearBtn: true && !readonly,
                              items: loading
                                ? [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
                                : bucketOptions,
                              allowCreatingNewItems: true
                            },
                            expressions,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                          }}
                          useValue
                          disabled={readonly}
                          selectItems={bucketOptions}
                          placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                          label={getString('pipeline.manifestType.bucketName')}
                          name={`${path}.manifests[${index}].manifest.spec.store.spec.bucketName`}
                        />
                      </div>
                    ) : (
                      <div className={css.verticalSpacingInput}>
                        <FormInput.MultiTextInput
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                          }}
                          disabled={readonly}
                          placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                          label={getString('pipeline.manifestType.bucketName')}
                          name={`${path}.manifests[${index}].manifest.spec.store.spec.bucketName`}
                        />
                      </div>
                    )
                  ) : type === ManifestStoreMap.S3 ? (
                    getMultiTypeFromValue(connectorRef) === MultiTypeInputType.FIXED &&
                    getMultiTypeFromValue(region) !== MultiTypeInputType.FIXED ? (
                      <div className={css.verticalSpacingInput}>
                        <ExperimentalInput
                          formik={formik}
                          multiTypeInputProps={{
                            onFocus: () => {
                              setS3BucketQueryData({
                                connectorRef: filteredManifest?.manifest?.spec?.store?.spec?.connectorRef,
                                region: initialValues?.manifests?.[index].manifest?.spec?.store?.spec?.region
                              })
                            },
                            selectProps: {
                              usePortal: true,
                              addClearBtn: true && !readonly,
                              items: s3bucketdataLoading
                                ? [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
                                : s3BucketOptions,

                              allowCreatingNewItems: true
                            },
                            expressions,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                          }}
                          useValue
                          disabled={readonly}
                          selectItems={s3BucketOptions}
                          placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                          label={getString('pipeline.manifestType.bucketName')}
                          name={`${path}.manifests[${index}].manifest.spec.store.spec.bucketName`}
                        />
                      </div>
                    ) : (
                      <div className={css.verticalSpacingInput}>
                        <FormInput.MultiTextInput
                          multiTextInputProps={{
                            expressions,
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                          }}
                          disabled={readonly}
                          label={getString('pipeline.manifestType.bucketName')}
                          name={`${path}.manifests[${index}].manifest.spec.store.spec.bucketName`}
                        />
                      </div>
                    )
                  ) : null)}

                {getMultiTypeFromValue(folderPath) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      disabled={readonly}
                      label={
                        manifestType === ManifestDataType.Kustomize
                          ? getString('pipeline.manifestType.kustomizeFolderPath')
                          : getString('chartPath')
                      }
                      name={`${path}.manifests[${index}].manifest.spec.store.spec.folderPath`}
                    />
                  </div>
                )}

                {getMultiTypeFromValue(pluginPath) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      disabled={readonly}
                      label={getString('pluginPath')}
                      name={`${path}.manifests[${index}].manifest.spec.pluginPath`}
                    />
                  </div>
                )}

                {getMultiTypeFromValue(chartName) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      disabled={readonly}
                      label={getString('pipeline.manifestType.http.chartName')}
                      name={`${path}.manifests[${index}].manifest.spec.chartName`}
                    />
                  </div>
                )}
                {getMultiTypeFromValue(chartVersion) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      disabled={readonly}
                      label={getString('pipeline.manifestType.http.chartVersion')}
                      name={`${path}.manifests[${index}].manifest.spec.chartVersion`}
                    />
                  </div>
                )}

                {getMultiTypeFromValue(paths) === MultiTypeInputType.RUNTIME &&
                  manifestType !== ManifestDataType.OpenshiftTemplate && (
                    <div className={css.verticalSpacingInput}>
                      <List
                        labelClassName={css.listLabel}
                        label={
                          manifestType === ManifestDataType.K8sManifest
                            ? getString('fileFolderPathText')
                            : getString('common.git.filePath')
                        }
                        name={`${path}.manifests[${index}].manifest.spec.store.spec.paths`}
                        placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                        disabled={readonly}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                        expressions={expressions}
                        isNameOfArrayType
                      />
                    </div>
                  )}

                {getMultiTypeFromValue(paths) === MultiTypeInputType.RUNTIME &&
                  manifestType === ManifestDataType.OpenshiftTemplate && (
                    <div className={css.verticalSpacingInput}>
                      <FormInput.MultiTextInput
                        multiTextInputProps={{
                          expressions,
                          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                        }}
                        label={getString('pipeline.manifestType.osTemplatePath')}
                        placeholder={getString('pipeline.manifestType.osTemplatePathPlaceHolder')}
                        disabled={readonly}
                        name={`${path}.manifests[${index}].manifest.spec.store.spec.path`}
                      />
                    </div>
                  )}
                {getMultiTypeFromValue(skipResourceVersioning) === MultiTypeInputType.RUNTIME && (
                  <div className={css.verticalSpacingInput}>
                    <FormMultiTypeCheckboxField
                      multiTypeTextbox={{
                        expressions,
                        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                      }}
                      name={`${path}.manifests[${index}].manifest.spec.skipResourceVersioning`}
                      label={getString('skipResourceVersion')}
                      setToFalseWhenEmpty={true}
                    />
                  </div>
                )}
              </Layout.Vertical>
            )
          }
        )}
      </div>
    </>
  )
}

export const ManifestInputForm = connect(ManifestInputSetForm)
