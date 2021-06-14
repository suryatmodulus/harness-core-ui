import React from 'react'
import { Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { TerraformData, TerraformVariableStepProps, TerraformStoreTypes } from './TerraformInterfaces'
import { ConfigVariables } from './Variableview/ConfigSection'
import css from './TerraformStep.module.scss'

export function TerraformVariableStep(props: TerraformVariableStepProps): React.ReactElement {
  const { variablesData = {} as TerraformData, metadataMap, initialValues } = props

  const { getString } = useStrings()
  return (
    <>
      {initialValues?.spec?.configuration?.type === 'Inline' ||
        (props?.stepType === 'TerrafomPlan' && (
          <>
            <Text className={css.stepTitle}>{getString('pipelineSteps.configFiles')}</Text>

            <VariablesListTable
              data={variablesData.spec?.provisionerIdentifier}
              originalData={initialValues.spec?.provisionerIdentifier}
              metadataMap={metadataMap}
            />
            <ConfigVariables {...props} />
            <Text className={css.stepTitle}>{getString('pipelineSteps.backendConfig')}</Text>
            <VariablesListTable
              data={variablesData.spec?.configuration?.spec?.backendConfig}
              originalData={initialValues.spec?.configuration?.spec?.backendConfig?.spec}
              metadataMap={metadataMap}
            />
            <Text className={css.stepTitle}>{getString('pipeline.targets.title')}</Text>
            <VariablesListTable
              data={variablesData.spec?.configuration?.spec?.targets}
              originalData={initialValues.spec?.configuration?.spec?.targets}
              metadataMap={metadataMap}
            />
            <Text className={css.stepTitle}>{getString('environmentVariables')}</Text>

            <VariablesListTable
              data={variablesData.spec?.configuration?.spec?.environmentVariables}
              originalData={initialValues.spec?.configuration?.spec?.environmentVariables}
              metadataMap={metadataMap}
            />
          </>
        ))}
      {initialValues?.spec?.configuration?.type !== TerraformStoreTypes.Inline && (
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
