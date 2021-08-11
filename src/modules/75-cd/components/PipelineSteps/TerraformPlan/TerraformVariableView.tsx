import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { TerraformPlanData, TerraformPlanVariableStepProps } from '../Common/Terraform/TerraformInterfaces'
import { ConfigVariables } from './Variableview/ConfigSection'
import css from '@cd/components/PipelineSteps/Common/Terraform/TerraformStep.module.scss'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export function TerraformVariableStep(props: TerraformPlanVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformPlanData, metadataMap, initialValues } = props

  const { getString } = useStrings()
  return (
    <>
      <VariablesListTable
        className={pipelineVariableCss.variablePaddingL2}
        data={variablesData}
        originalData={initialValues}
        metadataMap={metadataMap}
      />
      <>
        <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>

        <VariablesListTable
          data={variablesData.spec?.provisionerIdentifier}
          originalData={initialValues.spec?.provisionerIdentifier}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL2}
        />
        <ConfigVariables {...props} />
        <Text className={css.stepTitle}>{getString('pipelineSteps.backendConfig')}</Text>
        <VariablesListTable
          data={variablesData?.spec?.configuration?.backendConfig}
          originalData={initialValues.spec?.backendConfig?.spec}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL2}
        />
        <Text className={css.stepTitle}>{getString('pipeline.targets.title')}</Text>
        <VariablesListTable
          data={variablesData.spec?.configuration?.targets}
          originalData={initialValues.spec?.targets}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL2}
        />
        <Text className={css.stepTitle}>{getString('environmentVariables')}</Text>

        <VariablesListTable
          data={variablesData.spec?.configuration?.environmentVariables}
          originalData={initialValues.spec?.environmentVariables}
          metadataMap={metadataMap}
          className={pipelineVariableCss.variablePaddingL2}
        />
      </>
    </>
  )
}
