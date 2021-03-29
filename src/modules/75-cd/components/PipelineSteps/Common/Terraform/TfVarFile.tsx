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

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { PathInterface, TerraformData, VarFileArray } from './TerraformInterfaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
  onHide: () => void
  onSubmit: (values: any) => void
}

const storeTypes: SelectOption[] = [
  { label: 'Inline', value: 'Inline' },
  { label: 'Remote File', value: 'Remote' }
]

const gitFetchTypes: SelectOption[] = [
  { label: 'Latest from branch', value: 'Branch' },
  { label: 'Specific Commit ID', value: 'CommitId' }
]

export default function TfVarFile(props: TfVarFileProps): React.ReactElement {
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const defaultValues: VarFileArray = {
    type: ''
  }

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
            name: Yup.string().required(getString('pipelineSteps.stepNameRequired'))
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
                {formik.values.type === 'Remote' && (
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
                          placeholder={getString('manifestType.branchPlaceholder')}
                          name="store.spec.branch"
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
                          label={getString('manifestType.commitId')}
                          placeholder={getString('manifestType.commitPlaceholder')}
                          name="store.spec.commitId"
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
                                  <FormInput.MultiTextInput name={`spec.paths[${i}].path`} label="" />
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
                                Add TF Var file
                              </Button>
                            </div>
                          )
                        }}
                      />
                    </MultiTypeFieldSelector>
                  </>
                )}
                {formik.values.type === 'Inline' && (
                  <FormInput.TextArea name="store.spec.content" label={getString('pipelineSteps.content')} />
                )}
                <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                  <Button
                    type={'submit'}
                    intent={'primary'}
                    text={getString('addFile')}
                    onClick={() => {
                      props.onSubmit(formik.values)
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
