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

  if (initialValues?.spec?.configuration?.type === 'Inline') {
    return (
      <>
        <VariablesListTable
          data={variablesData.spec?.provisionerIdentifier}
          originalData={initialValues.spec?.provisionerIdentifier}
          metadataMap={metadataMap}
        />
        <ConfigVariables {...props} />

        {variablesData?.spec?.configuration?.spec?.backendConfig?.spec && (
          <>
            <Text className={css.stepTitle}>{getString('pipelineSteps.backendConfig')}</Text>
            <VariablesListTable
              data={variablesData.spec?.configuration?.spec?.backendConfig?.spec}
              originalData={initialValues.spec?.configuration?.spec?.backendConfig?.spec}
              metadataMap={metadataMap}
            />
          </>
        )}
        {variablesData.spec?.configuration?.spec?.environmentVariables && (
          <Text className={css.stepTitle}>{getString('environmentVariables')}</Text>
        )}
        {((variablesData?.spec?.configuration?.spec?.environmentVariables as []) || [])?.map((envVar, index) => {
          return (
            <VariablesListTable
              key={envVar}
              data={variablesData.spec?.configuration?.spec?.environmentVariables?.[index]}
              originalData={initialValues.spec?.configuration?.spec?.environmentVariables?.[index]}
              metadataMap={metadataMap}
            />
          )
        })}
      </>
    )
  } else if (initialValues?.spec?.configuration?.type !== TerraformStoreTypes.Inline) {
    return (
      <>
        <VariablesListTable data={variablesData.spec} originalData={initialValues.spec} metadataMap={metadataMap} />

        <VariablesListTable
          data={variablesData.spec?.configuration?.type}
          originalData={initialValues.spec?.configuration?.type}
          metadataMap={metadataMap}
        />
      </>
    )
  }

  return <div />
}
