/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useEffect, useMemo } from 'react'
import { FormInput, SelectOption } from '@wings-software/uicore'
import type { Feature } from 'services/cf'
import { useStrings } from 'framework/strings'
import { CFPipelineInstructionType } from '@cf/components/PipelineSteps/FlagConfigurationStep/types'
import SubSection, { SubSectionProps } from '../SubSection'

export interface DefaultRulesProps extends SubSectionProps {
  variations?: Feature['variations']
  setField: (fieldName: string, value: unknown) => void
  prefix: (fieldName: string) => string
}

const DefaultRules: FC<DefaultRulesProps> = ({ variations = [], setField, prefix, ...props }) => {
  const { getString } = useStrings()

  const items = useMemo<SelectOption[]>(
    () =>
      variations.map(variation => ({
        label: variation.name || variation.identifier,
        value: variation.identifier
      })),
    [variations]
  )

  useEffect(() => {
    setField('identifier', `${CFPipelineInstructionType.SET_DEFAULT_VARIATIONS}Identifier`)
    setField('type', CFPipelineInstructionType.SET_DEFAULT_VARIATIONS)
  }, [])

  return (
    <SubSection data-testid="flagChanges-defaultRules" {...props}>
      <FormInput.Select
        name={prefix('spec.on')}
        items={items}
        label={getString('cf.pipeline.flagConfiguration.whenTheFlagIsOnServe')}
      />
      <FormInput.Select
        name={prefix('spec.off')}
        items={items}
        label={getString('cf.pipeline.flagConfiguration.whenTheFlagIsOffServe')}
      />
    </SubSection>
  )
}

export default DefaultRules
