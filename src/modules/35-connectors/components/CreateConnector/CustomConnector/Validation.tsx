import React, { useEffect } from 'react'

import { Container, FormInput } from '@wings-software/uicore'

// eslint-disable-next-line no-restricted-imports
import { HealthSourceHTTPRequestMethod } from '@cv/pages/health-source/common/HealthSourceHTTPRequestMethod/HealthSourceHTTPRequestMethod'
// eslint-disable-next-line no-restricted-imports
import { HTTPRequestMethod } from '@cv/pages/health-source/common/HealthSourceHTTPRequestMethod/HealthSourceHTTPRequestMethod.types'
import css from './ValidationPath.module.scss'

export function ValidationProps(props: any): JSX.Element {
  const { type, formik } = props
  useEffect(() => {
    if (type) {
      formik.setFieldValue('requestMethod', type)
    }
  }, [type])
  return (
    <Container>
      <HealthSourceHTTPRequestMethod />
      <FormInput.Text label="path" name="validationpath" />
      {formik.values.requestMethod === HTTPRequestMethod.POST && (
        <FormInput.TextArea className={css.httpRequestMethodPostBodyTextArea} label="body" name="validationBody" />
      )}
    </Container>
  )
}
