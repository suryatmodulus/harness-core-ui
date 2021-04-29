import React from 'react'
import cx from 'classnames'

import {
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  Button,
  SelectOption
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { Connector, TFPlanFormData } from '../Common/Terraform/TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
interface GitStoreProps {
  formik: FormikProps<TFPlanFormData>
}

const gitFetchTypes: SelectOption[] = [
  { label: 'Latest from branch', value: 'Branch' },
  { label: 'Specific Commit ID', value: 'CommitId' }
]
export default function GitStore(props: GitStoreProps): React.ReactElement {
  const { formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  React.useEffect(() => {
    formik.setFieldValue('spec.configuration.configFiles.store.type', 'Git')
  }, [])
  const connectorValue = formik.values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef as Connector

  return (
    <>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.MultiTextInput
          name="spec.configuration.workspace"
          label={getString('pipelineSteps.workspace')}
          multiTextInputProps={{ expressions }}
        />
        {getMultiTypeFromValue(formik.values.spec?.configuration?.workspace) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values?.spec?.configuration?.workspace as string}
            type="String"
            variableName="spec.configuration.workspace"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              /* istanbul ignore else */
              formik.setFieldValue('values.spec.configuration.workspace', value)
            }}
          />
        )}
      </div>

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
          getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.connectorRef) ===
          MultiTypeInputType.RUNTIME
            ? 200
            : 260
        }
        name="spec.configuration.configFiles.store.spec.connectorRef"
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
          name="spec.configuration.configFiles.store.spec.gitFetchType"
          label={getString('pipeline.manifestType.gitFetchTypeLabel')}
          placeholder={getString('pipeline.manifestType.gitFetchTypeLabel')}
        />
      </div>
      {formik.values?.spec?.configuration?.configFiles?.store?.spec?.gitFetchType === gitFetchTypes[0].value && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            name="spec.configuration.configFiles.store.spec.branch"
            multiTextInputProps={{ expressions }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.branch) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ alignSelf: 'center' }}
              value={formik.values?.spec?.configuration?.configFiles?.store?.spec?.branch as string}
              type="String"
              variableName="spec.configuration.configFiles.store.spec.branch"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('configuration.configFiles.store.spec.branch', value)}
            />
          )}
        </div>
      )}
      {formik.values?.spec?.configuration?.configFiles?.store?.spec?.gitFetchType === gitFetchTypes[1].value && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.commitId')}
            placeholder={getString('pipeline.manifestType.commitPlaceholder')}
            name="spec.configuration.configFiles.store.spec.commitId"
            multiTextInputProps={{ expressions }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.commitId) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ alignSelf: 'center' }}
              value={formik.values?.spec?.configuration?.configFiles?.store?.spec?.commitId as string}
              type="String"
              variableName="spec.configuration.configFiles.store.spec.commitId"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.configuration.configFiles.store.spec.commitId', value)}
            />
          )}
        </div>
      )}
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.MultiTextInput
          label={getString('cd.folderPath')}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          name="spec.configuration.configFiles.store.spec.folderPath"
          multiTextInputProps={{ expressions }}
        />
        {getMultiTypeFromValue(formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ alignSelf: 'center' }}
            value={formik.values?.spec?.configuration?.configFiles?.store?.spec?.folderPath as string}
            type="String"
            variableName="formik.values?.spec?.configuration?.store.spec?.folderPath"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value =>
              formik.setFieldValue('formik.values?.spec?.configuration?.store.spec?.folderPath', value)
            }
          />
        )}
      </div>
      {(connectorValue?.connector?.spec?.connectionType === 'Account' ||
        connectorValue?.connector?.spec?.type === 'Account') && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipelineSteps.repoName')}
            name="spec.configuration.configFiles.store.spec.repoName"
            placeholder={getString('pipelineSteps.repoName')}
            multiTextInputProps={{ expressions }}
          />
        </div>
      )}
    </>
  )
}
