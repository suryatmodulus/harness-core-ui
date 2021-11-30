import {
  FormInput,
} from '@wings-software/uicore'
import React from 'react'
import { QueryType } from './HealthSourceQueryType.types'


export const HealthSourceQueryType = () => {
  return (
   
    <FormInput.RadioGroup
      label={'Query Type'}
      name={'queryType'}
      items={[
          {
            label: QueryType.SERVICE_BASED,
            value: QueryType.SERVICE_BASED,
          },
          {
            label: QueryType.HOST_BASED,
            value: QueryType.HOST_BASED,
          }
        ]}        
      />
  )
}
