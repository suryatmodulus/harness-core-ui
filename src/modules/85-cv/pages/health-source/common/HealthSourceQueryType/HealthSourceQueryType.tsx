import React from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { QueryType } from './HealthSourceQueryType.types'

export const HealthSourceQueryType = () => {
  const { getString } = useStrings()
  return (
    <FormInput.RadioGroup
      label={getString('cv.componentValidations.queryTypeLabel' as keyof StringsMap)} //name={getString('cv.componentValidations.queryTypeName' as keyof StringsMap)}
      name="queryType"
      items={[
        {
          label: QueryType.SERVICE_BASED,
          value: QueryType.SERVICE_BASED
        },
        {
          label: QueryType.HOST_BASED,
          value: QueryType.HOST_BASED
        }
      ]}
    />
  )
}
