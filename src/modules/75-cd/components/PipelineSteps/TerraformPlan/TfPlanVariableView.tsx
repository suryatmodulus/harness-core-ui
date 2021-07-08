import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { TFPlanFormData, TerraformPlanVariableStepProps } from '../Common/Terraform/TerraformInterfaces'
import { ConfigVariables } from './Variableview/TfPlanConfigSection'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'

export function TerraformVariableStep(props: TerraformPlanVariableStepProps): React.ReactElement {
  const { variablesData = {} as TFPlanFormData, metadataMap, initialValues } = props

  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable
        data={variablesData.spec?.provisionerIdentifier}
        originalData={initialValues.spec?.provisionerIdentifier}
        metadataMap={metadataMap}
      />
      <ConfigVariables {...props} />
      {variablesData?.spec?.configuration?.backendConfig?.spec && (
        <>
          <Text className={css.stepTitle}>{getString('pipelineSteps.backendConfig')}</Text>
          <VariablesListTable
            data={variablesData?.spec?.configuration?.backendConfig?.spec}
            originalData={initialValues.spec?.configuration?.backendConfig?.spec}
            metadataMap={metadataMap}
          />
        </>
      )}

      {variablesData?.spec?.configuration?.environmentVariables && (
        <Text className={css.stepTitle}>{getString('environmentVariables')}</Text>
      )}
      {((variablesData?.spec?.configuration?.environmentVariables as []) || [])?.map((envVar, index) => {
        return (
          <VariablesListTable
            key={envVar}
            data={variablesData.spec?.configuration?.environmentVariables?.[index]}
            originalData={initialValues.spec?.configuration?.environmentVariables?.[index]}
            metadataMap={metadataMap}
          />
        )
      })}
    </>
  )
}
