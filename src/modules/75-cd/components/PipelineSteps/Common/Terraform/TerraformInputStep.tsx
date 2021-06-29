import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'

import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  FormikForm,
  Text,
  Container,
  Color,
  Label
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import List from '@common/components/List/List'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TerraformData, TerraformProps, TerraformStoreTypes } from './TerraformInterfaces'
import ConfigInputs from './InputSteps/ConfigSection'
import TFRemoteSection from './InputSteps/TFRemoteSection'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TerraformInputStep<T extends TerraformData = TerraformData>(
  props: TerraformProps<T>
): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, path } = props
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm>
      {getMultiTypeFromValue((inputSetData?.template as TerraformData)?.spec?.provisionerIdentifier) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.provisionerIdentifier`}
            label={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions,
              disabled: readonly
            }}
          />
        </div>
      )}
      {inputSetData?.template?.spec?.configuration?.spec?.configFiles?.store?.spec?.connectorRef && (
        <Label style={{ color: Color.GREY_900 }}>{getString('cd.configurationFile')}</Label>
      )}
      <ConfigInputs {...props} />
      {inputSetData?.template?.spec?.configuration?.spec?.varFiles?.length && (
        <Label style={{ color: Color.GREY_900 }}>{getString('cd.terraformVarFiles')}</Label>
      )}
      {inputSetData?.template?.spec?.configuration?.spec?.varFiles?.map((varFile: any, index) => {
        if (varFile?.varFile?.type === TerraformStoreTypes.Inline) {
          return (
            <>
              <Container flex width={120}>
                <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
                {varFile?.varFile?.identifier}
              </Container>

              {getMultiTypeFromValue(varFile?.varFile?.spec?.content) === MultiTypeInputType.RUNTIME && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.content`}
                    label={getString('pipelineSteps.content')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                    }}
                  />
                </div>
              )}
            </>
          )
        } else if (varFile.varFile?.type === TerraformStoreTypes.Remote) {
          return <TFRemoteSection remoteVar={varFile} index={index} {...props} />
        }
      })}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.backendConfig?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.TextArea
          name={`${path}.spec.configuration.spec.backendConfig.spec.content`}
          label={getString('cd.backEndConfig')}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.targets as string) ===
        MultiTypeInputType.RUNTIME && (
        <List
          name={`${path}.spec.configuration.spec.targets`}
          label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          expressions={expressions}
        />
      )}
    </FormikForm>
  )
}
