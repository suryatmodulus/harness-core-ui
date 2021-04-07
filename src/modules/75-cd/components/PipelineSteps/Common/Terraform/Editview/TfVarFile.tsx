import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import {
  Layout,
  Formik,
  FormInput,
  Text,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@wings-software/uicore'

import { FieldArray } from 'formik'
import type { FormikProps } from 'formik'

import { Dialog, Classes } from '@blueprintjs/core'

import { useParams } from 'react-router-dom'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { PathInterface, TerraformData, TerraformStoreTypes, VarFileArray } from '../TerraformInterfaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
  onHide: () => void
  onSubmit: (values: any) => void
}

export default function TfVarFile(props: TfVarFileProps): React.ReactElement {
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { expressions } = useVariablesExpression()

  const defaultValues: VarFileArray = {
    type: ''
  }

  const storeTypes: SelectOption[] = [
    { label: getString('inline'), value: getString('inline') },
    { label: getString('pipelineSteps.remoteFile'), value: getString('remote') }
  ]

  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]

  return (
    <Dialog
      isOpen={true}
      title={getString('pipelineSteps.addTerraformVarFile')}
      onClose={props.onHide}
      className={cx(css.dialog, Classes.DIALOG)}
      style={{ minWidth: 700, minHeight: 600 }}
    >
      <Layout.Vertical padding={'huge'}>
        <Formik<VarFileArray>
          onSubmit={props.onHide}
          initialValues={defaultValues}
          validationSchema={Yup.object().shape({
            type: Yup.string().required(getString('pipelineSteps.storeTypeRequired')),
            spec: Yup.object().shape({
              store: Yup.object().shape({
                spec: Yup.object().shape({
                  connectorRef: Yup.string().required(getString('pipelineSteps.build.create.connectorRequiredError')),
                  branch: Yup.string().when('gitFetchType', {
                    is: getString('pipelineSteps.deploy.inputSet.branch'),
                    then: Yup.string().trim().required(getString('validation.branchName'))
                  }),
                  commitId: Yup.string().when('gitFetchType', {
                    is: getString('pipelineSteps.commitIdValue'),
                    then: Yup.string().trim().required(getString('validation.commitId'))
                  })
                })
              })
            })
          })}
        >
          {(formik: FormikProps<VarFileArray>) => {
            return (
              <>
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.Select
                    items={storeTypes}
                    name="type"
                    label={getString('pipelineSteps.storeType')}
                    placeholder={getString('pipelineSteps.storeType')}
                  />
                </div>
                {formik.values.type === TerraformStoreTypes.Remote && (
                  <>
                    <FormMultiTypeConnectorField
                      label={
                        <Text style={{ display: 'flex', alignItems: 'center' }}>
                          {getString('connectors.title.gitConnector')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('connectors.title.gitConnector')}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                      }
                      type={'Git'}
                      width={
                        getMultiTypeFromValue(formik.values?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME
                          ? 200
                          : 260
                      }
                      name="store.spec.connectorRef"
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      style={{ marginBottom: 10 }}
                      multiTypeProps={{ expressions }}
                    />

                    <div className={cx(stepCss.formGroup, stepCss.md)}>
                      <FormInput.Select
                        items={gitFetchTypes}
                        name="store.spec.gitFetchType"
                        label={getString('pipelineSteps.gitFetchType')}
                        placeholder={getString('pipelineSteps.gitFetchType')}
                      />
                    </div>

                    {formik.values?.store?.spec?.gitFetchType === gitFetchTypes[0].value && (
                      <div className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormInput.MultiTextInput
                          label={getString('pipelineSteps.deploy.inputSet.branch')}
                          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                          name="store.spec.branch"
                          multiTextInputProps={{ expressions }}
                        />
                        {getMultiTypeFromValue(formik.values?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ alignSelf: 'center' }}
                            value={formik.values?.store?.spec?.branch as string}
                            type="String"
                            variableName="store.spec.branch"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik.setFieldValue('store.spec.branch', value)}
                          />
                        )}
                      </div>
                    )}

                    {formik.values?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
                      <div className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormInput.MultiTextInput
                          label={getString('pipeline.manifestType.commitId')}
                          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                          name="store.spec.commitId"
                          multiTextInputProps={{ expressions }}
                        />
                        {getMultiTypeFromValue(formik.values?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ alignSelf: 'center' }}
                            value={formik.values?.store?.spec?.commitId as string}
                            type="String"
                            variableName="store.spec.commitId"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik.setFieldValue('store.spec.commitId', value)}
                          />
                        )}
                      </div>
                    )}
                    <MultiTypeFieldSelector
                      name="store.spec.paths"
                      label={getString('filePaths')}
                      style={{ width: '200' }}
                      disableTypeSelection
                    >
                      <FieldArray
                        name="store.spec.paths"
                        render={({ push, remove }) => {
                          return (
                            <div>
                              {(formik.values?.store?.spec?.paths || []).map((path: PathInterface, i: number) => (
                                <div key={`${path}-${i}`} className={css.pathRow}>
                                  <FormInput.MultiTextInput name={`store.spec.paths[${i}].path`} label="" />
                                  <Button
                                    minimal
                                    icon="trash"
                                    data-testid={`remove-header-${i}`}
                                    onClick={() => remove(i)}
                                  />
                                </div>
                              ))}
                              <Button
                                icon="plus"
                                minimal
                                intent="primary"
                                data-testid="add-header"
                                onClick={() => push({ path: '' })}
                              >
                                {getString('pipelineSteps.addTFVarFileLabel')}
                              </Button>
                            </div>
                          )
                        }}
                      />
                    </MultiTypeFieldSelector>
                  </>
                )}
                {formik.values.type === TerraformStoreTypes.Inline && (
                  <FormInput.TextArea name="store.spec.content" label={getString('pipelineSteps.content')} />
                )}
                <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                  <Button
                    type={'submit'}
                    intent={'primary'}
                    text={getString('addFile')}
                    onClick={() => {
                      const tfValues = formik.values
                      if (formik.values.type === TerraformStoreTypes.Remote) {
                        const payload = {
                          ...tfValues,
                          store: {
                            type: 'Git',
                            ...formik.values.store
                          }
                        }
                        props.onSubmit(payload)
                      } else {
                        props.onSubmit(formik.values)
                      }
                    }}
                  />
                  <Button text={getString('cancel')} onClick={props.onHide} />
                </Layout.Horizontal>
              </>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Dialog>
  )
}
