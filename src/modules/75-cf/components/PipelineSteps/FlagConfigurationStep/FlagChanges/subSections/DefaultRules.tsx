import React, { FC, useEffect, useMemo } from 'react'
import { FormInput, SelectOption } from '@wings-software/uicore'
import type { Feature } from 'services/cf'
import { useStrings } from 'framework/strings'
import SubSection, { SubSectionProps } from '../SubSection'

export interface DefaultRulesProps extends SubSectionProps {
  variations?: Feature['variations']
  clearField: (fieldName: string) => void
}

const DefaultRules: FC<DefaultRulesProps> = ({ variations = [], clearField, ...props }) => {
  const { getString } = useStrings()

  const items = useMemo<SelectOption[]>(
    () =>
      variations.map(variation => ({
        label: variation.name || variation.identifier,
        value: variation.identifier
      })),
    [variations]
  )

  useEffect(
    () => () => {
      clearField('spec.defaultRules.on')
      clearField('spec.defaultRules.off')
    },
    []
  )

  return (
    <SubSection data-testid="flagChanges-defaultRules" {...props}>
      <FormInput.Select
        name="spec.defaultRules.on"
        items={items}
        label={getString('cf.pipeline.flagConfiguration.whenTheFlagIsOnServe')}
      />
      <FormInput.Select
        name="spec.defaultRules.off"
        items={items}
        label={getString('cf.pipeline.flagConfiguration.whenTheFlagIsOffServe')}
      />
    </SubSection>
  )
}

export default DefaultRules
