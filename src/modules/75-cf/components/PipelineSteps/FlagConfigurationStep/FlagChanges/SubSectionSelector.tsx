import React, { FC } from 'react'
import { ButtonSize, ButtonVariation, FontVariation, Heading, Layout } from '@wings-software/uicore'
import { OptionsMenuButton } from '@common/components'
import { StringKeys, useStrings } from 'framework/strings'
import type { SubSectionProps } from './SubSection'
import css from './SubSectionSelector.module.scss'

export interface SubSectionSelectorProps {
  availableSubSections: FC<SubSectionProps>[]
  currentSubSection: FC<SubSectionProps>
  onSubSectionChange: (newSubSection: FC<SubSectionProps>) => void
}

export const subSectionNameMap: Record<string, StringKeys> = {
  SetFlagSwitch: 'cf.pipeline.flagConfiguration.setFlagSwitch',
  DefaultRules: 'cf.featureFlags.rules.defaultRules',
  ServeVariationToIndividualTarget: 'cf.pipeline.flagConfiguration.serveVariationToIndividualTarget',
  ServeVariationToTargetGroup: 'cf.pipeline.flagConfiguration.serveVariationToTargetGroup',
  ServePercentageRollout: 'cf.pipeline.flagConfiguration.servePercentageRollout'
}

const SubSectionSelector: FC<SubSectionSelectorProps> = ({
  availableSubSections,
  currentSubSection,
  onSubSectionChange
}) => {
  const { getString } = useStrings()

  const items = availableSubSections.map(subSection => ({
    onClick: () => onSubSectionChange(subSection),
    text: getString(subSectionNameMap[subSection.name])
  }))

  return (
    <Layout.Horizontal className={css.wrapper}>
      <Heading level={6} font={{ variation: FontVariation.H6 }} className={css.heading}>
        {getString(subSectionNameMap[currentSubSection.name])}
      </Heading>
      {!!items.length && (
        <OptionsMenuButton
          items={items}
          icon="chevron-down"
          variation={ButtonVariation.ICON}
          size={ButtonSize.SMALL}
          tooltipProps={{ isDark: false, interactionKind: 'click', position: 'bottom-right', minimal: true }}
        />
      )}
    </Layout.Horizontal>
  )
}

export default SubSectionSelector
