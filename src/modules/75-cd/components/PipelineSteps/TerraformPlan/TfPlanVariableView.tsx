import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { TerraformPlanData, TerraformPlanVariableStepProps } from '../Common/Terraform/TerraformInterfaces'
import { ConfigVariables } from './Variableview/TfPlanConfigSection'

export function TerraformVariableStep(props: TerraformPlanVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformPlanData, metadataMap, initialValues } = props

  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable data={variablesData} originalData={initialValues} metadataMap={metadataMap} />
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
          data={variablesData?.spec?.configuration?.backendConfig}
          originalData={initialValues.spec?.backendConfig?.spec}
          metadataMap={metadataMap}
        />
        <Text>{getString('pipeline.targets.title')}</Text>
        <VariablesListTable
          data={variablesData.spec?.configuration?.targets}
          originalData={initialValues.spec?.targets}
          metadataMap={metadataMap}
        />
        <Text>{getString('environmentVariables')}</Text>

        <VariablesListTable
          data={variablesData.spec?.configuration?.environmentVariables}
          originalData={initialValues.spec?.environmentVariables}
          metadataMap={metadataMap}
        />
      </>
    </>
  )
}
