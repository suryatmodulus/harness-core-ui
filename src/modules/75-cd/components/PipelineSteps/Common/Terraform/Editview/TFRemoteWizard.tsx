import {
  Button,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  StepProps
} from '@wings-software/uicore'
import React from 'react'
import cx from 'classnames'
import { FieldArray, Form } from 'formik'

import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import type { PathInterface } from '../TerraformInterfaces'
import css from './TerraformVarfile.module.scss'

export const TFRemoteWizard: React.FC<StepProps<any>> = ({ previousStep }) => {
  const { getString } = useStrings()
  const initialValues = {
    varFile: {
      store: {
        spec: {
          gitFetchType: '',
          branch: '',
          commitId: '',
          paths: []
        }
      }
    }
  }
  const { expressions } = useVariablesExpression()

  const gitFetchTypes: SelectOption[] = [
    { label: getString('gitFetchTypes.fromBranch'), value: getString('pipelineSteps.deploy.inputSet.branch') },
    { label: getString('gitFetchTypes.fromCommit'), value: getString('pipelineSteps.commitIdValue') }
  ]
  return (
    <Layout.Vertical padding={'huge'} className={css.tfVarStore}>
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        {formik => {
          return (
            <Form>
              <div className={css.tfRemoteForm}>
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
                          {(formik.values?.varFile?.store?.spec?.paths || []).map((path: PathInterface, i: number) => (
                            <div key={`${path}-${i}`} className={css.pathRow}>
                              <FormInput.MultiTextInput name={`varFile.store.spec.paths[${i}].path`} label="" />
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
              </div>

              <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.()}
                  data-name="jiraBackButton"
                />
                <Button type="submit" intent="primary" text={getString('submit')} rightIcon="chevron-right" />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
