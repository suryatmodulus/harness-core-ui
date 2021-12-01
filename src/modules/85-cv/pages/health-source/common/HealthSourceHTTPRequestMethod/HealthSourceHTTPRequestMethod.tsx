import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import React from 'react'
import type { StringsMap } from 'stringTypes'
import { HTTPRequestMethod } from './HealthSourceHTTPRequestMethod.types'

export const HealthSourceHTTPRequestMethod = () => {
  const { getString } = useStrings()
  return (
    <FormInput.RadioGroup
      label={getString('cv.componentValidations.httpRequestMethodLabel' as keyof StringsMap)}
      name={getString('cv.componentValidations.httpRequestMethodName' as keyof StringsMap)}
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
