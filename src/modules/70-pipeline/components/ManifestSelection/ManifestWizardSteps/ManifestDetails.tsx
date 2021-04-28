import React from 'react'
import {
  Accordion,
  Layout,
  Button,
  Text,
  FormInput,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  Color,
  StepProps
} from '@wings-software/uicore'
import cx from 'classnames'
import { Form, FieldArrayRenderProps, FieldArray } from 'formik'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { Tooltip } from '@blueprintjs/core'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import { StringUtils } from '@common/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ManifestDetailDataType } from '../ManifestInterface'
import { gitFetchTypes, GitRepoName, ManifestDataType, ManifestStoreMap } from '../Manifesthelper'
import css from './ManifestWizardSteps.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ManifestDetailsPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  selectedManifest: string
  handleSubmit: (data: ManifestConfigWrapper) => void
}

const ManifestDetails: React.FC<StepProps<ConnectorConfigDTO> & ManifestDetailsPropType> = ({
  stepName,
  selectedManifest,
  expressions,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep
}) => {
  const { getString } = useStrings()

  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )

  const defaultValueToReset = [{ path: '', uuid: uuid('', nameSpace()) }]
  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning

  const gitConnectionType: string = prevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const accountUrl =
    connectionType === GitRepoName.Account
      ? prevStepData?.connectorRef
        ? prevStepData?.connectorRef?.connector?.spec?.url
        : prevStepData?.url
      : null

  const getRepoName = (): string => {
    let repoName = ''
    if (prevStepData?.connectorRef) {
      if (connectionType === GitRepoName.Repo) {
        repoName = prevStepData?.connectorRef?.connector?.spec?.url
      } else {
        const connectorScope = getScopeFromValue(initialValues?.spec?.store.spec?.connectorRef)
        if (connectorScope === Scope.ACCOUNT) {
          if (
            initialValues?.spec?.store.spec?.connectorRef ===
            `account.${prevStepData?.connectorRef?.connector?.identifier}`
          ) {
            repoName = initialValues?.spec?.store.spec.repoName
          } else {
            repoName = ''
          }
        } else {
          repoName =
            prevStepData?.connectorRef?.connector?.identifier === initialValues?.spec?.store.spec?.connectorRef
              ? initialValues?.spec?.store.spec.repoName
              : ''
        }
      }
      return repoName
    }
    if (prevStepData?.identifier) {
      if (connectionType === GitRepoName.Repo) {
        repoName = prevStepData?.url
      }
    }
    return repoName
  }

  const getInitialValues = (): ManifestDetailDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        repoName: getRepoName(),
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : specValues.paths?.map((path: string) => ({ path, uuid: uuid(path, nameSpace()) }))
      }
      return values
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [{ path: '', uuid: uuid('', nameSpace()) }],
      skipResourceVersioning: false,
      repoName: getRepoName()
    }
  }

  const submitFormData = (formData: ManifestDetailDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              gitFetchType: formData?.gitFetchType,
              repoName: formData?.repoName,
              paths:
                typeof formData?.paths === 'string'
                  ? formData?.paths
                  : formData?.paths?.map((path: { path: string }) => path.path)
            }
          }
        }
      }
    }
    if (manifestObj?.manifest?.spec?.store) {
      if (formData?.gitFetchType === 'Branch') {
        manifestObj.manifest.spec.store.spec.branch = formData?.branch
      } else if (formData?.gitFetchType === 'Commit') {
        manifestObj.manifest.spec.store.spec.commitId = formData?.commitId
      }
    }

    if (selectedManifest === ManifestDataType.K8sManifest) {
      ;(manifestObj.manifest?.spec as any).skipResourceVersioning = formData?.skipResourceVersioning
    }
    handleSubmit(manifestObj)
  }

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font="large" color={Color.GREY_800}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          identifier: Yup.string()
            .trim()
            .required(getString('validation.identifierRequired'))
            .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
            .notOneOf(StringUtils.illegalIdentifiers),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          paths: Yup.array(
            Yup.object().shape({
              path: Yup.string().trim().required(getString('pipeline.manifestType.pathRequired'))
            })
          ).min(1)
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorRef: prevStepData?.connectorRef
              ? getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.RUNTIME
                ? prevStepData?.connectorRef
                : prevStepData?.connectorRef?.value
              : prevStepData?.identifier
              ? prevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: ManifestDetailDataType }) => (
          <Form>
            <div className={css.manifestDetailsForm}>
              <FormInput.Text
                name="identifier"
                label={getString('pipeline.manifestType.manifestIdentifier')}
                placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
              />
              {connectionType === GitRepoName.Repo && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Text
                    label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                    disabled
                    name="repoName"
                    style={{ width: '370px' }}
                  />
                </div>
              )}

              {!!(connectionType === GitRepoName.Account && accountUrl) && (
                <div>
                  <FormInput.Text
                    label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                    name="repoName"
                    className={css.repoName}
                  />

                  <div
                    style={{ marginBottom: 'var(--spacing-medium)' }}
                  >{`${accountUrl}/${formik.values?.repoName}`}</div>
                </div>
              )}
              <FormInput.Select
                name="gitFetchType"
                label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                items={gitFetchTypes}
              />

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                {formik.values?.gitFetchType === gitFetchTypes[0].value && (
                  <FormInput.MultiTextInput
                    multiTextInputProps={{ expressions }}
                    label={getString('pipelineSteps.deploy.inputSet.branch')}
                    placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                    name="branch"
                    style={{ width: '370px' }}
                  />
                )}
                {getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values?.branch as string}
                    type="String"
                    variableName="branch"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('branch', value)}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                {formik.values?.gitFetchType === gitFetchTypes[1].value && (
                  <FormInput.MultiTextInput
                    multiTextInputProps={{ expressions }}
                    label={getString('pipeline.manifestType.commitId')}
                    placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                    name="commitId"
                    style={{ width: '370px' }}
                  />
                )}
                {getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values?.commitId as string}
                    type="String"
                    variableName="commitId"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => formik.setFieldValue('commitId', value)}
                  />
                )}
              </div>

              <MultiTypeFieldSelector
                defaultValueToReset={defaultValueToReset}
                disableTypeSelection
                name={'paths'}
                label={getString('fileFolderPathText')}
              >
                <FieldArray
                  name="paths"
                  render={arrayHelpers => (
                    <Layout.Vertical>
                      {formik.values?.paths?.map((path: { path: string; uuid: string }, index: number) => (
                        <Layout.Horizontal
                          key={path.uuid}
                          flex={{ distribution: 'space-between' }}
                          style={{ alignItems: 'end' }}
                        >
                          <Layout.Horizontal
                            spacing="medium"
                            style={{ alignItems: 'baseline' }}
                            draggable={true}
                            onDragStart={event => {
                              onDragStart(event, index)
                            }}
                            onDragEnd={onDragEnd}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={event => onDrop(event, arrayHelpers, index)}
                          >
                            {formik.values?.paths?.length > 1 && (
                              <Icon name="drag-handle-vertical" className={css.drag} />
                            )}
                            {formik.values?.paths?.length > 1 && <Text>{`${index + 1}.`}</Text>}
                            <FormInput.MultiTextInput
                              label={''}
                              placeholder={getString('pipeline.manifestType.filePathPlaceholder')}
                              name={`paths[${index}].path`}
                              style={{ width: '330px' }}
                              multiTextInputProps={{
                                expressions,
                                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                              }}
                            />
                          </Layout.Horizontal>
                          {formik.values?.paths?.length > 1 && (
                            <Button minimal icon="minus" onClick={() => arrayHelpers.remove(index)} />
                          )}
                        </Layout.Horizontal>
                      ))}
                      <span>
                        <Button
                          minimal
                          text={getString('addFileText')}
                          intent="primary"
                          className={css.addFileButton}
                          onClick={() => arrayHelpers.push({ path: '', uuid: uuid('', nameSpace()) })}
                        />
                      </span>
                    </Layout.Vertical>
                  )}
                />
              </MultiTypeFieldSelector>
              {!!(selectedManifest === ManifestDataType.K8sManifest) && (
                <Accordion
                  activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                  className={css.advancedStepOpen}
                >
                  <Accordion.Panel
                    id={getString('advancedTitle')}
                    addDomId={true}
                    summary={getString('advancedTitle')}
                    details={
                      <Layout.Horizontal
                        width={'90%'}
                        height={120}
                        flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                      >
                        <FormMultiTypeCheckboxField
                          name="skipResourceVersioning"
                          label={getString('skipResourceVersion')}
                          multiTypeTextbox={{ expressions }}
                          className={cx(css.checkbox, css.halfWidth)}
                        />
                        <Tooltip
                          position="bottom"
                          content={
                            <div className={css.tooltipContent}>
                              {getString('pipeline.manifestType.helmSkipResourceVersion')}{' '}
                            </div>
                          }
                          className={css.tooltip}
                        >
                          <Icon name="info-sign" color={Color.PRIMARY_4} size={16} />
                        </Tooltip>
                      </Layout.Horizontal>
                    }
                  />
                </Accordion>
              )}
            </div>

            <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
              <Button intent="primary" type="submit" text={getString('submit')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default ManifestDetails
