import React, { FC } from 'react'
import { ButtonSize, ButtonVariation, FontVariation, Heading, Layout } from '@wings-software/uicore'
import { OptionsMenuButton } from '@common/components'
import { StringKeys, useStrings } from 'framework/strings'
import type { SubSectionComponent } from './FlagChangesForm'
import css from './SubSectionSelector.module.scss'

export interface SubSectionSelectorProps {
  subSectionNameMap: Map<SubSectionComponent, StringKeys>
  availableSubSections: SubSectionComponent[]
  currentSubSection: SubSectionComponent
  onSubSectionChange: (newSubSection: SubSectionComponent) => void
}

const SubSectionSelector: FC<SubSectionSelectorProps> = ({
  subSectionNameMap,
  availableSubSections,
  currentSubSection,
  onSubSectionChange
}) => {
  const { getString } = useStrings()

  const items = availableSubSections.map(subSection => ({
    onClick: () => onSubSectionChange(subSection),
    text: getString(subSectionNameMap.get(subSection) as StringKeys)
  }))

  return (
    <Layout.Horizontal className={css.wrapper}>
      <Heading level={6} font={{ variation: FontVariation.H6 }} className={css.heading}>
        {getString(subSectionNameMap.get(currentSubSection) as StringKeys)}
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
