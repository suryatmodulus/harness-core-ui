import React from 'react'
import cx from 'classnames'

import {
  Color,
  FormInput,
  getMultiTypeFromValue,
  Label,
  MultiTypeInputType,
  Container,
  Text
} from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { TerraformPlanProps, TerraformStoreTypes } from '../../Common/Terraform/TerraformInterfaces'
import RemoteVarSection from './RemoteVarSection'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TfVarFile(props: TerraformPlanProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, path } = props

  const { expressions } = useVariablesExpression()

  return (
    <>
      <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
        {getString('cd.terraformVarFiles')}
      </Label>
      {inputSetData?.template?.spec?.configuration?.varFiles?.map((varFile: any, index) => {
        if (varFile?.varFile?.type === TerraformStoreTypes.Inline) {
          return (
            <React.Fragment key={`${path}.spec.configuration.varFiles[${index}]`}>
              <Container flex width={150} padding={{ bottom: 'small' }}>
                <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
                {varFile?.varFile?.identifier}
              </Container>
              {getMultiTypeFromValue(varFile?.varFile?.spec?.content) === MultiTypeInputType.RUNTIME && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    name={`${path}.spec.configuration.varFiles[${index}].varFile.spec.content`}
                    label={getString('pipelineSteps.content')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        } else if (varFile.varFile?.type === TerraformStoreTypes.Remote) {
          return <RemoteVarSection remoteVar={varFile} index={index} {...props} />
        }
      })}
    </>
  )
}
