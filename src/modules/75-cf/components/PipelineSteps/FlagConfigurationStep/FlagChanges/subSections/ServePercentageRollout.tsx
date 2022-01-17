/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useState } from 'react'
import { get } from 'lodash-es'
import type { Segment, TargetAttributesResponse, Variation } from 'services/cf'
import PercentageRollout from '@cf/components/PercentageRollout/PercentageRollout'
import type { FlagConfigurationStepFormDataValues } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection, { SubSectionProps } from '../SubSection'
import { CFPipelineInstructionType } from '../../types'

export interface ServePercentageRolloutProps extends SubSectionProps {
  targetGroups?: Segment[]
  variations?: Variation[]
  fieldValues?: FlagConfigurationStepFormDataValues
  targetAttributes?: TargetAttributesResponse
  clearField: (fieldName: string) => void
  setField: (fieldName: string, value: unknown) => void
  prefix: (fieldName: string) => string
}

const ServePercentageRollout: FC<ServePercentageRolloutProps> = ({
  variations = [],
  targetGroups = [],
  fieldValues,
  targetAttributes = [],
  clearField,
  setField,
  prefix,
  ...props
}) => {
  const [initialLoad, setInitialLoad] = useState<boolean>(true)

  useEffect(() => {
    setField('identifier', 'AddRuleIdentifier')
    setField('type', CFPipelineInstructionType.ADD_RULE)
    setField('spec.priority', 100)
    setField('spec.distribution.clauses[0].op', 'segmentMatch')
    setField('spec.distribution.clauses[0].attribute', '')
  }, [])

  useEffect(() => {
    if (!initialLoad) {
      clearField('spec.distribution.variations')
    }

    variations.forEach(({ identifier }, index) => {
      setField(`spec.distribution.variations[${index}].variation`, identifier)

      if (!initialLoad) {
        setField(`spec.distribution.variations[${index}].weight`, Math.floor(100 / variations?.length || 1))
      }
    })

    if (!initialLoad && variations?.length % 2) {
      setField(
        `spec.distribution.variations[${variations?.length - 1}].weight`,
        Math.ceil(100 / variations?.length || 1)
      )
    }
    setInitialLoad(false)
  }, [variations, setInitialLoad])

  return (
    <SubSection data-testid="flagChanges-servePercentageRollout" {...props}>
      <PercentageRollout
        targetGroups={targetGroups}
        variations={variations}
        fieldValues={get(fieldValues, prefix('spec.distribution'))}
        prefix={(fieldName: string) => prefix(`spec.distribution.${fieldName}`)}
        bucketByAttributes={targetAttributes}
      />
    </SubSection>
  )
}

export default ServePercentageRollout
