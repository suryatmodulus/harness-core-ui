import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { TerraformData, TerraformVariableStepProps, TerraformStoreTypes } from './TerraformInterfaces'
import { ConfigVariables } from './Variableview/ConfigSection'

export function TerraformVariableStep(props: TerraformVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformData, metadataMap, initialValues } = props

  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable data={variablesData} originalData={initialValues} metadataMap={metadataMap} />
      {initialValues?.spec?.configuration?.type === 'Inline' ||
        (props?.stepType === 'TerrafomPlan' && (
          <>
            <Text>{getString('pipelineSteps.configFiles')}</Text>

            <VariablesListTable
              data={variablesData.spec?.provisionerIdentifier}
              originalData={initialValues.spec?.provisionerIdentifier}
              metadataMap={metadataMap}
            />
            <ConfigVariables {...props} />
            <Text>{getString('pipelineSteps.backendConfig')}</Text>
            <VariablesListTable
              data={variablesData.spec?.backendConfig?.spec}
              originalData={initialValues.spec?.backendConfig?.spec}
              metadataMap={metadataMap}
            />
            <Text>{getString('cf.targets.title')}</Text>
            <VariablesListTable
              data={variablesData.spec?.targets}
              originalData={initialValues.spec?.targets}
              metadataMap={metadataMap}
            />
            <Text>{getString('environmentVariables')}</Text>

            <VariablesListTable
              data={variablesData.spec?.environmentVariables}
              originalData={initialValues.spec?.environmentVariables}
              metadataMap={metadataMap}
            />
          </>
        ))}
      {initialValues?.spec?.configuration?.type === TerraformStoreTypes.Remote && (
        <>
          <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />

          <VariablesListTable
            data={variablesData.spec?.configuration?.type}
            originalData={initialValues.spec?.configuration?.type}
            metadataMap={metadataMap}
          />
        </>
      )}
    </>
  )
}
