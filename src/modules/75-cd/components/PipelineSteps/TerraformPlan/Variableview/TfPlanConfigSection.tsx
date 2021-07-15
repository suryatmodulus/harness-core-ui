import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { RemoteTerraformVarFileSpec } from 'services/cd-ng'

import type { TerraformPlanData, TerraformPlanVariableStepProps } from '../../Common/Terraform/TerraformInterfaces'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'

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
      {variablesData?.spec?.configuration?.configFiles?.store?.spec?.gitFetchType && (
        <>
          <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>
          <VariablesListTable
            data={variablesData?.spec?.configuration?.configFiles?.store?.spec}
            originalData={initialValues.spec?.configuration?.configFiles?.store?.spec}
            metadataMap={metadataMap}
          />
        </>
      )}
      {variablesData?.spec?.configuration?.varFiles?.length && (
        <>
          <Text className={css.stepTitle}>{getString('cd.terraformVarFiles')}</Text>
          {variablesData?.spec?.configuration?.varFiles?.map((varFile, index) => {
            if (varFile?.varFile?.type === 'Inline') {
              return (
                <VariablesListTable
                  key={index}
                  data={variablesData?.spec?.configuration?.varFiles?.[index]?.varFile?.spec}
                  originalData={initialValues?.spec?.configuration?.varFiles?.[index]?.varFile?.spec || ({} as any)}
                  metadataMap={metadataMap}
                />
              )
            } else if (varFile?.varFile?.type === 'Remote') {
              const remoteSpec = variablesData?.spec?.configuration?.varFiles?.[index]?.varFile
                ?.spec as RemoteTerraformVarFileSpec
              const initVarSpec = initialValues?.spec?.configuration?.varFiles?.[index]?.varFile
                ?.spec as RemoteTerraformVarFileSpec
              return (
                <VariablesListTable
                  key={index}
                  data={remoteSpec?.store?.spec}
                  originalData={initVarSpec?.store?.spec || ({} as any)}
                  metadataMap={metadataMap}
                />
              )
            }
          })}
        </>
      )}
    </>
  )
}
