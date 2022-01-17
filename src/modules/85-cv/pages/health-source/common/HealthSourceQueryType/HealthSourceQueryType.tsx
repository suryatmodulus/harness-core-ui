/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { QueryType } from './HealthSourceQueryType.types'

export const HealthSourceQueryType = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <FormInput.RadioGroup
      label={getString('cv.componentValidations.queryTypeLabel' as keyof StringsMap)}
      radioGroup={{ inline: true }}
      name="queryType"
      items={[
        {
          label: 'Service Based',
          value: QueryType.SERVICE_BASED
        },
        {
          label: 'Host Based',
          value: QueryType.HOST_BASED
        }
      ]}
    />
  )
}
