import React from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { HTTPRequestMethod } from './HealthSourceHTTPRequestMethod.types'

export const HealthSourceHTTPRequestMethod = () => {
  const { getString } = useStrings()
  return (
    <FormInput.RadioGroup
      label={getString('cv.componentValidations.httpRequestMethodLabel' as keyof StringsMap)}
      name="requestMethod"
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
