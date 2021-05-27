import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { TerraformPlanData, TerraformPlanVariableStepProps } from '../../Common/Terraform/TerraformInterfaces'

export function ConfigVariables(props: TerraformPlanVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformPlanData, metadataMap, initialValues } = props
  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable
        data={variablesData?.spec?.configuration}
        originalData={initialValues.spec?.configuration}
        metadataMap={metadataMap}
      />
      <VariablesListTable
        data={variablesData?.spec?.configuration?.configFiles}
        originalData={initialValues.spec?.configuration?.configFiles}
        metadataMap={metadataMap}
      />

      <VariablesListTable
        data={variablesData?.spec?.configuration?.configFiles?.store?.spec}
        originalData={initialValues.spec?.configuration?.configFiles?.store?.spec}
        metadataMap={metadataMap}
      />
      <Text>{getString('pipelineSteps.terraformVarFiles')}</Text>
      {variablesData?.spec?.configuration?.varFiles?.map((varFile, index) => (
        <VariablesListTable
          key={index}
          data={varFile?.varFile?.spec}
          originalData={initialValues?.spec?.configuration?.varFiles?.[index] || ({} as any)}
          metadataMap={metadataMap}
        />
      ))}
    </>
  )
}
