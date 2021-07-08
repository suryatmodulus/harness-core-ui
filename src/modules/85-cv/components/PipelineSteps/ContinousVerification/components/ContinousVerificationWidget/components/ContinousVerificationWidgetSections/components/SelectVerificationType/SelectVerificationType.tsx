import React from 'react'
import { FormInput, SelectOption } from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import Card from '@cv/components/Card/Card'
import { continousVerificationTypes } from './constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function SelectVerificationType(): React.ReactElement {
  const { getString } = useStrings()
  return (
    <Card>
      <div className={cx(stepCss.formGroup)}>
        <FormInput.Select
          name="spec.type"
          label={getString('connectors.cdng.continousVerificationType')}
          items={continousVerificationTypes as SelectOption[]}
        />
      </div>
    </Card>
  )
}
