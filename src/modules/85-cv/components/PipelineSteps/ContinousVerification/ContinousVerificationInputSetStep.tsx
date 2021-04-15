import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput, FormikForm } from '@wings-software/uicore'
import { FormGroup } from '@blueprintjs/core'
import { isEmpty } from 'lodash-es'
import type { StepViewType } from '@pipeline/exports'

import { useStrings } from 'framework/exports'
import type { ContinousVerificationData, ContinousVerificationFormData } from './continousVerificationTypes'

interface ContinousVerificationProps {
  initialValues: ContinousVerificationFormData
  onUpdate?: (data: ContinousVerificationFormData) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ContinousVerificationData
  path?: string
}

export function ContinousVerificationInputSetStep(props: ContinousVerificationProps): React.ReactElement {
  const { template, path, readonly } = props
  const { getString } = useStrings()

  return (
    <FormikForm>
      {getMultiTypeFromValue(template?.spec?.spec?.sensitivity) === MultiTypeInputType.RUNTIME ? (
        <FormGroup label={getString('sensitivity')}>
          <FormInput.Text disabled={readonly} name={`${isEmpty(path) ? '' : `${path}.`}spec.sensitivity`} />
        </FormGroup>
      ) : null}

      {getMultiTypeFromValue(template?.spec?.spec?.duration) === MultiTypeInputType.RUNTIME ? (
        <FormGroup label={getString('cv.connectors.cdng.duration')}>
          <FormInput.Text disabled={readonly} name={`${isEmpty(path) ? '' : `${path}.`}spec.duration`} />
        </FormGroup>
      ) : null}

      {getMultiTypeFromValue(template?.spec?.spec?.baseline) === MultiTypeInputType.RUNTIME ? (
        <FormGroup label={getString('cv.connectors.cdng.baseline')}>
          <FormInput.Text disabled={readonly} name={`${isEmpty(path) ? '' : `${path}.`}spec.baseline`} />
        </FormGroup>
      ) : null}
    </FormikForm>
  )
}
