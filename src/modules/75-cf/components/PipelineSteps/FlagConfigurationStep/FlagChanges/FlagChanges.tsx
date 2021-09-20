import React, { FC, ReactElement, useState, MouseEvent, useMemo } from 'react'
import { Layout, Button, Heading, FontVariation, ButtonVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { SubSectionProps } from './SubSection'
import RemoveSubSectionButton from './RemoveSubSectionButton'
import SubSectionSelector from './SubSectionSelector'

// sub sections
import SetFlagSwitch from './subSections/SetFlagSwitch'
import DefaultRules from './subSections/DefaultRules'
import ServeVariationToIndividualTarget from './subSections/ServeVariationToIndividualTarget'
import ServeVariationToTargetGroup from './subSections/ServeVariationToTargetGroup'
import ServePercentageRollout from './subSections/ServePercentageRollout'

export const allSubSections: FC<SubSectionProps>[] = [
  SetFlagSwitch,
  DefaultRules,
  ServeVariationToIndividualTarget,
  ServeVariationToTargetGroup,
  ServePercentageRollout
]

export default function FlagChanges(): ReactElement {
  const [subSections, setSubSections] = useState<FC<SubSectionProps>[]>([SetFlagSwitch])
  const availableSubSections = useMemo<FC<SubSectionProps>[]>(
    () => allSubSections.filter(section => !subSections.includes(section)),
    [subSections]
  )
  const { getString } = useStrings()

  const handleConfigureMore = (e: MouseEvent): void => {
    e.preventDefault()
    const [newSubsection] = availableSubSections
    setSubSections([...subSections, newSubsection])
  }

  const removeSubSection = (subSection: FC<SubSectionProps>): void => {
    const newSubSections = [...subSections]
    newSubSections.splice(newSubSections.indexOf(subSection), 1)

    setSubSections(newSubSections)
  }

  const swapSubSection = (currentSubSection: FC<SubSectionProps>, newSubSection: FC<SubSectionProps>): void => {
    const newSubSections = [...subSections]
    newSubSections.splice(newSubSections.indexOf(currentSubSection), 1, newSubSection)

    setSubSections(newSubSections)
  }

  return (
    <Layout.Vertical spacing="medium">
      <Heading level={5} font={{ variation: FontVariation.H5 }}>
        {getString('cf.pipeline.flagConfiguration.flagChanges')}
      </Heading>

      {subSections.map(SubSection => {
        const subSectionProps: SubSectionProps = {
          subSectionSelector: (
            <SubSectionSelector
              availableSubSections={availableSubSections}
              currentSubSection={SubSection}
              onSubSectionChange={newSubSection => swapSubSection(SubSection, newSubSection)}
            />
          )
        }

        if (subSections.length > 1) {
          subSectionProps.removeSubSectionButton = (
            <RemoveSubSectionButton onClick={() => removeSubSection(SubSection)} />
          )
        }

        return <SubSection key={SubSection.name} {...subSectionProps} />
      })}

      {!!availableSubSections.length && (
        <div>
          <Button
            variation={ButtonVariation.LINK}
            text={getString('cf.pipeline.flagConfiguration.configureMore')}
            onClick={handleConfigureMore}
            style={{ padding: 0 }}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}
