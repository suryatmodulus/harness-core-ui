import React from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { HTTPRequestMethod } from './HTTPRequestMethod.types'
import { CustomHealthValidationPathFieldNames } from '../../CustomHealthValidationPath.constants'

export const HTTPRequestMethodOption = ({ onChange }: { onChange?: (val: HTTPRequestMethod) => void }) => {
  const { getString } = useStrings()
  return (
    <FormInput.RadioGroup
      radioGroup={{ inline: true }}
      label={getString('connectors.requestMethod')}
      name={CustomHealthValidationPathFieldNames.REQUEST_METHOD}
      onChange={e => onChange?.(e.currentTarget.value as HTTPRequestMethod)}
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
