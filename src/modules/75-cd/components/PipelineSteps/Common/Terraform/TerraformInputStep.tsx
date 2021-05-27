import React from 'react'

import { getMultiTypeFromValue, MultiTypeInputType, FormInput, FormikForm, Text, Button } from '@wings-software/uicore'

import Map from '@common/components/Map/Map'
import List from '@common/components/List/List'

import { useStrings } from 'framework/strings'

import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import type { TerraformProps } from './TerraformInterfaces'
import ConfigInputs from './InputSteps/ConfigSection'
import TfVarSection from './InputSteps/TfVarSection'

export default function TerraformInputStep(props: TerraformProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, path } = props
  return (
    <FormikForm>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name={`${path}.spec.provisionerIdentifier`}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${path}.timeout`}
          disabled={readonly}
        />
      )}
      <ConfigInputs {...props} />
      {inputSetData?.template?.spec?.configuration?.spec?.varFiles?.length && <TfVarSection {...props} />}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.backendConfig?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <FormInput.TextArea name={`${path}.varFile.spec.content`} label={getString('cd.backEndConfig')} />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.targets as string) ===
        MultiTypeInputType.RUNTIME && (
        <List
          name={`${path}.spec.targets`}
          label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.environmentVariables as string) ===
        MultiTypeInputType.RUNTIME && (
        <Map
          name={`${path}.spec.environmentVariables`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }}>
              {getString('environmentVariables')}
              <Button
                icon="question"
                minimal
                tooltip={getString('environmentVariablesInfo')}
                iconProps={{ size: 14 }}
              />
            </Text>
          }
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
    </FormikForm>
  )
}
