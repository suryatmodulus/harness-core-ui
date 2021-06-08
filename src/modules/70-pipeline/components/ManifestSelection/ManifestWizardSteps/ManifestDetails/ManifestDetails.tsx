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
import { get, set, isEmpty } from 'lodash-es'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'

import { String, useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ManifestDetailDataType } from '../../ManifestInterface'
import {
  gitFetchTypeList,
  GitFetchTypes,
  GitRepoName,
  ManifestDataType,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ManifestDetailsPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  selectedManifest: string
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
}

const ManifestDetails: React.FC<StepProps<ConnectorConfigDTO> & ManifestDetailsPropType> = ({
  stepName,
  selectedManifest,
  expressions,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList
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
    if (getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.RUNTIME) {
      repoName = prevStepData?.connectorRef
    } else if (prevStepData?.connectorRef) {
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
      return repoName
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
              paths:
                typeof formData?.paths === 'string'
                  ? formData?.paths
                  : formData?.paths?.map((path: { path: string }) => path.path)
            }
          }
        }
      }
    }
    if (connectionType === GitRepoName.Account) {
      set(manifestObj, 'manifest.spec.store.spec.repoName', formData?.repoName)
    }

    if (manifestObj?.manifest?.spec?.store) {
      if (formData?.gitFetchType === 'Branch') {
        set(manifestObj, 'manifest.spec.store.spec.branch', formData?.branch)
      } else if (formData?.gitFetchType === 'Commit') {
        set(manifestObj, 'manifest.spec.store.spec.commitId', formData?.commitId)
      }
    }

    if (selectedManifest === ManifestDataType.K8sManifest) {
      set(manifestObj, 'manifest.spec.skipResourceVersioning', formData?.skipResourceVersioning)
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
        formName="manifestDetails"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueIdentifier')
          ),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          paths: Yup.lazy(
            (value): Yup.Schema<unknown> => {
              if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                return Yup.array().of(
                  Yup.object().shape({
                    path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                  })
                )
              }
              return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
            }
          ),
          repoName: Yup.string().test('repoName', getString('pipeline.manifestType.reponameRequired'), value => {
            if (connectionType === GitRepoName.Repo) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
          })
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
        {(formik: { setFieldValue: (a: string, b: string) => void; values: ManifestDetailDataType }) => {
          const skipResourceVersionRunTime =
            getMultiTypeFromValue(formik.values?.skipResourceVersioning) === MultiTypeInputType.RUNTIME
          const skipResourceVersionClsName = !skipResourceVersionRunTime ? css.tooltipCls : ''
          return (
            <Form>
              <div className={css.manifestDetailsForm}>
                <FormInput.Text
                  name="identifier"
                  label={getString('pipeline.manifestType.manifestIdentifier')}
                  placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                />

                {!!(connectionType === GitRepoName.Account && accountUrl) && (
                  <div className={css.repoName}>
                    <div className={cx(stepCss.formGroup)}>
                      <FormInput.MultiTextInput
                        multiTextInputProps={{ expressions }}
                        label={getString('pipelineSteps.build.create.repositoryNameLabel')}
                        placeholder={getString('pipeline.manifestType.repoNamePlacefolder')}
                        name="repoName"
                        className={css.reponameField}
                      />
                      {getMultiTypeFromValue(formik.values?.repoName) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values?.repoName as string}
                          type="String"
                          variableName="repoName"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          style={{ marginTop: 10 }}
                          onChange={value => formik.setFieldValue('repoName', value)}
                        />
                      )}
                    </div>

                    {getMultiTypeFromValue(formik.values?.repoName) === MultiTypeInputType.FIXED && (
                      <>
                        <String stringID="common.git.gitAccountUrl" className={css.accountUrl} />:
                        <span className={css.repoNameUrl}>{`${accountUrl}`}</span>
                      </>
                    )}
                  </div>
                )}
                <FormInput.Select
                  name="gitFetchType"
                  label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                  items={gitFetchTypeList}
                />

                {formik.values?.gitFetchType === GitFetchTypes.Branch && (
                  <div className={cx(stepCss.formGroup)}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{ expressions }}
                      label={getString('pipelineSteps.deploy.inputSet.branch')}
                      placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                      name="branch"
                      style={{ width: 370 }}
                    />

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
                )}

                {formik.values?.gitFetchType === GitFetchTypes.Commit && (
                  <div className={cx(stepCss.formGroup)}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{ expressions }}
                      label={getString('pipeline.manifestType.commitId')}
                      placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                      name="commitId"
                      style={{ width: 370 }}
                    />

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
                )}
                <div className={cx(stepCss.formGroup)}>
                  <MultiTypeFieldSelector
                    defaultValueToReset={defaultValueToReset}
                    name={'paths'}
                    label={
                      <Text>
                        {selectedManifest === ManifestDataType.K8sManifest
                          ? getString('fileFolderPathText')
                          : getString('common.git.filePath')}
                      </Text>
                    }
                    style={{ width: 370 }}
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
                                <Icon name="drag-handle-vertical" className={css.drag} />
                                <Text>{`${index + 1}.`}</Text>
                                <FormInput.MultiTextInput
                                  label={''}
                                  placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                                  name={`paths[${index}].path`}
                                  style={{ width: 312 }}
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
                  {getMultiTypeFromValue(formik.values.paths) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      value={formik.values.paths}
                      type={getString('list')}
                      variableName={'paths'}
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={val => formik?.setFieldValue('paths', val)}
                    />
                  )}
                </div>
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
                          height={90}
                          flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
                        >
                          <FormMultiTypeCheckboxField
                            name="skipResourceVersioning"
                            label={getString('skipResourceVersion')}
                            multiTypeTextbox={{ expressions }}
                            className={css.checkbox}
                          />
                          {getMultiTypeFromValue(formik.values?.skipResourceVersioning) ===
                            MultiTypeInputType.RUNTIME && (
                            <ConfigureOptions
                              value={formik.values?.skipResourceVersioning ? 'true' : 'false'}
                              type="String"
                              variableName="skipResourceVersioning"
                              showRequiredField={false}
                              showDefaultField={false}
                              showAdvanced={true}
                              onChange={value => formik.setFieldValue('skipResourceVersioning', value)}
                              style={{ alignSelf: 'center' }}
                              className={css.addmarginTop}
                            />
                          )}
                          <Tooltip
                            position="bottom"
                            content={
                              <div className={css.tooltipContent}>
                                {getString('pipeline.manifestType.helmSkipResourceVersion')}{' '}
                              </div>
                            }
                            className={cx(css.tooltip, skipResourceVersionClsName)}
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
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default ManifestDetails
