import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { TerraformData, TerraformVariableStepProps } from '../TerraformInterfaces'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'

export function ConfigVariables(props: TerraformVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformData, metadataMap, initialValues } = props
  const { getString } = useStrings()

  return (
    <>
      <VariablesListTable
        data={variablesData?.spec?.configuration?.spec}
        originalData={initialValues.spec?.configuration?.spec}
        metadataMap={metadataMap}
      />
      <VariablesListTable
        data={variablesData?.spec?.configuration?.spec?.configFiles?.store?.spec}
        originalData={initialValues.spec?.configuration?.spec?.configFiles?.store?.spec}
        metadataMap={metadataMap}
      />
      <Text className={css.stepTitle}>{getString('cd.terraformVarFiles')}</Text>
      {variablesData?.spec?.configuration?.spec?.varFiles?.map((varFile, index) => (
        <VariablesListTable
          key={index}
          data={varFile?.varFile?.spec}
          originalData={initialValues?.spec?.configuration?.spec?.varFiles?.[index] || ({} as any)}
          metadataMap={metadataMap}
        />
      ))}
    </>
  )
}
