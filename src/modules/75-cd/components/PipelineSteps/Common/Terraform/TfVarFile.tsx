import React from 'react'
import cx from 'classnames'

import {
  FormInput,
  Text,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'

import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/exports'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { TerraformData } from './TerraformIntefaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformVarfile.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
  onHide: () => void
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
  const { formik } = props
  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  return (
    <Dialog
      isOpen={true}
      title={getString('pipelineSteps.addTerraformVarFile')}
      onClose={props.onHide}
      className={cx(css.dialog, Classes.DIALOG)}
    >
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
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.Select
              items={gitFetchTypes}
              name="spec.gitFetchType"
              label={getString('pipelineSteps.gitFetchType')}
              placeholder={getString('pipelineSteps.gitFetchType')}
            />
          </div>

          {formik.values?.spec?.configuration?.spec?.store?.spec?.gitFetchType === gitFetchTypes[0].value && (
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                label={getString('pipelineSteps.deploy.inputSet.branch')}
                placeholder={getString('manifestType.branchPlaceholder')}
                name="spec.branch"
              />
              {getMultiTypeFromValue(formik.values?.spec?.configuration?.spec?.store?.spec?.branch) ===
                MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ alignSelf: 'center' }}
                  value={formik.values?.spec?.configuration?.spec?.store?.spec?.branch as string}
                  type="String"
                  variableName="spec.branch"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => formik.setFieldValue('spec.branch', value)}
                />
              )}
            </div>
          )}

          {formik.values?.spec?.configuration?.spec?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
            <div className={cx(stepCss.formGroup, stepCss.md)}>
              <FormInput.MultiTextInput
                label={getString('manifestType.commitId')}
                placeholder={getString('manifestType.commitPlaceholder')}
                name="spec.commitId"
              />
              {getMultiTypeFromValue(formik.values?.spec?.configuration?.spec?.store?.spec?.commitId) ===
                MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ alignSelf: 'center' }}
                  value={formik.values?.spec?.configuration?.spec?.store?.spec?.commitId as string}
                  type="String"
                  variableName="spec.commitId"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => formik.setFieldValue('spec.commitId', value)}
                />
              )}
            </div>
          )}
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
              getMultiTypeFromValue(formik.values?.spec?.configuration?.spec?.store?.spec?.connectorRef) ===
              MultiTypeInputType.RUNTIME
                ? 200
                : 260
            }
            name="spec.connectorRef"
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            style={{ marginBottom: 0 }}
          />
        </>
      )}

      {formik.values.type === 'Inline' && <FormInput.TextArea name="spec.content" />}
    </Dialog>
  )
}
