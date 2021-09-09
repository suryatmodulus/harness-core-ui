import React from 'react'
import cx from 'classnames'
import { cloneDeep, get } from 'lodash-es'
import { parse } from 'yaml'
import { Menu } from '@blueprintjs/core'

import {
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { getBuildDetailsForDockerWithYamlPromise } from 'services/cd-ng'

import ExperimentalInput from './K8sServiceSpecForms/ExperimentalInput'
import { clearRuntimeInputValue, isFieldRuntime } from './K8sServiceSpecHelper'
import { AsyncStatus, PrimaryArtifactTooltip } from './Utils'
import css from './K8sServiceSpec.module.scss'

interface DockerFetchTagsParams {
  imagePath: string
  connectorRef: string
  accountIdentifier: string
  projectIdentifier: string
  orgIdentifier: string
  repoIdentifier?: string
  branch?: string
  pipelineIdentifier: string
  path: string
  stageIdentifier: string
  formik?: any
}

export class DockerArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = 'DockerRegistry'
  protected isSidecar = false
  protected tagsList: SelectOption[] = []
  protected fetchTagsError = ''
  protected tagsApiStatus = AsyncStatus.INIT

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps) {
    const { artifacts, initialValues } = props
    const isImagePathPresent =
      getMultiTypeFromValue(artifacts?.primary?.spec?.imagePath) !== MultiTypeInputType.RUNTIME
        ? artifacts?.primary?.spec?.imagePath
        : initialValues.artifacts?.primary?.spec?.imagePath
    const isConnectorPresent =
      getMultiTypeFromValue(artifacts?.primary?.spec?.connectorRef) !== MultiTypeInputType.RUNTIME
        ? artifacts?.primary?.spec?.connectorRef
        : initialValues.artifacts?.primary?.spec?.connectorRef
    return !(isImagePathPresent && isConnectorPresent)
  }

  fetchTags({
    imagePath,
    connectorRef,
    accountIdentifier,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    pipelineIdentifier,
    path,
    stageIdentifier,
    formik
  }: DockerFetchTagsParams) {
    this.tagsApiStatus = AsyncStatus.INPROGRESS
    this.fetchTagsError = ''
    this.tagsList = [{ label: 'Loading Tags...', value: 'Loading Tags...' }]

    const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
    const yamlData = clearRuntimeInputValue(
      cloneDeep(
        parse(
          JSON.stringify({
            pipeline: formik?.values
          }) || ''
        )
      )
    )
    getBuildDetailsForDockerWithYamlPromise({
      queryParams: {
        accountIdentifier,
        projectIdentifier,
        orgIdentifier,
        repoIdentifier,
        branch,
        imagePath,
        connectorRef,
        pipelineIdentifier,
        fqnPath: isPropagatedStage
          ? `pipeline.stages.${stageIdentifier}.spec.serviceConfig.stageOverrides.artifacts.${path}.spec.tag`
          : `pipeline.stages.${stageIdentifier}.spec.serviceConfig.serviceDefinition.spec.artifacts.${path}.spec.tag`
      },
      body: yamlStringify({ ...yamlData })
    })
      .then(data => {
        if (Array.isArray(data?.data?.buildDetailsList)) {
          this.tagsList = data?.data?.buildDetailsList
            ?.filter(({ tag }) => tag)
            .map(({ tag }) => ({ label: tag, value: tag })) as SelectOption[]
          this.tagsApiStatus = AsyncStatus.SUCCESS
          this.fetchTagsError = ''
        }
      })
      .catch(error => {
        this.tagsList = []
        this.fetchTagsError = error
        this.tagsApiStatus = AsyncStatus.ERROR
      })
  }

  renderContent(props: ArtifactSourceRenderProps) {
    const {
      getString,
      isArtifactsRuntime,
      isPrimaryArtifactsRuntime,
      template,
      artifacts,
      formik,
      path,
      initialValues,
      accountId,
      projectIdentifier,
      orgIdentifier,
      readonly,
      repoIdentifier,
      branch,
      expressions
    } = props
    if (!isArtifactsRuntime) {
      return null
    }

    return (
      <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Artifacts`}>
        <div className={css.subheading}>
          {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}{' '}
        </div>

        <div className={cx(css.nestedAccordions, css.artifactsAccordion)}>
          <PrimaryArtifactTooltip
            artifacts={artifacts}
            isPrimaryArtifactsRuntime={isPrimaryArtifactsRuntime}
            template={template}
          />
          {isPrimaryArtifactsRuntime && (
            <Layout.Vertical key="primary" className={css.inputWidth}>
              {isFieldRuntime('artifacts.primary.spec.connectorRef', template) && (
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
                  onChange={() => {
                    const tagPath = `${path}.artifacts.primary.spec.tag`
                    const tagValue = get(formik?.values, tagPath, '')
                    getMultiTypeFromValue(tagValue) === MultiTypeInputType.FIXED &&
                      tagValue?.length &&
                      formik?.setFieldValue(tagPath, '')
                  }}
                  className={css.connectorMargin}
                  type="DockerRegistry"
                  gitScope={{ repo: repoIdentifier || '', branch: branch || '', getDefaultFromOtherRepo: true }}
                />
              )}

              {isFieldRuntime('artifacts.primary.spec.imagePath', template) && (
                <FormInput.MultiTextInput
                  label={getString('pipeline.imagePathLabel')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                  }}
                  name={`${path}.artifacts.primary.spec.imagePath`}
                  onChange={() => {
                    const tagPath = `${path}.artifacts.primary.spec.tag`
                    const tagValue = get(formik?.values, tagPath, '')
                    getMultiTypeFromValue(tagValue) === MultiTypeInputType.FIXED &&
                      tagValue?.length &&
                      formik?.setFieldValue(tagPath, '')
                  }}
                />
              )}

              {isFieldRuntime('artifacts.primary.spec.tag', template) && (
                <ExperimentalInput
                  formik={formik}
                  disabled={readonly || this.isTagsSelectionDisabled(props)}
                  selectItems={this.tagsList}
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
                      const tagsPath = `primary`
                      if (!this.isTagsSelectionDisabled(props)) {
                        this.fetchTags({
                          ...props,
                          accountIdentifier: props.accountId,
                          imagePath,
                          connectorRef,
                          path: tagsPath
                        })
                      }
                    },
                    selectProps: {
                      items: this.tagsList,
                      usePortal: true,
                      addClearBtn: !(readonly || this.isTagsSelectionDisabled(props)),
                      noResults: (
                        <Text lineClamp={1}>
                          {get(this.fetchTagsError, 'data.message', null) ||
                            getString('pipelineSteps.deploy.errors.notags')}
                        </Text>
                      ),
                      itemRenderer: (item: SelectOption, { handleClick }: { handleClick: () => void }) => {
                        return (
                          <div key={item.label.toString()}>
                            <Menu.Item
                              text={
                                <Layout.Horizontal spacing="small">
                                  <Text>{item.label}</Text>
                                </Layout.Horizontal>
                              }
                              disabled={this.tagsApiStatus === AsyncStatus.INPROGRESS}
                              onClick={handleClick}
                            />
                          </div>
                        )
                      },
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
              {isFieldRuntime('artifacts.primary.spec.tagRegex', template) && (
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
        </div>
      </div>
    )
  }
}
