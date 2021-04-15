import React from 'react'

import { getMultiTypeFromValue, MultiTypeInputType, FormInput, FormikForm, Text, Button } from '@wings-software/uicore'

import { isEmpty } from 'lodash-es'
import Map from '@common/components/Map/Map'
import List from '@common/components/List/List'

import { useStrings } from 'framework/exports'

import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import type { TerraformProps } from './TerraformInterfaces'
import ConfigInputs from './InputSteps/ConfigSection'

export default function TerraformInputStep(props: TerraformProps): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly } = props

  return (
    <FormikForm>
      {getMultiTypeFromValue(inputSetData?.template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
        <FormInput.Text
          name="spec.provisionerIdentifier"
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          disabled={readonly}
        />
      )}
      <ConfigInputs {...props} />

      {getMultiTypeFromValue(inputSetData?.template?.spec?.targets as string) === MultiTypeInputType.RUNTIME && (
        <List
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.targets`}
          label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('cf.targets.title')}</Text>}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.environmentVariables as string) ===
        MultiTypeInputType.RUNTIME && (
        <Map
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.environmentVariables`}
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
