import { FormInput } from '@wings-software/uicore'
import React from 'react'
import { HTTPRequestMethod } from './HealthSourceHTTPRequestMethod.types'

export const HealthSourceHTTPRequestMethod = () => {
  return (
    <FormInput.RadioGroup
      label={'Request Method'}
      name={'requestMethod'}
      items={[
        {
          label: HTTPRequestMethod.GET,
          value: HTTPRequestMethod.GET
        },
        {
          label: HTTPRequestMethod.POST,
          value: HTTPRequestMethod.POST
        }
      ]}
    />
  )
}
