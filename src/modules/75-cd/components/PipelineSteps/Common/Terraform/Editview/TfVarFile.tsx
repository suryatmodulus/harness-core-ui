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
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { PathInterface, TerraformStoreTypes, VarFileArray } from '../TerraformInterfaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
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
    varFile: {
      type: ''
    }
  }

  const storeTypes: SelectOption[] = [
    { label: getString('inline'), value: getString('inline') },
    { label: getString('pipelineSteps.remoteFile'), value: getString('remote') }
  ]

  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]

  // formik?.values?.spec?.configuration?.spec?.varFiles?
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
                    name="varFile.type"
                    label={getString('pipelineSteps.storeType')}
                    placeholder={getString('pipelineSteps.storeType')}
                  />
                </div>
                {formik.values.varFile?.type?.toLowerCase() === TerraformStoreTypes.Remote.toLowerCase() && (
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
                      type={['Git', 'Github', 'Gitlab', 'Bitbucket']}
                      width={
                        getMultiTypeFromValue(formik.values?.varFile?.store?.spec?.connectorRef) ===
                        MultiTypeInputType.RUNTIME
                          ? 200
                          : 260
                      }
                      name="varFile.store.spec.connectorRef"
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
                        name="varFile.store.spec.gitFetchType"
                        label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                        placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
                      />
                    </div>

                    {formik.values?.varFile?.store?.spec?.gitFetchType === gitFetchTypes[0].value && (
                      <div className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormInput.MultiTextInput
                          label={getString('pipelineSteps.deploy.inputSet.branch')}
                          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
                          name="varFile.store.spec.branch"
                          multiTextInputProps={{ expressions }}
                        />
                        {getMultiTypeFromValue(formik.values?.varFile?.store?.spec?.branch) ===
                          MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ alignSelf: 'center' }}
                            value={formik.values?.varFile?.store?.spec?.branch as string}
                            type="String"
                            variableName="varFile.store.spec.branch"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik.setFieldValue('varFile.store.spec.branch', value)}
                          />
                        )}
                      </div>
                    )}

                    {formik.values?.varFile?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
                      <div className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormInput.MultiTextInput
                          label={getString('pipeline.manifestType.commitId')}
                          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
                          name="varFile.store.spec.commitId"
                          multiTextInputProps={{ expressions }}
                        />
                        {getMultiTypeFromValue(formik.values?.varFile?.store?.spec?.commitId) ===
                          MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ alignSelf: 'center' }}
                            value={formik.values?.varFile?.store?.spec?.commitId as string}
                            type="String"
                            variableName="varFile.store.spec.commitId"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik.setFieldValue('varFile.store.spec.commitId', value)}
                          />
                        )}
                      </div>
                    )}
                    <MultiTypeFieldSelector
                      name="varFile.store.spec.paths"
                      label={getString('filePaths')}
                      style={{ width: '200' }}
                      disableTypeSelection
                    >
                      <FieldArray
                        name="varFile.store.spec.paths"
                        render={({ push, remove }) => {
                          return (
                            <div>
                              {(formik.values?.varFile?.store?.spec?.paths || []).map(
                                (path: PathInterface, i: number) => (
                                  <div key={`${path}-${i}`} className={css.pathRow}>
                                    <FormInput.MultiTextInput name={`varFile.store.spec.paths[${i}].path`} label="" />
                                    <Button
                                      minimal
                                      icon="trash"
                                      data-testid={`remove-header-${i}`}
                                      onClick={() => remove(i)}
                                    />
                                  </div>
                                )
                              )}
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
                {formik.values.varFile?.type?.toLowerCase() === TerraformStoreTypes.Inline.toLowerCase() && (
                  <FormInput.TextArea name="varFile.spec.content" label={getString('pipelineSteps.content')} />
                )}
                <Layout.Horizontal spacing={'medium'} margin={{ top: 'huge' }}>
                  <Button
                    type={'submit'}
                    intent={'primary'}
                    text={getString('addFile')}
                    onClick={() => {
                      if (formik.values.varFile?.type?.toLowerCase() === TerraformStoreTypes.Remote.toLowerCase()) {
                        const formObject = formik.values

                        delete formObject.varFile.store?.spec?.content

                        const payload = {
                          varFile: {
                            type: formObject.varFile.type,
                            store: {
                              ...formObject.varFile.store,
                              type: formObject?.varFile?.store?.spec?.connectorRef?.connector?.type,
                              spec: {
                                ...formObject.varFile.store?.spec,
                                connectorRef: formObject?.varFile?.store?.spec?.connectorRef
                                  ? getMultiTypeFromValue(formObject?.varFile?.store?.spec?.connectorRef) ===
                                    MultiTypeInputType.RUNTIME
                                    ? formObject?.varFile?.store?.spec?.connectorRef
                                    : formObject?.varFile?.store?.spec?.connectorRef?.value
                                  : ''
                              }
                            }
                          }
                        }
                        if (formObject.varFile.store?.spec?.paths?.length) {
                          payload.varFile.store.spec['paths'] = formObject.varFile.store?.spec?.paths?.map(
                            (item: PathInterface) => item.path
                          ) as any
                        }
                        props.onSubmit(payload)
                      } else {
                        const formObject = formik.values
                        delete formObject.varFile?.store

                        props.onSubmit(formObject)
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
