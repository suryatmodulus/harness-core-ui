/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { FormInput, getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'

import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { TerraformData } from '../TerraformInterfaces'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface BaseFormProps {
  formik: FormikProps<TerraformData>
  configurationTypes: SelectOption[]
  showCommand?: boolean
}

export default function BaseForm(props: BaseFormProps): React.ReactElement {
  const {
    formik: { values, setFieldValue },
    configurationTypes,
    showCommand
  } = props
  const { getString } = useStrings()

  return (
    <>
      <div className={cx(stepCss.formGroup, stepCss.md)}>
        <FormInput.MultiTextInput
          name="spec.provisionerIdentifier"
          label={getString('pipelineSteps.provisionerIdentifier')}
        />
        {getMultiTypeFromValue(values.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={values.spec?.provisionerIdentifier as string}
            type="String"
            variableName="spec.provisionerIdentifier"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={value => {
              setFieldValue('spec.provisionerIdentifier', value)
            }}
          />
        )}
      </div>

      {!showCommand && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.Select
            items={configurationTypes}
            name="spec.configuration.type"
            label={getString('pipelineSteps.configurationType')}
            placeholder={getString('pipelineSteps.configurationType')}
          />
        </div>
      )}
      {showCommand && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.Select
            items={configurationTypes}
            name="spec.configuration.command"
            label={getString('commandLabel')}
            placeholder={getString('commandLabel')}
          />
        </div>
      )}
    </>
  )
}
